# HubSpot + Camelot OS Operating Model

HubSpot is the daily workspace. Camelot OS is the property intelligence engine.

The system should make interns and cold callers faster without turning Camelot OS into a second CRM. HubSpot owns contacts, companies, deals, tasks, calls, notes, meetings, sequences, pipeline stages, and manager reporting. Camelot OS owns source evidence, building intelligence, property reports, scoring, sales angles, and report links.

## Runnable HubSpot Scripts

Camelot OS includes a dry-run-first rollout script:

```bash
npm run hubspot:rollout
npm run hubspot:daily
```

Use `-- --apply` only after reviewing the dry-run output:

```bash
npm run hubspot:rollout -- --apply
npm run hubspot:daily -- --apply
```

The rollout script:

- Checks the configured HubSpot deal pipeline from `HUBSPOT_PIPELINE_ID`.
- Prints the recommended Camelot property-management stages.
- Creates or updates Camelot OS company, contact, and deal properties when `--apply` is used.
- Lists the active HubSpot lists that should exist for intern cleanup, ready-to-call records, hot leads, meeting targets, proposal targets, and nurture.

The daily script:

- Reviews recent Camelot opportunity deals.
- Flags deals missing Camelot OS report links.
- Flags deals with no assigned HubSpot owner.
- Flags low-confidence or unverified research records.
- Keeps the manager focused on the daily rule: every active opportunity needs a clear owner, next action, and reason to call.

Conservative rule: the script creates fields, but it does not blindly create a new pipeline, replace existing HubSpot stages, or create marketing lists without manager review.

## Pipeline Stages

Recommended HubSpot stages:

1. New Building Lead
2. Needs Research
3. Ready to Call
4. Contacted
5. Decision Maker Found
6. Meeting Requested
7. Meeting Booked
8. Proposal Needed
9. Proposal Sent
10. Negotiation
11. Won
12. Lost / Nurture

The key split is `Needs Research` versus `Ready to Call`. If a building has no verified contact path or the facts are still shaky, it should not be in the caller queue.

## Bot Split Rule

Jackie should not be the whole factory. Jackie should be the fact authority.

- Daily Hunt owns bulk intake and CSV/XLSX candidate queues.
- Jackie owns canonical facts, known-property guardrails, source conflicts, and release warnings.
- Media Desk owns image validation, compression, PDF-safe visuals, and fallback assets.
- Guardian owns compliance, local-law, LL97, HPD, DOB, ECB/OATH, FISP, elevator, boiler, and risk exposure summaries.
- Financing Desk owns refinance, bank RFP, loan sensitivity, and financing advisory framing.
- Excalibur owns proposal pricing, the Intelligence package recommendation, Schedule A, and agreement handoff.
- 1st Meeting Handout Desk owns first email intros and meeting handouts.
- HubSpot Desk owns company/contact/deal/task/note sync and daily CRM hygiene.
- Merlin owns follow-up drafts, call talking points, and reply-classification support.

The point is to make failures smaller. A bad image should not break ownership facts. A compliance warning should not corrupt proposal pricing. A stale manager token should be scrubbed before every title, filename, email subject, archive record, and HubSpot note.

## Manager Daily Rule

Each morning, review:

- Calls made yesterday.
- Meetings requested.
- Meetings booked.
- Hot leads not touched.
- Deals with no next task.
- Records stuck in `Needs Research`.
- Intern cleanup completed.
- Proposal targets.

The first metric that matters is not total calls. It is clean records contacted with a clear reason to call.

## Minimum Viable Launch

Launch only when:

- HubSpot private app token is configured server-side.
- Required Camelot custom properties exist.
- One building can push from Camelot OS into HubSpot.
- One company, contact, deal, note, and task are created correctly.
- Interns have the cleanup checklist.
- Cold callers have the daily call workflow.
- Manager dashboard exists in HubSpot.
