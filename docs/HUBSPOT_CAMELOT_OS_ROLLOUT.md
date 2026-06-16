# HubSpot + Camelot OS Rollout Plan

## Operating Principle

HubSpot is the daily workspace for people. Camelot OS is the property intelligence engine.

Cold callers and interns should start and end their work in HubSpot. Camelot OS should support them with property context, lead scoring, research summaries, decision-maker clues, and report links. Do not make the team manage follow-up inside Camelot OS while HubSpot already handles tasks, calls, notes, sequences, reporting, permissions, and pipeline visibility better.

## Goal

Prepare interns and cold callers to work one shared business-development system:

- HubSpot owns contacts, companies, deals, calls, notes, tasks, meetings, follow-up dates, and pipeline stages.
- Camelot OS owns building intelligence, research evidence, scoring, reports, source links, uploaded materials, and recommended sales angles.
- Every qualified building should have a clear HubSpot owner, next step, and deal status.

## Phase 1: HubSpot Setup

### Pipeline

Create or confirm one HubSpot pipeline for Camelot property management opportunities.

Recommended stages:

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

My opinion: do not make too many early stages. The team needs motion, not a museum of half-statuses. The most important split is `Needs Research` versus `Ready to Call`.

### Custom Fields

Create these HubSpot company properties:

- `Camelot OS Building ID`
- `Property Address`
- `Building Type`
- `Units`
- `Current Management`
- `Opportunity Score`
- `Opportunity Tier`
- `Distress Signals`
- `Open Violations`
- `Estimated Management Fee Opportunity`
- `Camelot OS Report Link`
- `Research Confidence`
- `Last Camelot OS Sync`

Create these HubSpot contact properties:

- `Building Role`
- `Decision Maker Type`
- `Contact Confidence`
- `Source`
- `Do Not Contact Reason`

Create these HubSpot deal properties:

- `Property Address`
- `Building Type`
- `Units`
- `Primary Pain Point`
- `Next Recommended Angle`
- `Camelot OS Report Link`
- `Research Confidence`

### Lists

Create active HubSpot lists:

- `Intern Cleanup Queue`
- `Ready to Call`
- `Hot Property Management Leads`
- `No Verified Contact`
- `Meeting Targets`
- `Proposal Targets`
- `Nurture - Revisit Later`

## Phase 2: Camelot OS Sync Rules

When a building is pushed from Camelot OS to HubSpot:

1. Create or update a HubSpot company for the building.
2. Create or update contacts for decision makers.
3. Create or update a deal for the property management opportunity.
4. Create a HubSpot task for the next action.
5. Add a note with the Camelot OS intelligence summary.
6. Store the HubSpot IDs back in Camelot OS.

Recommended object mapping:

| Camelot OS | HubSpot |
| --- | --- |
| Building | Company |
| Board member / owner / managing agent / super | Contact |
| Management opportunity | Deal |
| Next step | Task |
| Intelligence report | Note and report link |
| Pipeline stage | Deal stage |

My opinion: the sync should be conservative. Bad data in HubSpot will poison the callers. Push clean records first, and send incomplete records to `Intern Cleanup Queue`.

## Phase 3: Intern Workflow

Interns are responsible for turning raw building records into call-ready HubSpot records.

Daily workflow:

1. Open HubSpot list: `Intern Cleanup Queue`.
2. Review each company/building.
3. Confirm the property address.
4. Confirm building type: co-op, condo, rental, HOA, commercial, mixed-use, or other.
5. Confirm unit count if available.
6. Identify current management if possible.
7. Find decision makers:
   - board president
   - treasurer
   - owner
   - sponsor/developer
   - managing agent
   - resident manager
   - superintendent
   - attorney or broker contact
8. Add source notes for every important contact.
9. Set `Research Confidence`:
   - High: verified from reliable source
   - Medium: likely correct, needs confirmation
   - Low: weak source or incomplete
10. Move the company/deal to `Ready to Call` only when there is a contact path and a clear call angle.

Interns should not:

- Guess emails or phone numbers.
- Delete records without manager approval.
- Mark a lead ready to call with no decision-maker path.
- Send outreach unless explicitly assigned.

## Phase 4: Cold Caller Workflow

Cold callers live in HubSpot.

Daily workflow:

1. Open HubSpot tasks due today.
2. Prioritize:
   - hot leads
   - ready-to-call records
   - meeting-request follow-ups
   - stale contacted leads
3. Open the company/deal in HubSpot.
4. Read the Camelot OS summary and report link before calling.
5. Call the primary contact.
6. Log the call outcome in HubSpot.
7. Update the deal stage.
8. Create the next task before leaving the record.
9. If the data is wrong, move the record to `Needs Research` and tag the issue.

Required call outcomes:

- Connected - decision maker
- Connected - not decision maker
- Left voicemail
- No answer
- Bad number
- Wrong building
- Email requested
- Meeting requested
- Meeting booked
- Not interested
- Current contract timing learned
- Do not contact

Callers should not:

- Keep private notes outside HubSpot.
- Work from spreadsheets once the lead is in HubSpot.
- Leave a record without a next task or status.
- Trust Camelot OS blindly if the caller learns better information live.

## Phase 5: Manager Review

David or the manager should review HubSpot every morning.

Daily dashboard:

- Calls made yesterday
- Connect rate
- Meetings requested
- Meetings booked
- Hot leads not touched
- Deals with no next task
- Records stuck in `Needs Research`
- Intern cleanup completed
- Proposal targets

Weekly dashboard:

- New qualified buildings
- Contact discovery rate
- Meeting conversion rate
- Proposal conversion rate
- Won/lost reasons
- Revenue pipeline estimate
- Caller performance
- Intern data-quality performance

My opinion: the first metric that matters is not total calls. It is clean records contacted with a clear reason to call. Volume without targeting will burn the list.

## Phase 6: Training Package

Create these training assets:

1. One-page intern checklist.
2. One-page cold caller checklist.
3. HubSpot field definitions.
4. Call outcome definitions.
5. Sample call script by building type.
6. Sample email follow-up templates.
7. Manager QA checklist.

## Minimum Viable Launch

Launch when these are true:

- HubSpot private app token is configured server-side.
- HubSpot pipeline and stages are confirmed.
- Required custom fields are created.
- One Camelot OS building can push into HubSpot successfully.
- One company, contact, deal, note, and task are created correctly.
- Interns have the cleanup checklist.
- Cold callers have the daily call workflow.
- Manager dashboard exists in HubSpot.

## First Week Plan

Day 1:

- Finalize HubSpot pipeline stages.
- Create custom fields.
- Create lists.
- Pick 20 test buildings.

Day 2:

- Push 5 clean buildings from Camelot OS to HubSpot.
- Validate company/contact/deal/task/note mapping.
- Fix field mapping issues.

Day 3:

- Train interns on cleanup queue.
- Interns clean 25 records.
- Manager reviews 10 records for quality.

Day 4:

- Train cold callers.
- Callers work only from HubSpot tasks.
- Manager reviews all call outcomes.

Day 5:

- Review metrics.
- Fix broken fields, bad stages, unclear scripts, or missing call outcomes.
- Expand to 100 records only after the first 20 are clean.

## Email-Ready Summary

Subject: HubSpot + Camelot OS Rollout for Interns and Cold Callers

Team,

We are moving to a two-platform workflow. HubSpot will be the daily workspace for contacts, companies, deals, calls, notes, tasks, follow-ups, and pipeline tracking. Camelot OS will remain the property intelligence engine for building research, scoring, reports, source links, and recommended sales angles.

Interns will clean and enrich records before they become call-ready. Cold callers will work from HubSpot tasks, log every call outcome, update deal stages, and create the next task before leaving each record.

The key rule is simple: HubSpot owns the follow-up; Camelot OS makes the lead smarter.

We will start with a small test batch, confirm the mapping, train the team, and expand only after the first records are clean and usable.
