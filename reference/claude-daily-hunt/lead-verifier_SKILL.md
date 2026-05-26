---
name: lead-verifier
description: |
  Cross-checks every property/lead claim against primary sources before it can
  appear in a Camelot report. Use whenever a workflow produces a list of
  buildings, units, developers, or board contacts that will be shown to a
  client, partner, or the OS dashboard. Common triggers: "verify the lead
  list", "fact-check this report before sending", "double-check the unit
  counts", "are these addresses real", "before I email this to David",
  "validate the new developments". MUST be called by the Daily Hunt bot
  before it inserts a row into buildings. Returns a verified set with a
  per-field confidence score and a list of rejected claims.
---

# Lead Verifier

This skill exists because today's Camelot Daily Hunt report shipped with unit counts that turned out to be wrong. Those numbers came from an LLM research pass that was never cross-checked. From now on, no lead reaches the Camelot OS Pipeline or a stakeholder email without passing through this verifier.

## When to use this skill

Always call this skill when:
- A workflow produced a list of properties, buildings, developers, or contacts that will be shown to anyone outside the workflow.
- The Daily Lead Hunt Edge Function has finished collecting candidates and is about to insert into `buildings`.
- A user uploads a CSV of leads and asks Claude to "review", "import", or "report on" it.
- A user asks any variant of "fact-check this", "verify these numbers", or "are these real".

Never skip this skill on the assumption that the source already validated. Source LLMs, deep-research tools (Kimi, Perplexity), and even Camelot's own AI passes routinely hallucinate unit counts, addresses, developer names, and project status.

## Inputs

Accepts a JSON array of candidate leads with at minimum:
```json
{
  "target_name": "The Harper",
  "address": "310 East 86th Street",
  "city": "New York",
  "state": "NY",
  "developer_or_owner": "Naftali Group",
  "unit_count": 24,
  "status": "Closings underway",
  "lead_source_url": "https://www.cityrealty.com/..."
}
```

Optional fields the verifier also checks if present: `architect`, `expected_tco`, `price_range`, `contact_name`, `contact_email`.

## Verification procedure (run for every candidate)

### Step 1 — Identity check
Confirm the building/project actually exists by hitting at least two of:
- The developer's own marketing site (search "<developer> <project name>")
- CityRealty `/nyc/<neighborhood>/<address-slug>/condo/`
- StreetEasy `/building/<slug>`
- NY YIMBY `?s=<address>`
- NYC ACRIS or NYC DOB BIS by block/lot if the address is in NYC
- For FL: DBPR Condominium database
- For NJ: NJDCA HOA registry

If fewer than 2 independent sources confirm the project exists, mark `verification_status="REJECTED — not found"` and exclude from the output.

### Step 2 — Field-by-field cross-check
For each field below, find the primary-source value and compare to the candidate:

| Field                | Primary source preference                                            |
| -------------------- | -------------------------------------------------------------------- |
| `unit_count`         | Offering plan filed with NY AG > CityRealty > developer site         |
| `address`            | NYC DOB BIS / county property records > developer site > CityRealty   |
| `developer_or_owner` | NYC DOB filings > offering plan sponsor > CityRealty                  |
| `architect`          | Architect's portfolio site > NY YIMBY                                 |
| `status`             | Most recent press coverage (last 90 days) > developer site            |
| `expected_tco`       | NYC DOB CO/TCO records > developer site                               |
| `price_range`        | StreetEasy active listings > Marketproof                              |
| `contact_email`      | Developer site contact page > LinkedIn confirmed profile              |

If a primary source contradicts the candidate value, REPLACE the candidate value with the primary-source value and lower confidence on that field. Never silently keep an unverified number.

### Step 3 — Recency check
Any `status` claim must be backed by a source dated within 90 days. If the only source is older than 90 days, downgrade `status` to "Last reported <date> — please re-verify before outreach" and flag `status_confidence="STALE"`.

### Step 4 — Contact verification
Any contact name/email pair must be confirmed at the named firm AND title in their public LinkedIn or company site within the last 12 months. If the person isn't confirmed, replace with `"need outbound call to <firm> to identify current decision-maker"` and flag.

### Step 5 — Conflict reconciliation
If two primary sources disagree on a field (e.g. CityRealty says 24 units, NY YIMBY says 26 units):
- Prefer the source most recently updated.
- If tie, prefer the more authoritative source per the table in Step 2.
- Record both values in `field_conflicts` so the report shows the disagreement.

## Output

Return JSON in exactly this shape, no prose:

```json
{
  "run_id": "uuid",
  "verified_at": "2026-05-25T18:00:00Z",
  "total_in": 82,
  "total_verified": 64,
  "total_rejected": 18,
  "leads": [
    {
      "target_name": "The Harper",
      "address": "310 East 86th Street",
      "city": "New York",
      "state": "NY",
      "developer_or_owner": "Naftali Group",
      "unit_count": 24,
      "unit_count_confidence": "HIGH",
      "unit_count_sources": ["https://www.cityrealty.com/...", "https://newyorkyimby.com/..."],
      "status": "Sales 78% complete as of 2026-04-12",
      "status_confidence": "HIGH",
      "field_conflicts": [],
      "verification_status": "VERIFIED",
      "verified_sources": [
        {"field":"unit_count","url":"https://...","fetched_at":"2026-05-25T17:55:00Z"},
        {"field":"developer_or_owner","url":"https://...","fetched_at":"2026-05-25T17:55:00Z"}
      ]
    },
    {
      "target_name": "Loft 21",
      "verification_status": "CORRECTED",
      "corrections": [
        {"field":"unit_count","claimed":66,"actual":58,"source":"https://..."}
      ],
      "...": "..."
    },
    {
      "target_name": "Made-Up Building",
      "verification_status": "REJECTED — not found",
      "reason": "No primary source confirms project exists at this address"
    }
  ]
}
```

## Confidence scale
- **HIGH**: 2+ independent primary sources agree.
- **MEDIUM**: 1 primary source agrees, no contradictions.
- **LOW**: only inferred from a related document; explicit caveat required.
- **STALE**: source older than 90 days.

## Hard rules

1. Never invent a value. If you cannot verify a field, blank it and flag `<field>_confidence="UNVERIFIED"`.
2. Never carry forward an unverified unit_count. The unit_count column must be either VERIFIED, CORRECTED, or NULL.
3. Always cite the URL+timestamp of every primary source used.
4. Never present LLM-recalled facts as primary sources. A second LLM is not a verification.
5. The verifier must reject the entire run rather than ship a partially-unverified lead set if the user said "before I email this to a client".

## How this integrates with the Daily Lead Hunt Edge Function

In `supabase/functions/daily-lead-hunt/index.ts`, insert a verification stage between candidate collection and the dedupe/insert step:

```ts
// pseudocode — wire into the existing handler
const candidates = await collectFromAllSources();
const verified   = await verifier.verifyBatch(candidates, {
  rejectOnAnyContradiction: false,        // soft mode for daily
  minSourcesPerField: 2,
  maxStaleDays: 90,
});

// only the verified subset is inserted with full confidence
await insertVerifiedLeads(verified.leads.filter(l => l.verification_status === "VERIFIED"));

// CORRECTED leads also go in, but with the corrected values
await insertVerifiedLeads(verified.leads.filter(l => l.verification_status === "CORRECTED"));

// REJECTED leads are logged but not inserted
await logRejected(verified.leads.filter(l => l.verification_status === "REJECTED"));

// Run summary captures the count
await updateRun(runId, {
  candidates_found:   candidates.length,
  new_leads_inserted: verified.total_verified + verified.corrected_count,
  rejected_count:     verified.total_rejected,
});
```

## How this integrates with the chat / report workflow

Before generating any lead-style report (HTML, Gmail draft, slide), call this skill and use only verified rows. The report must include a footer:

> Verified <N>/<M> leads via primary-source cross-check on <date>. <K> claims were corrected; <R> were rejected and excluded.

If a user accepts unverified data anyway (e.g. "just send the list as-is"), require explicit confirmation and stamp the document with "⚠ UNVERIFIED — primary-source check skipped at user request".

## Why this exists

Because on 2026-05-25 a Camelot Daily Hunt report shipped with unit counts the user immediately flagged as wrong. Every reported unit count was an LLM recall, not a fact. This skill is the answer to "how can we create a skill that you double check your findings first" — it's a mandatory gate, not an optional cleanup.
