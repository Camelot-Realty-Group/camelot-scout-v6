---
name: camelot-bot-split-hubspot-rollout
description: Use when Camelot OS bots need to be separated, Jackie needs to be made lighter, or HubSpot needs CRM rollout, custom-field setup, daily review, pipeline hygiene, bot reporting, or cold-caller/intern workflow support.
---

# Camelot Bot Split + HubSpot Rollout

## Operating Principle

HubSpot is the daily workspace for people. Camelot OS is the property intelligence engine.

Do not make callers and interns work from two CRMs. HubSpot owns companies, contacts, deals, tasks, calls, notes, lists, meetings, sequences, and manager dashboards. Camelot OS owns source evidence, property intelligence, scoring, reports, sales angles, uploaded materials, generated proposal links, and bot activity.

## Bot Boundaries

Jackie should not be the whole factory.

1. Daily Hunt owns CSV/XLSX intake, duplicate detection, bulk candidate lists, and candidate verification.
2. Jackie owns canonical property facts, known-property guardrails, source conflicts, and release warnings.
3. Media Desk owns image validation, compression, PDF-safe URLs, neighborhood images, and fallback assets.
4. Guardian owns compliance and local-law exposure.
5. Financing Desk owns mortgage/refinance/RFP/sensitivity framing.
6. Excalibur owns proposals, Intelligence package recommendation, Schedule A, and agreement handoff.
7. 1st Meeting Handout Desk owns first email intros and meeting handouts.
8. HubSpot Desk owns company/contact/deal/task/note sync, pipeline stage hygiene, and daily manager review.
9. Merlin owns follow-up drafts, call talking points, and reply classification support.

## Implementation Rules

- Add or maintain bot boundaries in `src/lib/camelot-bot-operating-model.ts`.
- Show the split in `src/pages/Bots.tsx` so the team can see what each bot owns.
- Keep HubSpot setup and daily review in `scripts/hubspot-rollout.mjs`.
- Keep the user-facing rollout description in `docs/HUBSPOT_CAMELOT_OS_OPERATING_MODEL.md`.
- HubSpot scripts must run dry-run by default. Require `--apply` or `HUBSPOT_ROLLOUT_APPLY=true` for writes.
- Do not create or change a HubSpot pipeline blindly. Print recommended stages, check the configured pipeline, and require manager confirmation for pipeline/list changes.
- Every bot-generated report or proposal should be eligible to create or update a HubSpot company, contact, deal, note, task, and report link when HubSpot is configured.

## Verification

After changes, run:

```bash
npm run hubspot:rollout
npm run hubspot:daily
npm run verify:jackie
npm run lint
npm run build
```

If the user asks for a live CRM mutation, confirm `HUBSPOT_PRIVATE_APP_TOKEN`, `HUBSPOT_PIPELINE_ID`, and manager approval before running with `--apply`.
