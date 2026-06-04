/**
 * CORS helpers shared across every Edge Function.
 * Restrict origins via the EDGE_ALLOWED_ORIGINS env var (comma-separated).
 * Falls back to '*' in dev only — production deploys MUST set this.
 */
export function corsHeaders(req: Request): HeadersInit {
  const allowed = (Deno.env.get('EDGE_ALLOWED_ORIGINS') ?? '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get('Origin') ?? '';
  const allowOrigin = allowed.includes('*') || allowed.includes(origin) ? origin || '*' : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

export function preflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req) });
  }
  return null;
}

export function json(req: Request, body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}
