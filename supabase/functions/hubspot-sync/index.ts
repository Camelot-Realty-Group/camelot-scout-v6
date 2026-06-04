/**
 * hubspot-sync — push/pull Camelot OS records to HubSpot.
 *
 * Object model:
 *   Company  = Building
 *   Contact  = Decision Maker
 *   Deal     = Pitch (12 pipeline stages, see scripts/hubspot-rollout.mjs)
 *
 * Auth: HUBSPOT_PRIVATE_APP_TOKEN (Bearer). Server-side only.
 *
 * POST body:
 *   { action: 'ping' }                                    → health check
 *   { action: 'list_companies', limit?, after? }          → paginated pull
 *   { action: 'upsert_company', properties }              → create/update
 *   { action: 'upsert_contact', properties, companyId? }  → create/update
 */
import { json, preflight } from '../_shared/cors.ts';
import { requireServiceRole } from '../_shared/auth.ts';

const HS_BASE = 'https://api.hubapi.com';

async function hsFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = Deno.env.get('HUBSPOT_PRIVATE_APP_TOKEN');
  if (!token) throw new Error('HUBSPOT_PRIVATE_APP_TOKEN not set');
  return fetch(`${HS_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  if (!requireServiceRole(req)) return json(req, { error: 'unauthorized' }, { status: 401 });

  let body: { action?: string; [k: string]: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json(req, { error: 'invalid_json' }, { status: 400 });
  }

  try {
    switch (body.action) {
      case 'ping': {
        const t0 = Date.now();
        const res = await hsFetch('/account-info/v3/details');
        return json(req, {
          ok: true,
          reachable: true,
          authenticated: res.status !== 401 && res.status !== 403,
          status: res.status,
          ms: Date.now() - t0,
        });
      }
      case 'list_companies': {
        const limit = (body.limit as number | undefined) ?? 100;
        const after = (body.after as string | undefined) ?? '';
        const q = new URLSearchParams({ limit: String(limit) });
        if (after) q.set('after', after);
        const res = await hsFetch(`/crm/v3/objects/companies?${q.toString()}`);
        const data = await res.json();
        return json(req, { ok: true, data });
      }
      case 'upsert_company': {
        const properties = body.properties as Record<string, unknown> | undefined;
        if (!properties) return json(req, { error: 'properties_required' }, { status: 400 });
        const res = await hsFetch('/crm/v3/objects/companies', {
          method: 'POST',
          body: JSON.stringify({ properties }),
        });
        const data = await res.json();
        return json(req, { ok: res.ok, status: res.status, data }, { status: res.ok ? 200 : 502 });
      }
      case 'upsert_contact': {
        const properties = body.properties as Record<string, unknown> | undefined;
        if (!properties) return json(req, { error: 'properties_required' }, { status: 400 });
        const res = await hsFetch('/crm/v3/objects/contacts', {
          method: 'POST',
          body: JSON.stringify({ properties }),
        });
        const data = await res.json();
        return json(req, { ok: res.ok, status: res.status, data }, { status: res.ok ? 200 : 502 });
      }
      default:
        return json(req, { error: 'unknown_action', supported: ['ping', 'list_companies', 'upsert_company', 'upsert_contact'] }, { status: 400 });
    }
  } catch (err) {
    return json(req, { error: 'hubspot_call_failed', message: (err as Error).message }, { status: 500 });
  }
});
