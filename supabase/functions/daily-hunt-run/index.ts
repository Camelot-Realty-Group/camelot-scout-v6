/**
 * daily-hunt-run — server-side Daily Hunt engine.
 *
 * Replaces the dead `/api/daily-hunt/run` route (the static FE couldn't honor it).
 * Triggered nightly via `pg_cron` (see migration 010 once scheduled) or manually
 * by an authenticated UI button after VITE_ENABLE_RUN_TRIGGERS=true is set.
 *
 * Flow:
 *   1. Pull last-run cursor from `daily_hunt_runs`
 *   2. Call Perplexity Sonar with the boutique-fit prompt + cursor delta
 *   3. Dedupe candidates against `daily_hunt_leads` (by address + window)
 *   4. Insert new leads, update the run row, return the summary
 *
 * Status: STUB — wire to perplexity-research helper + DB migrations 007/008.
 */
import { json, preflight } from '../_shared/cors.ts';
import { requireServiceRole } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  if (!requireServiceRole(req)) return json(req, { error: 'unauthorized' }, { status: 401 });

  // TODO: implement.
  return json(req, {
    ok: true,
    stub: true,
    message: 'daily-hunt-run scaffold — wire Perplexity Sonar + DB upsert.',
  });
});
