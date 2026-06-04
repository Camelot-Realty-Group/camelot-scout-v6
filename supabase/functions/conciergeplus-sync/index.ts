/**
 * conciergeplus-sync — generic REST adapter for Concierge Plus.
 *
 * CP advertises an "extensive API ecosystem" but docs are partner-gated. Until
 * we get the developer guide, this function is a parameterized passthrough so
 * the moment CP confirms paths we can wire them in without redeploying clients.
 *
 * Env:
 *   CONCIERGEPLUS_BASE_URL   e.g. https://api.conciergeplus.com
 *   CONCIERGEPLUS_API_KEY    bearer token / api key
 *   CONCIERGEPLUS_TENANT_ID  community / portfolio id
 *
 * POST body:
 *   { action: 'ping' }
 *   { action: 'get', path: '/v1/residents', query?: {…} }
 */
import { json, preflight } from '../_shared/cors.ts';
import { requireServiceRole } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  if (!requireServiceRole(req)) return json(req, { error: 'unauthorized' }, { status: 401 });

  const base = Deno.env.get('CONCIERGEPLUS_BASE_URL');
  const key = Deno.env.get('CONCIERGEPLUS_API_KEY');
  const tenant = Deno.env.get('CONCIERGEPLUS_TENANT_ID');
  if (!base || !key) {
    return json(req, {
      ok: false,
      configured: false,
      message: 'Concierge Plus integration awaiting partner-info response. Set CONCIERGEPLUS_BASE_URL + CONCIERGEPLUS_API_KEY once CP delivers the developer guide.',
    });
  }

  let body: { action?: string; path?: string; query?: Record<string, string> } = {};
  try { body = await req.json(); } catch { return json(req, { error: 'invalid_json' }, { status: 400 }); }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  };
  if (tenant) headers['X-Tenant-Id'] = tenant;

  try {
    switch (body.action) {
      case 'ping': {
        const t0 = Date.now();
        const res = await fetch(`${base}/`, { headers });
        return json(req, {
          ok: true,
          reachable: true,
          authenticated: res.status !== 401 && res.status !== 403,
          status: res.status,
          ms: Date.now() - t0,
        });
      }
      case 'get': {
        if (!body.path) return json(req, { error: 'path_required' }, { status: 400 });
        const url = new URL(body.path, base);
        for (const [k, v] of Object.entries(body.query ?? {})) url.searchParams.set(k, v);
        const res = await fetch(url.toString(), { headers });
        const text = await res.text();
        let data: unknown;
        try { data = JSON.parse(text); } catch { data = text; }
        return json(req, { ok: res.ok, status: res.status, data }, { status: res.ok ? 200 : 502 });
      }
      default:
        return json(req, { error: 'unknown_action', supported: ['ping', 'get'] }, { status: 400 });
    }
  } catch (err) {
    return json(req, { error: 'conciergeplus_call_failed', message: (err as Error).message }, { status: 500 });
  }
});
