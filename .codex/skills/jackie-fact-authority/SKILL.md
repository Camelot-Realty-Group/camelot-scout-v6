# Jackie Fact Authority

Use this skill whenever Jackie reports, first email intros, meeting handouts, proposal documents, or property cards show stale facts, wrong addresses, wrong unit counts, wrong managers, missing photos, or mismatched report data.

## Core Principle

Jackie must not let every renderer invent facts. The flow is:

1. Input intake: address, borough, contact, focus, uploaded files, public records, saved cards.
2. Canonical fact authority: normalize known properties, source conflicts, and sensitive fields.
3. Narrative generation: write from the locked fact sheet only.
4. Render sanitizer: scrub stale cached tokens from final HTML before preview, download, email, print, archive, or HubSpot push.
5. Archive: save the report, filename, timestamp, generator, contacts, and package type.

## Known-Property Rules

- 279 Central Park West must not include stale current-management names in titles, headings, cards, or generated HTML. Management should read as verification language until confirmed through board materials, HPD MDR, ACRIS, PropertyShark, and building records.
- 279 Central Park West uses the locked Central Park West condominium profile and the verified local asset set before Google or Street View fallbacks.
- 36 East 22nd Street must be treated as The Story House / pre-war elevator condominium, not a walk-up or Bronx/Tiebout profile.
- Known-property corrections belong in `src/lib/jackie-fact-authority.ts` and/or `src/lib/property-guardrails.ts`, then must be applied before report rendering and after HTML assembly.

## Required Verification

After any fact-authority change, run:

```bash
npm run verify:jackie
npm run lint
npm run build
```

For known-property regressions, also run a runtime import smoke test against local Vite to confirm:

- No stale manager token in generated intro or meeting handout HTML.
- Locked unit count is used consistently.
- First building photo is a verified local asset.
- Report buttons preview before download and do not block internal review for warning-only issues.

## Design Guidance

- Use client-facing labels like `1st Meeting Handout`, not internal engineering names.
- Never make stale management names part of report filenames or browser titles.
- Reports should remain previewable/exportable for internal review when issues are warnings or review items, but should display the review issues clearly.
- A persistent report archive is the proper source for proposal and agreement modules; avoid recomputing facts differently in each document.
