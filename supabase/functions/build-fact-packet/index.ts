/**
 * build-fact-packet — assemble the Fact Packet for a building.
 *
 * Sources stacked in priority order:
 *   1. NYC Open Data (PLUTO, HPD, DOB, ACRIS)
 *   2. PropertyShark (paid)
 *   3. OpenCorporates (ownership LLC)
 *   4. Google Maps (geocoding/photos)
 *   5. Perplexity Sonar (anything still missing — flagged 'inferred')
 *
 * Always returns a versioned, immutable packet. Field-level provenance is
 * preserved so the runtime validator can reject anything sourced from
 * `fallback_estimate` on a packet about to be released.
 */
import { json, preflight } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });

  const { address, borough } = await req.json().catch(() => ({}));
  if (!address) return json(req, { error: 'address required' }, { status: 400 });

  // TODO: orchestrate the source stack.
  const now = new Date().toISOString();
  return json(req, {
    ok: true,
    stub: true,
    packet: {
      version: 1,
      packet_id: `fp_${crypto.randomUUID()}`,
      address,
      borough,
      fields: {},
      release_status: 'draft',
      created_at: now,
      updated_at: now,
    },
  });
});
