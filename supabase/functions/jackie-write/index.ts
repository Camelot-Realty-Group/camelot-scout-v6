/**
 * jackie-write — compose a Jackie deliverable strictly from a Fact Packet.
 *
 * Hard contract:
 *   - input MUST contain a Fact Packet (or a packet_id to look up)
 *   - output body MUST cite only values present in the packet
 *   - any model invention triggers a B04_HALLUCINATION blocker via the validator
 *
 * Models: Anthropic Claude Sonnet (primary), OpenAI gpt-4o (fallback).
 */
import { json, preflight } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  // TODO: implement with Anthropic SDK + strict prompt anchored to Fact Packet.
  return json(req, { ok: true, stub: true });
});
