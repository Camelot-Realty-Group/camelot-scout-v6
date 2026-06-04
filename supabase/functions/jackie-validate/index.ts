/**
 * jackie-validate — server-side mirror of the runtime validator in
 * `src/lib/fact-packet.ts`. Both must implement the same 10 release blockers
 * from `reference/jackie-skill.md`. CI test will assert parity.
 */
import { json, preflight } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  // TODO: paste 10-check validator (or import from a shared TS module).
  return json(req, { ok: true, stub: true, blockers: [], warnings: [] });
});
