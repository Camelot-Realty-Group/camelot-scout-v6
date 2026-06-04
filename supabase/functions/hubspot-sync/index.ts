/**
 * hubspot-sync — push/pull Camelot OS records to HubSpot.
 *
 * Object model:
 *   - Company  = Building
 *   - Contact  = Decision Maker
 *   - Deal     = Pitch (12 pipeline stages, see scripts/hubspot-rollout.mjs)
 *
 * Server-side only — HubSpot API key must never ship to the browser.
 */
import { json, preflight } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  // TODO: implement using HUBSPOT_PRIVATE_APP_TOKEN.
  return json(req, { ok: true, stub: true });
});
