# Daily Hunt Lead Verifier Skill

## Purpose

Daily Hunt turns uploaded property lists, CSV/XLSX exports, saved-search emails, Kimi/Twin/Claude research, and Merlin inbox signals into a verified Scout lead queue. It is the intake layer before Pipeline, HubSpot, outreach, Jackie reports, or management proposals.

## Core Rule

Imported rows are candidates, not facts. No lead should be pushed to Pipeline, HubSpot, email, or a client-facing report until the verifier labels key fields as verified, corrected, rejected, or unverified.

## Required Verification

- Address and neighborhood
- Unit count
- Owner, developer, sponsor, board, or management entity
- Current project/listing/status
- Contact path and source URL
- Source checked timestamp
- Corrections with reason when the incoming list was wrong

## Source Priority

Use primary records first, then credible market sources, then media/context sources. A second AI answer is never verification.

Preferred source stack:

- HPD, DOF, DOB, ACRIS, county/town records, state corporation records
- Developer offering plans and official project or building websites
- PropertyShark, CityRealty, StreetEasy, MLS/RealtyMX where available
- PincusCo, The Real Deal, OpenIgloo, court records, LinkedIn, Google Maps
- Kimi, Twin, Claude, Perplexity, or other AI outputs only as candidate/source-discovery inputs

## Outputs

- Daily verified lead queue
- Corrected / rejected / unverified stats
- Verification trail per lead
- Pipeline next action
- Merlin outbound/inbound status
- Scout and HubSpot sync readiness

## Release Gates

- No Pipeline push without verification status
- No outreach without contact-source trail
- No unit count unless source-backed or clearly labeled unverified
- Rejected and corrected rows must remain visible in the run log
- Demo/imported fallback rows must not mutate Supabase records

## Camelot OS UI

Daily Hunt appears in:

- Main dashboard Bot Workspaces
- Scout sidebar
- AI Bots and Tools dashboard
- `/daily-hunt`

