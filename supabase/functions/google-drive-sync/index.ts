/**
 * google-drive-sync — read/write Camelot OS deliverables in Google Drive.
 *
 * Auth: service account JSON in GOOGLE_SERVICE_ACCOUNT_JSON (single-line).
 * We mint a short-lived OAuth2 access token via the JWT bearer grant, then
 * call the Drive REST API. The JSON key never touches the browser.
 *
 * POST body:
 *   { action: 'ping' }
 *   { action: 'list', folderId, pageSize? }
 *   { action: 'create_text', folderId, name, content, mimeType? }
 *
 * Setup: see src/lib/integrations/google-drive.ts header comment.
 */
import { json, preflight } from '../_shared/cors.ts';
import { requireServiceRole } from '../_shared/auth.ts';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

function b64url(input: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input instanceof Uint8Array ? input : new Uint8Array(input);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function pemToBytes(pem: string): Uint8Array {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s+/g, '');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const keyBytes = pemToBytes(sa.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;
  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  if (!requireServiceRole(req)) return json(req, { error: 'unauthorized' }, { status: 401 });

  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!raw) return json(req, { error: 'GOOGLE_SERVICE_ACCOUNT_JSON not set' }, { status: 500 });

  let sa: ServiceAccountKey;
  try {
    sa = JSON.parse(raw);
    if (!sa.client_email || !sa.private_key) throw new Error('missing fields');
  } catch (err) {
    return json(req, { error: 'invalid_service_account_json', message: (err as Error).message }, { status: 500 });
  }

  let body: { action?: string; [k: string]: unknown } = {};
  try { body = await req.json(); } catch { return json(req, { error: 'invalid_json' }, { status: 400 }); }

  try {
    const token = await getAccessToken(sa);
    const headers = { Authorization: `Bearer ${token}` };

    switch (body.action) {
      case 'ping': {
        const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', { headers });
        const data = await res.json();
        return json(req, { ok: res.ok, status: res.status, data });
      }
      case 'list': {
        const folderId = body.folderId as string | undefined;
        if (!folderId) return json(req, { error: 'folderId_required' }, { status: 400 });
        const pageSize = (body.pageSize as number | undefined) ?? 100;
        const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
        const url = `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=${pageSize}&fields=files(id,name,mimeType,webViewLink,modifiedTime)`;
        const res = await fetch(url, { headers });
        const data = await res.json();
        return json(req, { ok: res.ok, status: res.status, data });
      }
      case 'create_text': {
        const folderId = body.folderId as string | undefined;
        const name = body.name as string | undefined;
        const content = body.content as string | undefined;
        const mimeType = (body.mimeType as string | undefined) ?? 'text/markdown';
        if (!folderId || !name || content == null) {
          return json(req, { error: 'folderId, name, content required' }, { status: 400 });
        }
        const boundary = '----camelot' + crypto.randomUUID();
        const meta = { name, parents: [folderId], mimeType };
        const multipart =
          `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
          JSON.stringify(meta) +
          `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n` +
          content +
          `\r\n--${boundary}--`;
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': `multipart/related; boundary=${boundary}` },
          body: multipart,
        });
        const data = await res.json();
        return json(req, { ok: res.ok, status: res.status, data }, { status: res.ok ? 200 : 502 });
      }
      default:
        return json(req, { error: 'unknown_action', supported: ['ping', 'list', 'create_text'] }, { status: 400 });
    }
  } catch (err) {
    return json(req, { error: 'drive_call_failed', message: (err as Error).message }, { status: 500 });
  }
});
