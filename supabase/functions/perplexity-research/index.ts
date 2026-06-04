/**
 * perplexity-research — single point of contact for Perplexity Sonar.
 *
 * Replaces the 1,420-line `src/lib/twin-knowledge.ts` client-side approach.
 * Server-side keeps the API key safe and lets us cache by URL + prompt hash
 * in `perplexity_cache` (migration 011 — TBD).
 *
 * Env required: PERPLEXITY_API_KEY
 */
import { json, preflight } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  // TODO: call https://api.perplexity.ai/chat/completions with sonar-pro + citations.
  return json(req, { ok: true, stub: true, answer: null, citations: [] });
});
