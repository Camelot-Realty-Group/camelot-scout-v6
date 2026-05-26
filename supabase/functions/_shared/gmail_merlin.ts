// supabase/functions/_shared/gmail_merlin.ts
//
// Shared Gmail client for merlin@camelot.nyc. Used by the daily-lead-hunt
// Edge Function (to send) and the merlin-inbox-poll function (to read).
//
// All calls go through Gmail's REST API directly so the bot can authenticate
// with merlin's own OAuth refresh token — no Resend, no Postmark, no relay.
// merlin@ keeps its own Sent and Inbox folders; replies thread correctly.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

const CLIENT_ID     = Deno.env.get("MERLIN_GOOGLE_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("MERLIN_GOOGLE_CLIENT_SECRET")!;
const REFRESH_TOKEN = Deno.env.get("MERLIN_GMAIL_REFRESH_TOKEN")!;
const MERLIN_EMAIL  = Deno.env.get("MERLIN_EMAIL_ADDRESS") ?? "merlin@camelot.nyc";

// ----- token cache (per cold start) -----
let _cachedAccessToken: { token: string; exp: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (_cachedAccessToken && _cachedAccessToken.exp - Date.now() > 60_000) {
    return _cachedAccessToken.token;
  }
  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type:    "refresh_token",
    }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Merlin token refresh failed (${resp.status}): ${body}`);
  }
  const j = await resp.json() as { access_token: string; expires_in: number };
  _cachedAccessToken = {
    token: j.access_token,
    exp:   Date.now() + j.expires_in * 1000,
  };
  return j.access_token;
}

// ----- send -----------------------------------------------------------------

export interface MerlinSendArgs {
  to:        string[];
  cc?:       string[];
  bcc?:      string[];
  subject:   string;
  html:      string;
  textFallback?: string;
  replyTo?:  string;
  inReplyTo?: string;     // Message-ID of the message we're replying to
  threadId?: string;      // Gmail thread to add this message to
  attachments?: Array<{ filename: string; mimeType: string; contentBase64: string }>;
  fromName?: string;      // Display name; defaults to "Merlin · Camelot Realty"
}

export interface MerlinSendResult {
  id:         string;
  threadId:   string;
  labelIds:   string[];
}

export async function merlinSend(args: MerlinSendArgs): Promise<MerlinSendResult> {
  const accessToken = await getAccessToken();
  const fromName    = args.fromName ?? "Merlin · Camelot Realty";
  const boundary    = `cmlt-${crypto.randomUUID()}`;

  const headers: string[] = [
    `From: ${fromName} <${MERLIN_EMAIL}>`,
    `To: ${args.to.join(", ")}`,
  ];
  if (args.cc?.length)  headers.push(`Cc: ${args.cc.join(", ")}`);
  if (args.bcc?.length) headers.push(`Bcc: ${args.bcc.join(", ")}`);
  if (args.replyTo)     headers.push(`Reply-To: ${args.replyTo}`);
  if (args.inReplyTo)   headers.push(`In-Reply-To: ${args.inReplyTo}`, `References: ${args.inReplyTo}`);
  headers.push(`Subject: ${encodeRfc2047Subject(args.subject)}`);
  headers.push("MIME-Version: 1.0");

  let body: string;
  if (args.attachments?.length) {
    headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    const inner = `multipart/alternative; boundary="alt-${boundary}"`;
    body = [
      `--${boundary}`,
      `Content-Type: ${inner}`,
      "",
      buildAltBody(args, `alt-${boundary}`),
      "",
      ...args.attachments.map(a => buildAttachment(a, boundary)),
      `--${boundary}--`,
    ].join("\r\n");
  } else {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    body = buildAltBody(args, boundary);
  }

  const rfc822 = headers.join("\r\n") + "\r\n\r\n" + body;
  const raw    = base64UrlEncode(rfc822);

  const resp = await fetch(`${GMAIL_API}/messages/send`, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({ raw, threadId: args.threadId }),
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`merlinSend failed (${resp.status}): ${errBody}`);
  }
  return resp.json();
}

// ----- read -----------------------------------------------------------------

export interface MerlinMessage {
  id:           string;
  threadId:     string;
  from:         string;
  to:           string;
  subject:      string;
  snippet:      string;
  date:         string;
  bodyText:     string;
  bodyHtml:     string;
  inReplyTo?:   string;
  references?:  string;
  labelIds:     string[];
  raw?:         unknown;
}

export interface ListOptions {
  query?:    string;        // Gmail search query, e.g. 'in:inbox newer_than:1d -from:me'
  maxResults?: number;      // default 50
  labelIds?: string[];      // optional label filter
  pageToken?: string;
}

export async function merlinListMessages(opts: ListOptions = {}): Promise<{ messages: MerlinMessage[]; nextPageToken?: string }> {
  const accessToken = await getAccessToken();
  const params = new URLSearchParams();
  params.set("q", opts.query ?? "in:inbox newer_than:1d -from:me");
  params.set("maxResults", String(opts.maxResults ?? 50));
  if (opts.labelIds?.length) {
    for (const l of opts.labelIds) params.append("labelIds", l);
  }
  if (opts.pageToken) params.set("pageToken", opts.pageToken);

  const listResp = await fetch(`${GMAIL_API}/messages?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!listResp.ok) throw new Error(`merlinList failed: ${await listResp.text()}`);
  const list = await listResp.json() as { messages?: Array<{ id: string }>; nextPageToken?: string };
  const ids  = list.messages ?? [];

  const detailed: MerlinMessage[] = [];
  // Sequential fetch to stay under per-second quota — 5/sec is safe.
  for (const m of ids) {
    const r = await fetch(`${GMAIL_API}/messages/${m.id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) continue;
    detailed.push(parseMessage(await r.json()));
  }
  return { messages: detailed, nextPageToken: list.nextPageToken };
}

export async function merlinMarkRead(messageId: string): Promise<void> {
  const accessToken = await getAccessToken();
  await fetch(`${GMAIL_API}/messages/${messageId}/modify`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ removeLabelIds: ["UNREAD"] }),
  });
}

export async function merlinLabel(messageId: string, labelId: string): Promise<void> {
  const accessToken = await getAccessToken();
  await fetch(`${GMAIL_API}/messages/${messageId}/modify`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ addLabelIds: [labelId] }),
  });
}

// ----- helpers --------------------------------------------------------------

function buildAltBody(args: MerlinSendArgs, boundary: string): string {
  const text = args.textFallback ?? stripHtml(args.html);
  return [
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    args.html,
    "",
    `--${boundary}--`,
  ].join("\r\n");
}

function buildAttachment(a: NonNullable<MerlinSendArgs["attachments"]>[number], boundary: string): string {
  return [
    `--${boundary}`,
    `Content-Type: ${a.mimeType}; name="${a.filename}"`,
    `Content-Disposition: attachment; filename="${a.filename}"`,
    "Content-Transfer-Encoding: base64",
    "",
    chunkBase64(a.contentBase64),
    "",
  ].join("\r\n");
}

function encodeRfc2047Subject(s: string): string {
  // ASCII only? send as-is. Otherwise encode as UTF-8 base64 per RFC 2047.
  // Gmail compose tolerates raw UTF-8 in practice, but RFC compliance avoids issues.
  // deno-lint-ignore no-control-regex
  if (/^[\x00-\x7F]*$/.test(s)) return s;
  const utf8 = new TextEncoder().encode(s);
  const b64  = base64Encode(utf8);
  return `=?UTF-8?B?${b64}?=`;
}

function base64UrlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  return base64Encode(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64Encode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function chunkBase64(b64: string): string {
  // RFC 2045 requires <= 76 chars per line.
  return b64.match(/.{1,76}/g)?.join("\r\n") ?? b64;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Parse Gmail's `format=full` JSON into a flat shape.
function parseMessage(m: Record<string, unknown>): MerlinMessage {
  const headers = (m.payload as any)?.headers ?? [];
  const h = (name: string) => (headers.find((x: any) => x.name.toLowerCase() === name.toLowerCase())?.value as string) ?? "";

  let bodyText = "";
  let bodyHtml = "";
  walkParts((m.payload as any), (part: any) => {
    const data = part.body?.data;
    if (!data) return;
    const decoded = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    if (part.mimeType === "text/plain") bodyText += decoded;
    if (part.mimeType === "text/html")  bodyHtml += decoded;
  });

  return {
    id:        m.id as string,
    threadId:  m.threadId as string,
    from:      h("from"),
    to:        h("to"),
    subject:   h("subject"),
    snippet:   (m.snippet as string) ?? "",
    date:      h("date"),
    bodyText,
    bodyHtml,
    inReplyTo: h("in-reply-to") || undefined,
    references: h("references") || undefined,
    labelIds:  (m.labelIds as string[]) ?? [],
    raw:       m,
  };
}

function walkParts(part: any, visit: (p: any) => void) {
  if (!part) return;
  visit(part);
  if (Array.isArray(part.parts)) part.parts.forEach((p: any) => walkParts(p, visit));
}
