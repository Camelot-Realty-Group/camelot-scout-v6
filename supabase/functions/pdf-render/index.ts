/**
 * pdf-render — server-side PDF generation via Browserless.io.
 *
 * Why server-side: the client-side @react-pdf approach in v6 ships a 2-3 MB
 * font/runtime payload and renders slowly on mobile. Browserless gives us
 * pixel-perfect Chromium PDF rendering with one HTTP call.
 *
 * Env required: BROWSERLESS_API_TOKEN
 */
import { json, preflight } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, { status: 405 });
  // TODO: POST to https://chrome.browserless.io/pdf with the HTML + brand CSS.
  return json(req, { ok: true, stub: true, pdfUrl: null });
});
