/**
 * realtymx-sync — pull listings from RealtyMX (server-side).
 *
 * Auth: legacy hex key as `apikey` query param. Stored in REALTYMX_API_KEY.
 *
 * Variants:
 *   - REALTYMX_VARIANT=data    → dataapi.realtymx.com (bulk listing import)
 *   - REALTYMX_VARIANT=website → api.realtymx.com (real-time site queries)
 *
 * POST body:
 *   { action: 'ping' }                          → health check
 *   { action: 'list_listings', limit?, offset?, variant? }
 */
import { json, preflight } from '../_shared/cors.ts';
import { requireServiceRole } from '../_shared/auth.ts';

function baseFor(variant: string | undefined): string {
  return (variant ?? Deno.env.get('REALTYMX_VARIANT') ?? 'data') === 'website'
    ? 'https://api.realtymx.com'
    : 'https://dataapi.realtymx.com';
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  if (!requireServiceRole(req)) return json(req, { error: 'unauthorized' }, { status: 401 });

  const apiKey = Deno.env.get('REALTYMX_API_KEY');
  if (!apiKey) return json(req, { error: 'REALTYMX_API_KEY not set' }, { status: 500 });

  let body: { action?: string; [k: string]: unknown } = {};
  try { body = await req.json(); } catch { return json(req, { error: 'invalid_json' }, { status: 400 }); }

  const base = baseFor(body.variant as string | undefined);

  try {
    switch (body.action) {
      case 'ping': {
        const url = new URL(`${base}/listings`);
        url.searchParams.set('apikey', apiKey);
        url.searchParams.set('limit', '1');
        const t0 = Date.now();
        const res = await fetch(url.toString());
        return json(req, {
          ok: true,
          reachable: true,
          authenticated: res.status !== 401 && res.status !== 403,
          status: res.status,
          ms: Date.now() - t0,
          base,
        });
      }
      case 'list_listings': {
        const limit = (body.limit as number | undefined) ?? 50;
        const offset = (body.offset as number | undefined) ?? 0;
        const url = new URL(`${base}/listings`);
        url.searchParams.set('apikey', apiKey);
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('offset', String(offset));
        const res = await fetch(url.toString());
        const text = await res.text();
        let data: unknown;
        try { data = JSON.parse(text); } catch { data = text; }
        return json(req, { ok: res.ok, status: res.status, data }, { status: res.ok ? 200 : 502 });
      }
      default:
        return json(req, { error: 'unknown_action', supported: ['ping', 'list_listings'] }, { status: 400 });
    }
  } catch (err) {
    return json(req, { error: 'realtymx_call_failed', message: (err as Error).message }, { status: 500 });
  }
});
