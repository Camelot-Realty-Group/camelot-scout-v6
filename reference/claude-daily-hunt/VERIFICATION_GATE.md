# Camelot Lead Verification Gate

## Why this exists

On 2026-05-25 the Daily Hunt rebuild shipped with unit counts that were wrong. They came from an LLM research pass that was never cross-checked against the developer's offering plan or CityRealty. The user (correctly) flagged it.

The fix isn't "be more careful next time" — it's a **mandatory verification gate** that runs between sourcing and any human-facing output. Same gate, two surfaces:

1. **`lead-verifier` Cowork skill** — Claude calls this any time a lead-style list is about to be shown, regardless of where the leads came from.
2. **`verifier.ts` Edge Function stage** — the Daily Hunt bot pipes every candidate through it before inserting into `buildings`.

Neither path can be bypassed silently.

## Files

| File                              | Goes to                                                          | Purpose                                          |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| `lead-verifier_SKILL.md`          | `.codex/skills/lead-verifier/SKILL.md`                           | Cowork skill spec — triggers on lead-list output |
| `daily-lead-hunt_verifier.ts`     | `supabase/functions/daily-lead-hunt/verifier.ts`                 | TypeScript verifier the Edge Function calls      |

## Rules (the contract)

1. **Never invent a value.** If a field can't be verified, blank it and flag `<field>_confidence = "UNVERIFIED"`.
2. **Unit_count must be VERIFIED, CORRECTED, or NULL.** Never carry forward a number we couldn't cross-check.
3. **Always cite the URL + timestamp** of every primary source consulted.
4. **A second LLM is not verification.** Only fetched primary-source pages count.
5. **Status claims older than 90 days** get downgraded to STALE and require re-verification before outreach.
6. **2 independent sources required in soft mode (daily cron), 3 in strict mode (client-facing reports).**

## Primary-source priority (per field)

| Field                | Priority                                                              |
| -------------------- | --------------------------------------------------------------------- |
| `unit_count`         | NY AG Offering Plan → CityRealty → Developer site → YIMBY → StreetEasy |
| `address`            | NYC DOB BIS → County property records → Developer site → CityRealty    |
| `developer_or_owner` | NYC DOB filings → Offering plan sponsor → CityRealty                   |
| `architect`          | Architect's portfolio site → NY YIMBY                                  |
| `status`             | Press in last 90 days → Developer site                                 |
| `expected_tco`       | NYC DOB CO/TCO records → Developer site                                |
| `price_range`        | StreetEasy active → Marketproof                                        |
| `contact_email`      | Developer site contact page → LinkedIn confirmed within 12 months      |

## How it changes the Edge Function

In `supabase/functions/daily-lead-hunt/index.ts`, add the verification stage between candidate collection and the dedupe/insert loop:

```ts
import { verifyBatch, isInsertable } from "./verifier.ts";

// after `candidates` is collected from all sources:
const verifyResult = await verifyBatch(candidates, {
  mode: "daily_soft",
  minSourcesPerField: 2,
  maxStaleDays: 90,
  anthropicApiKey: ANTHROPIC_KEY,
}, run.id);

const insertable = verifyResult.leads.filter(isInsertable);
// ... existing dedupe + insert loop, but only over `insertable`

// log the verification stats on the run row
await supabase.from("lead_hunt_runs").update({
  candidates_found:    verifyResult.total_in,
  new_leads_inserted:  /* set after dedupe */ ,
  rejected_count:      verifyResult.total_rejected,
  corrected_count:     verifyResult.total_corrected,
  errors:              verifyResult.errors,
}).eq("id", run.id);
```

Add two columns to the `lead_hunt_runs` table (in the next migration, e.g. `008_verifier.sql`):
```sql
ALTER TABLE lead_hunt_runs
  ADD COLUMN IF NOT EXISTS rejected_count  integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS corrected_count integer DEFAULT 0;
```

Add four columns to `buildings` to carry the verification provenance:
```sql
ALTER TABLE buildings
  ADD COLUMN IF NOT EXISTS verification_status text,           -- 'VERIFIED' | 'CORRECTED'
  ADD COLUMN IF NOT EXISTS verified_at         timestamptz,
  ADD COLUMN IF NOT EXISTS verified_sources    jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS corrections         jsonb DEFAULT '[]'::jsonb;
```

## How it changes the Daily Hunt UI

The `DailyHunt.tsx` page should:

1. Show a small badge on each lead card with the verification status:
   ```tsx
   <span className={lead.verification_status === "VERIFIED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
     {lead.verification_status === "CORRECTED" ? "auto-corrected" : "verified"}
   </span>
   ```
2. On hover, show the source URLs that backed the unit_count and developer fields.
3. Add a "View verification trail" link that opens a side drawer with the full `verified_sources` and `corrections` JSON.
4. The header summary line should always say "X verified · Y corrected · Z rejected today" so the user trusts what they're seeing.

## How it changes Claude's chat behavior

The `lead-verifier` skill is invoked **before** any of these conversational outputs:
- "Draft a digest of today's leads"
- "Show me a table of new developments"
- "Make a Word doc / PDF / slide deck of these leads"
- "Update the Gmail draft with these leads"

The skill returns a verified set. If the user explicitly says "skip verification, just show me", the report is stamped `⚠ UNVERIFIED` in the header and footer.

## What to do about the leads already shipped today

The 2026-05-25 report is still in the Cowork outputs folder with un-verified unit counts. Two options:

1. **Re-run verification on the existing CSV** (`leads_2026-05-25.csv`) by piping it through the Cowork lead-verifier skill manually. Replaces wrong unit counts with verified or NULL.
2. **Wait for the first cron run after the Edge Function ships** — fresh leads will go through the gate from the start.

I recommend option 1 for the 12 HIGH-priority Manhattan new-dev leads since those are the ones you're most likely to act on this week.

## Cost note

Verification adds 1 Claude Sonnet call per candidate (with web_search tool, up to 8 fetches). Rough costs at current rates:

- Daily run of ~30 net-new candidates → ~$1-3/day
- ~$30-90/month total verification cost
- The total bot still comes in under $100/month all-in

## Outstanding work

After this skill ships, the next priority is automating the primary-source adapters so the verifier doesn't depend on Claude doing web_search for every candidate. Specifically:

- A small scraper microservice for **NYC DOB BIS** and **NY AG Offering Plan database** (these are the highest-trust primary sources and are stable HTML).
- CityRealty + YIMBY structured fetchers (these have predictable URL patterns).
- A cache layer so we don't re-verify the same building twice in one week.

That's a follow-up, not a blocker. The verifier ships first.
