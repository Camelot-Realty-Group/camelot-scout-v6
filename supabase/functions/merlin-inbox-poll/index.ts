// supabase/functions/merlin-inbox-poll/index.ts
//
// Polls merlin@camelot.nyc every 10 minutes for new replies, classifies each
// reply with Claude (positive / objection / meeting / junk / unsubscribe),
// updates the matching buildings.outreach_status, and optionally fans out a
// Slack/email notification to the assigned agent when a meeting is requested.
//
// Scheduling — add to migration 008 (already provided):
//   SELECT cron.schedule('merlin-inbox-poll','*/10 * * * *', $$
//     SELECT net.http_post(
//       url := current_setting('app.settings.merlin_inbox_function_url', true),
//       headers := jsonb_build_object('Content-Type','application/json',
//         'Authorization','Bearer '||current_setting('app.settings.merlin_inbox_function_token',true))
//     ); $$);

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1";
import {
  merlinListMessages, merlinMarkRead, merlinLabel, merlinSend,
  type MerlinMessage,
} from "../_shared/gmail_merlin.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const claude   = new Anthropic({ apiKey: ANTHROPIC_KEY });

type Intent = "positive" | "objection" | "meeting_request" | "junk" | "unsubscribe" | "other";

interface Classification {
  intent: Intent;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  next_action: string;
  detected_building?: string;
}

const CLASSIFIER_PROMPT = (msg: MerlinMessage) => `
You are classifying an inbound reply to Camelot Realty Group's outbound lead
outreach. Camelot is a boutique NYC property management firm. The bot
(merlin@camelot.nyc) sent the original email; this is a reply.

Classify the reply into ONE of:
- positive:        recipient wants to engage, asked a follow-up question, requested info
- objection:       recipient declined, said "not now", "already have a manager", or pushed back
- meeting_request: recipient explicitly asked for a call, demo, meeting, or coffee
- junk:            auto-reply, vacation, bounce, vendor pitch, unrelated
- unsubscribe:     recipient asked to be removed from the list
- other:           cannot classify confidently

Also return:
- confidence:      HIGH / MEDIUM / LOW
- summary:         one sentence in human English
- next_action:     one sentence telling the assigned Camelot agent what to do
- detected_building: building name or address mentioned in the reply, if any

Reply only as JSON, no prose.

From: ${msg.from}
Subject: ${msg.subject}
Body:
${(msg.bodyText || msg.snippet).slice(0, 6000)}
`.trim();

Deno.serve(async () => {
  // 1. Pull unread messages from the last hour (cron runs every 10 min, this
  //    over-laps so a transient failure recovers automatically).
  const { messages } = await merlinListMessages({
    query: "in:inbox is:unread newer_than:1h -from:me -from:noreply -from:no-reply",
    maxResults: 50,
  });

  if (messages.length === 0) {
    return Response.json({ status: "ok", processed: 0 });
  }

  let processed = 0;
  const errors: { message_id: string; error: string }[] = [];

  for (const m of messages) {
    try {
      // 2. Has this thread already been processed? Skip silently.
      const { data: existing } = await supabase
        .from("merlin_inbound_messages")
        .select("id").eq("gmail_message_id", m.id).limit(1);
      if (existing && existing.length > 0) continue;

      // 3. Classify with Claude
      const resp = await claude.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 600,
        messages: [{ role: "user", content: CLASSIFIER_PROMPT(m) }],
      });
      const text = resp.content.find(c => c.type === "text")?.text ?? "{}";
      const jStart = text.indexOf("{");
      const jEnd   = text.lastIndexOf("}");
      const cls: Classification = JSON.parse(text.slice(jStart, jEnd + 1));

      // 4. Try to match the reply to an existing building lead by thread or
      //    explicit detected_building name.
      let buildingId: string | null = null;
      {
        const { data: byThread } = await supabase
          .from("merlin_outbound_messages")
          .select("building_id").eq("thread_id", m.threadId).limit(1);
        if (byThread?.length) buildingId = byThread[0].building_id;
      }
      if (!buildingId && cls.detected_building) {
        const { data: byName } = await supabase
          .from("buildings")
          .select("id")
          .or(`name.ilike.%${cls.detected_building}%,address.ilike.%${cls.detected_building}%`)
          .limit(1);
        if (byName?.length) buildingId = byName[0].id;
      }

      // 5. Persist the inbound message
      await supabase.from("merlin_inbound_messages").insert({
        gmail_message_id: m.id,
        thread_id:        m.threadId,
        building_id:      buildingId,
        from_address:     m.from,
        subject:          m.subject,
        snippet:          m.snippet,
        body_text:        m.bodyText.slice(0, 30_000),
        intent:           cls.intent,
        confidence:       cls.confidence,
        summary:          cls.summary,
        next_action:      cls.next_action,
        received_at:      new Date().toISOString(),
      });

      // 6. Update the matched building's outreach_status
      if (buildingId) {
        await supabase.from("buildings").update({
          outreach_status:    cls.intent,
          outreach_last_reply: new Date().toISOString(),
          stage:              cls.intent === "meeting_request" ? "qualified"
                            : cls.intent === "positive"        ? "engaged"
                            : cls.intent === "objection"       ? "objection"
                            : cls.intent === "unsubscribe"     ? "archived"
                            : undefined,
        }).eq("id", buildingId);
      }

      // 7. Apply Gmail labels for human-friendly inbox triage
      // (these label IDs should be pre-created in merlin's Gmail and stored in
      //  app config; the below assumes labelIds passed in env)
      const LABELS = parseLabelMap(Deno.env.get("MERLIN_LABEL_IDS"));
      if (LABELS[cls.intent]) await merlinLabel(m.id, LABELS[cls.intent]);

      // 8. Mark read so we don't re-process
      await merlinMarkRead(m.id);

      // 9. For meeting requests, send David a high-priority ping
      if (cls.intent === "meeting_request" && cls.confidence === "HIGH") {
        await merlinSend({
          to:       ["dgoldoff@camelot.nyc"],
          subject:  `[Merlin] Meeting request: ${m.from} re: ${m.subject}`,
          html:     `<p><strong>${m.from}</strong> asked for a meeting.</p>
                     <p><em>${cls.summary}</em></p>
                     <p><strong>Next action:</strong> ${cls.next_action}</p>
                     <hr>
                     <pre style="font-family:Menlo,monospace;font-size:12px;white-space:pre-wrap;">${escapeHtml(m.bodyText.slice(0, 4000))}</pre>`,
          replyTo:  m.from,
          threadId: m.threadId,
        });
      }

      processed++;
    } catch (e) {
      errors.push({ message_id: m.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return Response.json({ status: "ok", processed, errors });
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]!));
}

function parseLabelMap(raw?: string | null): Partial<Record<Intent, string>> {
  if (!raw) return {};
  const trimmed = raw.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);

  const [positive, objection, meeting_request, junk, unsubscribe, other] = trimmed
    .split(",")
    .map(label => label.trim())
    .filter(Boolean);
  return { positive, objection, meeting_request, junk, unsubscribe, other };
}
