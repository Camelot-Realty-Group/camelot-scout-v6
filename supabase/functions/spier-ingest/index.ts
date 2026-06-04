/**
 * spier-ingest — pull from MDS's Spier platform (REST or SFTP fallback).
 *
 * Spier is MDS's new web-based platform (successor to MDS Explorer). As of
 * June 2026 MDS has not confirmed whether Spier exposes a public REST API.
 * This function therefore runs in one of three modes:
 *
 *   SPIER_MODE=partner_pending  Default. Returns explicit "awaiting docs" state.
 *   SPIER_MODE=api              Direct REST. Requires SPIER_API_BASE_URL +
 *                               SPIER_API_KEY (+ optional SPIER_TENANT_ID).
 *   SPIER_MODE=sftp             Nightly file drop. SPIER_SFTP_* env vars.
 *                               (SFTP execution would call a Deno SFTP lib;
 *                               stubbed here until partner-info confirms.)
 *
 * POST body:
 *   { action: 'ping' }
 *   { action: 'list_properties', limit?, cursor? }    (api mode only)
 */
import { json, preflight } from '../_shared/cors.ts';
import { requireServiceRole } from '../_shared/auth.ts';

type Mode = 'partner_pending' | 'api' | 'sftp';

function mode(): Mode {
  const m = (Deno.env.get('SPIER_MODE') ?? 'partner_pending') as Mode;
  return m === 'api' || m === 'sftp' ? m : 'partner_pending';
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  if (!requireServiceRole(req)) return json(req, { error: 'unauthorized' }, { status: 401 });

  let body: { action?: string; [k: string]: unknown } = {};
  try { body = await req.json(); } catch { return json(req, { error: 'invalid_json' }, { status: 400 }); }

  const m = mode();

  if (m === 'partner_pending') {
    return json(req, {
      ok: true,
      mode: 'partner_pending',
      reachable: false,
      authenticated: false,
      message: 'Spier integration awaiting MDS partner-info response. Set SPIER_MODE=api or =sftp once MDS confirms endpoints.',
    });
  }

  if (m === 'sftp') {
    // TODO: wire a Deno SFTP client (e.g. ssh2-deno) once MDS gives host/path/key.
    return json(req, {
      ok: true,
      mode: 'sftp',
      reachable: Boolean(Deno.env.get('SPIER_SFTP_HOST')),
      authenticated: Boolean(Deno.env.get('SPIER_SFTP_USER') && Deno.env.get('SPIER_SFTP_KEY_PEM')),
      message: 'SFTP mode configured but ingest not yet implemented. Awaiting MDS sample file format.',
    });
  }

  // api mode
  const baseUrl = Deno.env.get('SPIER_API_BASE_URL');
  const apiKey = Deno.env.get('SPIER_API_KEY');
  const tenant = Deno.env.get('SPIER_TENANT_ID');
  if (!baseUrl || !apiKey) {
    return json(req, { error: 'SPIER_API_BASE_URL or SPIER_API_KEY not set' }, { status: 500 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };
  if (tenant) headers['X-Tenant-Id'] = tenant;

  try {
    switch (body.action) {
      case 'ping': {
        const t0 = Date.now();
        const res = await fetch(`${baseUrl}/health`, { headers });
        return json(req, {
          ok: true,
          mode: 'api',
          reachable: true,
          authenticated: res.status !== 401 && res.status !== 403,
          status: res.status,
          ms: Date.now() - t0,
        });
      }
      case 'list_properties': {
        const limit = (body.limit as number | undefined) ?? 50;
        const cursor = body.cursor as string | undefined;
        // Path TBD pending MDS docs. Assumed shape:
        const url = new URL(`${baseUrl}/v1/properties`);
        url.searchParams.set('limit', String(limit));
        if (cursor) url.searchParams.set('cursor', cursor);
        const res = await fetch(url.toString(), { headers });
        const text = await res.text();
        let data: unknown;
        try { data = JSON.parse(text); } catch { data = text; }
        return json(req, { ok: res.ok, status: res.status, data }, { status: res.ok ? 200 : 502 });
      }
      default:
        return json(req, { error: 'unknown_action', supported: ['ping', 'list_properties'] }, { status: 400 });
    }
  } catch (err) {
    return json(req, { error: 'spier_call_failed', message: (err as Error).message }, { status: 500 });
  }
});
