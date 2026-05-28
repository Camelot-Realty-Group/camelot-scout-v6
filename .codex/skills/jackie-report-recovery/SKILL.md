---
name: jackie-report-recovery
description: Use when Jackie, First Email Intro, Meeting Handout, Proposal, or Full Appendix reports keep showing stale property facts, wrong titles, wrong unit counts, bad images, cache-related regressions, or live Render output that does not match repository fixes. Guides repository correction, cache cleanup, rebuild, and deployment verification.
---

# Jackie Report Recovery

Use this skill when a Camelot OS report repeatedly shows wrong property facts, old manager names, broken image payloads, mismatched pricing, blank pages, or live output that does not reflect the latest code.

## Recovery Workflow

1. **Confirm the stale path**
   - Identify whether the bad value is coming from a property card, report-center form state, uploaded-photo state, generated report archive, Supabase row, or localStorage.
   - Search `src`, `public`, `.codex`, and `dist` for the stale visible text.
   - If source is clean but the browser still shows the bad value, treat it as cache/state/deploy drift.

2. **Patch shared normalization first**
   - Put property-specific guardrails in a shared helper under `src/lib/`.
   - Apply the helper before display, before report generation, before file names, and before email subject lines.
   - Do not fix only one template. Patch the source, the property card, Results, Report Center, proposal generation, and Jackie package generation as needed.

3. **Repair persisted browser state**
   - Check known localStorage keys: `scout_buildings`, report-library keys, generated proposal/report library keys, and uploaded-photo keys.
   - Add code that rewrites stale cached records on load when safe.
   - If the deployed app has already loaded stale in-memory state, a browser refresh or hard refresh is required after deployment.

4. **Render and image guardrails**
   - Never let a broken base64 image block review/export for all packages. Downgrade dirty image payloads to warnings and use a clean fallback image.
   - Uploaded photos should be converted to safe object URLs or stored asset paths before PDF/HTML generation.
   - For repeated image crashes, use static property images from `public/images/<property-slug>/` and avoid embedding huge raw base64 strings in report HTML.

5. **Verification commands**
   - Run `rg -n "<stale visible text>" src public .codex dist -S`.
   - Run `npm run verify:jackie`.
   - Run `npm run build`.
   - After build, run the stale-text `rg` against `dist`.

6. **Deploy reality check**
   - If code is only on a feature branch, the live Render URL will not change until the branch is merged into the branch Render deploys.
   - If Render deployed but output remains stale, clear Render build cache or trigger a manual redeploy, then hard-refresh the browser.
   - If the app still shows stale data after redeploy, inspect localStorage and Supabase rows for the property.

## Non-Negotiables

- Do not use a competing or current management company name as a client-facing report title unless the user explicitly requests it.
- Do not silently accept a source conflict for unit count, ownership, block/lot, or management. Normalize known facts and label unresolved records as verification items.
- Do not let QA review issues block the user from previewing internal drafts unless a legal/compliance blocker makes the report unsafe to show.
- When the user is frustrated, explain the real cause plainly: source fix, stale cache, or undeployed code.
