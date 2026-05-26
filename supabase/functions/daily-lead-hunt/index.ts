// supabase/functions/daily-lead-hunt/index.ts
//
// Daily Camelot Lead Hunt â€” Supabase Edge Function (Deno runtime).
//
// What it does:
//   1. Opens a `lead_hunt_runs` row to log the run.
//   2. Loads enabled sources from `lead_hunt_sources`.
//   3. For each source, calls Claude with the source config + a prompt
//      derived from Camelot's boutique-fit criteria (20-300 units, condo
//      boards, new dev sponsor handoffs, distress, suburban tri-state, FL).
//   4. Dedupes candidates against existing rows in `buildings` (by address +
//      target name) and inserts net-new rows with stage='lead', lead_source,
//      lead_priority, etc. â€” so they appear in the Pipeline Kanban
//      immediately via the existing usePipeline()/useBuildings() hooks.
//   5. Sends an HTML digest email to dgoldoff@camelot.nyc via merlin@camelot.nyc.
//   6. Closes the run row with counts.
//
// Deploy:
//   supabase functions deploy daily-lead-hunt --no-verify-jwt
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase secrets set MERLIN_GOOGLE_CLIENT_ID=...
//   supabase secrets set MERLIN_GOOGLE_CLIENT_SECRET=...
//   supabase secrets set MERLIN_GMAIL_REFRESH_TOKEN=...
//   supabase secrets set MERLIN_EMAIL_ADDRESS=merlin@camelot.nyc
//   supabase secrets set DIGEST_TO=dgoldoff@camelot.nyc
//
// Trigger:
//   - Scheduled daily at 06:00 ET by pg_cron (see migration 007).
//   - Manually via: curl -X POST https://<project>.supabase.co/functions/v1/daily-lead-hunt \
//                        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
//                        -H "Content-Type: application/json" \
//                        -d '{"triggered_by":"manual"}'
//   - From the OS UI via the "Run Now" button on the Daily Hunt page.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1";
import { merlinSend } from "../_shared/gmail_merlin.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
// const RESEND_KEY    = Deno.env.get("RESEND_API_KEY")!; // Resend fallback retained below.
const DIGEST_TO     = Deno.env.get("DIGEST_TO") ?? "dgoldoff@camelot.nyc";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const claude   = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ----- Boutique-fit criteria the bot must honour --------------------------
const CAMELOT_BRIEF = `
Camelot Realty Group is a boutique NYC property management + brokerage firm.
We manage buildings from individual units up to ~300 units. Clients:
family offices, private equity, individual landlords, condo/co-op boards,
office and retail owners, developers needing opening-team rollout.

Geographies: NYC five boroughs, Westchester County NY, Fairfield County CT,
Northern NJ, South Jersey, and statewide Florida.

ONLY return leads that fit boutique scale. Skip mega-developer projects
(Waldorf, Sony Tower, Pfizer HQ, Flatiron, NYCHA PACT, HPD Mitchell-Lama
mega-portfolios). Favour:
  - 9 to 300 unit boutique condo/co-op buildings
  - sponsor-to-board transitions on new luxury condos
  - boards unhappy with current PM (compliance failures, remote-only mgmt)
  - SIRS-stressed Florida associations needing replacement mgmt
  - small PM firms for sale (< $10M revenue)
  - distressed assets we can manage interim
  - family offices and small PE with single-asset real estate
  - law / CPA / brokerage referral channels

For each lead return JSON:
{
  "target_name": "...",
  "address": "...",
  "city": "...",
  "state": "...",
  "developer_or_owner": "...",
  "unit_count": 24,
  "status": "Closings underway, board imminent",
  "lead_category": "new_dev_manhattan" | "new_dev_brooklyn" | "new_dev_queens" |
                   "self_managed" | "distress" | "competitive_takeaway" |
                   "suburban" | "florida" | "pm_acquisition" |
                   "family_office" | "referral_channel",
  "lead_priority": "HIGH" | "MEDIUM" | "LOW",
  "lead_pitch_angle": "one sentence why Camelot fits",
  "lead_contact_path": "who to email / call",
  "lead_source_url": "https://..."
}
`.trim();

// ----- Source query templates --------------------------------------------
function promptForSource(src: SourceRow): string {
  const focus: Record<string, string> = {
    cityrealty_new_dev:        "New residential condo developments in NYC delivering 2026-2027 with 9-300 units. Pull project name, address, developer, unit count, sales status.",
    nyyimby_new_dev:           "NYC outer borough boutique condo projects delivering 2026-2027, 50-300 units.",
    cnyc_small_buildings:      "Identify NYC co-op or condo boards <30 units that are circulating an RFP or expressing dissatisfaction with current management.",
    habitat_mag:               "Habitat Magazine recent coverage of NYC boards changing property managers, RFPs, fired managers, compliance fines.",
    cooperator_news:           "CooperatorNews NYC stories about boards in transition, capital project disputes, manager replacements.",
    flagstar_auction:          "Status of the 5,100-unit Flagstar Bank Ch 11 rent-stabilized portfolio auction. Identify likely bidders and timing.",
    nyc_dob_bis:               "NYC DOB BIS buildings with 5+ open ECB/OATH violations in last 12 months under 50 units.",
    nyc_ll97_dashboard:        "NYC buildings facing 2024-2026 Local Law 97 penalty exposure under 300 units.",
    bizbuysell_ny_pm:          "NY-based property management firms currently listed for sale under $10M revenue.",
    bizquest_nj_pm:            "NJ property management firms for sale under $10M revenue.",
    bizquest_fl_pm:            "FL property management firms for sale under $10M revenue.",
    fcap_fl_associations:      "Florida condo associations 50-300 units that lost their manager or are facing SIRS / milestone non-compliance.",
    njbiz_hoa:                 "Northern + South NJ new condo/HOA projects 50-300 units delivering 2026-2027.",
    westchester_bizj:          "Westchester County new luxury condo/co-op projects 50-300 units delivering 2026-2027.",
    nyc_public_admin:          "NYC public administrator estate properties in probate that need interim property management.",
    streeteasy_sponsor_units:  "NYC co-ops with large unsold sponsor unit inventory needing rental management.",
    kimi_deep_research:        "Run the full Camelot boutique lead hunt across NYC, Westchester, Fairfield CT, Northern NJ, South Jersey, and Florida. Return ALL categories.",
  };

  return `${CAMELOT_BRIEF}\n\nSource: ${src.display_name} (${src.slug})\nFocus: ${focus[src.slug] ?? src.display_name}\n\nReturn a JSON array of leads. No prose, no markdown â€” just the array.`;
}

interface SourceRow {
  slug: string; display_name: string; category: string;
  geo_coverage: string[]; default_priority: string;
  enabled: boolean; config: Record<string, unknown>;
}
interface LeadCandidate {
  target_name: string; address: string; city?: string; state?: string;
  developer_or_owner?: string; unit_count?: number; status?: string;
  lead_category: string; lead_priority: "HIGH"|"MEDIUM"|"LOW";
  lead_pitch_angle: string; lead_contact_path?: string; lead_source_url?: string;
}

// ----- Main handler ------------------------------------------------------
Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const triggeredBy = body.triggered_by ?? "api";

  const { data: run, error: runErr } = await supabase
    .from("lead_hunt_runs")
    .insert({ triggered_by: triggeredBy, sources_queried: [] })
    .select().single();
  if (runErr) return new Response(`run insert failed: ${runErr.message}`, { status: 500 });

  const { data: sources } = await supabase
    .from("lead_hunt_sources").select("*").eq("enabled", true);

  let totalCandidates = 0, totalNew = 0, totalDupes = 0;
  const errors: { source: string; message: string }[] = [];
  const sourcesQueried: string[] = [];

  for (const src of (sources ?? []) as SourceRow[]) {
    sourcesQueried.push(src.slug);
    try {
      const resp = await claude.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [{ role: "user", content: promptForSource(src) }],
      });
      const text = resp.content.find(c => c.type === "text")?.text ?? "[]";
      const jsonStart = text.indexOf("[");
      const jsonEnd   = text.lastIndexOf("]");
      const candidates: LeadCandidate[] = jsonStart >= 0
        ? JSON.parse(text.slice(jsonStart, jsonEnd + 1))
        : [];
      totalCandidates += candidates.length;

      for (const c of candidates) {
        // Dedupe by (address) OR (target_name + developer)
        const { data: existing } = await supabase
          .from("buildings")
          .select("id")
          .or(`address.ilike.${escapeIlike(c.address)},name.ilike.${escapeIlike(c.target_name)}`)
          .limit(1);
        if (existing && existing.length > 0) { totalDupes++; continue; }

        const { error: insErr } = await supabase.from("buildings").insert({
          name:              c.target_name,
          address:           c.address,
          city:              c.city,
          state:             c.state,
          unit_count:        c.unit_count,
          stage:             "lead",
          status:            c.status,
          lead_source:       src.slug,
          lead_category:     c.lead_category,
          lead_priority:     c.lead_priority,
          lead_pitch_angle:  c.lead_pitch_angle,
          lead_contact_path: c.lead_contact_path,
          lead_source_url:   c.lead_source_url,
          lead_found_at:     new Date().toISOString(),
          lead_run_id:       run.id,
          // attribution-friendly extras
          source:            src.display_name,
          notes:             `Sourced by Camelot Daily Lead Hunt (${src.slug}). ${c.lead_pitch_angle}`,
        });
        if (insErr) errors.push({ source: src.slug, message: insErr.message });
        else        totalNew++;
      }

      await supabase.from("lead_hunt_sources")
        .update({ last_run_at: new Date().toISOString(), last_status: "ok" })
        .eq("slug", src.slug);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({ source: src.slug, message: msg });
      await supabase.from("lead_hunt_sources")
        .update({ last_run_at: new Date().toISOString(), last_status: `error: ${msg.slice(0, 200)}` })
        .eq("slug", src.slug);
    }
  }

  // --- Build + send the digest email ---
  const { data: todaysLeads } = await supabase
    .from("buildings").select("*")
    .eq("lead_run_id", run.id)
    .order("lead_priority").order("lead_category");

  const emailHtml = renderDigestHtml(todaysLeads ?? []);
  let messageId: string | null = null;
  let threadId: string | null = null;
  const subject = `Daily Camelot Leads - ${new Date().toLocaleDateString("en-US")} (${totalNew} new)`;
  try {
    const sent = await merlinSend({
      to: [DIGEST_TO],
      subject,
      html: emailHtml,
      textFallback: `Daily Camelot Leads: ${totalNew} new lead(s). View and act in Camelot OS -> Scout -> Daily Hunt.`,
      fromName: "Merlin - Camelot OS",
    });
    messageId = sent.id ?? null;
    threadId = sent.threadId ?? null;

    await supabase.from("merlin_outbound_messages").insert({
      building_id: null,
      gmail_message_id: messageId,
      thread_id: threadId,
      to_addresses: [DIGEST_TO],
      subject,
      html_snapshot: emailHtml,
      sent_by_function: "daily-lead-hunt",
    });

    if ((todaysLeads ?? []).length > 0) {
      await supabase
        .from("buildings")
        .update({
          outreach_status: "sent",
          outreach_last_sent: new Date().toISOString(),
        })
        .eq("lead_run_id", run.id);
    }
  } catch (e) {
    errors.push({ source: "merlin_email", message: e instanceof Error ? e.message : String(e) });

    // Resend fallback, intentionally disabled while merlin@ owns the mailbox.
    // To temporarily restore relay sending, uncomment this block and restore RESEND_KEY above.
    //
    // try {
    //   const resp = await fetch("https://api.resend.com/emails", {
    //     method: "POST",
    //     headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       from: "Camelot Scout <scout@camelot.nyc>",
    //       to: [DIGEST_TO],
    //       subject,
    //       html: emailHtml,
    //     }),
    //   });
    //   const data = await resp.json();
    //   messageId = data?.id ?? null;
    // } catch (fallbackError) {
    //   errors.push({ source: "resend_email", message: fallbackError instanceof Error ? fallbackError.message : String(fallbackError) });
    // }
  }

  await supabase.from("lead_hunt_runs").update({
    finished_at:        new Date().toISOString(),
    sources_queried:    sourcesQueried,
    candidates_found:   totalCandidates,
    new_leads_inserted: totalNew,
    duplicates_skipped: totalDupes,
    errors,
    email_sent_to:      messageId ? [DIGEST_TO] : null,
    email_message_id:   threadId ? `${messageId}:${threadId}` : messageId,
  }).eq("id", run.id);

  return new Response(JSON.stringify({
    run_id:   run.id,
    candidates: totalCandidates,
    new_leads:  totalNew,
    dupes:      totalDupes,
    errors,
  }), { headers: { "Content-Type": "application/json" } });
});

// ----- helpers ----------------------------------------------------------
function escapeIlike(s: string | undefined): string {
  return (s ?? "").replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", "");
}

function renderDigestHtml(rows: Array<Record<string, unknown>>): string {
  const byCat: Record<string, Array<Record<string, unknown>>> = {};
  for (const r of rows) {
    const k = String(r.lead_category ?? "other");
    (byCat[k] ??= []).push(r);
  }
  const section = (title: string, items: Array<Record<string, unknown>>) =>
    items.length === 0 ? "" : `
      <h2 style="color:#8b6f3f;font-family:-apple-system,Segoe UI,sans-serif;font-size:16px;border-bottom:1px solid #e0d8c8;padding-bottom:4px;">${title}</h2>
      <ul style="font-family:-apple-system,Segoe UI,sans-serif;font-size:13px;line-height:1.6;">
        ${items.map(r => `<li><strong>${r.name}</strong> â€” ${r.address ?? ""} Â· ${r.developer_or_owner ?? r.source ?? ""} Â· ${r.unit_count ?? "?"} units Â· <em>${r.lead_pitch_angle ?? ""}</em></li>`).join("")}
      </ul>`;
  return `<!doctype html><html><body style="font-family:Georgia,serif;background:#f7f5f0;color:#1a1a1a;margin:0;padding:0;">
    <div style="max-width:780px;margin:0 auto;padding:24px;">
      <h1 style="margin:0;font-size:22px;border-bottom:3px solid #8b6f3f;padding-bottom:8px;">CAMELOT REALTY GROUP â€” Daily Leads</h1>
      <p style="font-family:-apple-system,Segoe UI,sans-serif;font-size:13px;color:#6b6258;">${new Date().toDateString()} Â· ${rows.length} net-new leads</p>
      ${section("New Developments â€” Manhattan", byCat["new_dev_manhattan"] ?? [])}
      ${section("New Developments â€” Brooklyn",  byCat["new_dev_brooklyn"]  ?? [])}
      ${section("New Developments â€” Queens",    byCat["new_dev_queens"]    ?? [])}
      ${section("Self-Managed Boards (Compliance Pain)", byCat["self_managed"] ?? [])}
      ${section("Distress / Acquisition Plays", byCat["distress"] ?? [])}
      ${section("Competitive Takeaways",         byCat["competitive_takeaway"] ?? [])}
      ${section("Suburban Tri-State",            byCat["suburban"] ?? [])}
      ${section("Florida",                       byCat["florida"]  ?? [])}
      ${section("PM Firm Acquisition Pipeline",  byCat["pm_acquisition"] ?? [])}
      ${section("Family Offices",                byCat["family_office"]  ?? [])}
      ${section("Referral Channels",             byCat["referral_channel"] ?? [])}
      <p style="font-family:-apple-system,Segoe UI,sans-serif;font-size:12px;color:#8a7e6e;margin-top:24px;border-top:1px solid #e0d8c8;padding-top:10px;">View &amp; act in Camelot OS â†’ Scout â†’ Daily Hunt</p>
    </div></body></html>`;
}
