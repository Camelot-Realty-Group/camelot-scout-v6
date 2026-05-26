/**
 * scripts/setup_merlin_oauth.ts
 *
 * Local, one-time OAuth setup for merlin@camelot.nyc.
 *
 * Run this ONCE on your laptop after you've:
 *   1. Created merlin@camelot.nyc as a Google Workspace user
 *   2. Created an OAuth 2.0 client in Google Cloud Console (Web application type)
 *   3. Added the OAuth client's redirect URI as http://localhost:53682/oauth2callback
 *   4. Granted these scopes to the OAuth client:
 *        https://www.googleapis.com/auth/gmail.send
 *        https://www.googleapis.com/auth/gmail.compose
 *        https://www.googleapis.com/auth/gmail.modify
 *        https://www.googleapis.com/auth/gmail.readonly
 *
 * Then run:
 *   MERLIN_GOOGLE_CLIENT_ID=<id> MERLIN_GOOGLE_CLIENT_SECRET=<secret> npm run setup:merlin
 *
 * The script:
 *   - Starts a tiny localhost server on port 53682
 *   - Opens Google's consent screen in your browser
 *   - You sign in as merlin@camelot.nyc (NOT dgoldoff@camelot.nyc)
 *   - Google redirects back with a code, the script exchanges it for tokens
 *   - Prints the refresh token AND the supabase secrets commands you should run
 *
 * Re-running ONLY rotates the refresh token. The original keeps working until you
 * revoke it in https://myaccount.google.com/permissions
 */

import { createServer } from "node:http";
import { parse as parseUrl } from "node:url";
import { exec } from "node:child_process";

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

const CLIENT_ID = process.env.MERLIN_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.MERLIN_GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing env vars. Run:");
  console.error("  MERLIN_GOOGLE_CLIENT_ID=... MERLIN_GOOGLE_CLIENT_SECRET=... npm run setup:merlin");
  process.exit(1);
}

const consentUrl =
  "https://accounts.google.com/o/oauth2/v2/auth" +
  "?response_type=code" +
  `&client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  "&access_type=offline" +          // <- REQUIRED to get a refresh token
  "&prompt=consent" +               // <- forces a refresh token even on re-auth
  "&login_hint=merlin@camelot.nyc"; // <- defaults the account picker

function openBrowser(url: string) {
  const cmd =
    process.platform === "darwin" ? `open "${url}"` :
    process.platform === "win32"  ? `start "" "${url}"` :
    `xdg-open "${url}"`;
  exec(cmd);
}

const server = createServer(async (req, res) => {
  if (!req.url) return;
  const parsed = parseUrl(req.url, true);

  if (parsed.pathname !== "/oauth2callback") {
    res.writeHead(404).end("not found");
    return;
  }

  const code = parsed.query.code as string | undefined;
  const error = parsed.query.error as string | undefined;
  if (error) {
    res.writeHead(400).end(`OAuth error: ${error}`);
    console.error(`OAuth error from Google: ${error}`);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.writeHead(400).end("no code in callback");
    server.close();
    return;
  }

  console.log("✓ Got authorization code, exchanging for tokens...");

  try {
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    "authorization_code",
      }),
    });
    const tokens = await tokenResp.json();

    if (!tokens.refresh_token) {
      res.writeHead(400).end("No refresh_token returned. Did you sign in as merlin@camelot.nyc and approve all scopes?");
      console.error("\n❌ No refresh_token returned by Google.");
      console.error("Likely cause: this OAuth client has already been authorized for merlin@. To force a new");
      console.error("refresh token, visit https://myaccount.google.com/permissions while signed in as");
      console.error("merlin@camelot.nyc, revoke the client, and re-run this script.\n");
      server.close();
      process.exit(1);
    }

    // Confirm we actually got merlin@ by hitting the userinfo endpoint
    const profile = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }).then(r => r.json());

    if (profile.emailAddress !== "merlin@camelot.nyc") {
      res.writeHead(400).end(`Signed in as ${profile.emailAddress} but expected merlin@camelot.nyc.`);
      console.error(`\n❌ Wrong account. Got ${profile.emailAddress}. Re-run and sign in as merlin@camelot.nyc.\n`);
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!doctype html><html><body style="font-family:system-ui;padding:40px;">
      <h2>✅ Merlin OAuth complete</h2>
      <p>You can close this tab and return to your terminal.</p>
    </body></html>`);

    // Print the secrets the user has to install in Supabase
    console.log("\n========================================================");
    console.log("✅  Merlin OAuth setup complete.");
    console.log("========================================================");
    console.log(`Mailbox confirmed:    ${profile.emailAddress}`);
    console.log(`Access token (1h):    ${tokens.access_token.slice(0, 24)}...`);
    console.log(`Refresh token (∞):    ${tokens.refresh_token}`);
    console.log("========================================================");
    console.log("\nInstall these as Supabase secrets:\n");
    console.log(`  supabase secrets set MERLIN_GOOGLE_CLIENT_ID='${CLIENT_ID}'`);
    console.log(`  supabase secrets set MERLIN_GOOGLE_CLIENT_SECRET='${CLIENT_SECRET}'`);
    console.log(`  supabase secrets set MERLIN_GMAIL_REFRESH_TOKEN='${tokens.refresh_token}'`);
    console.log(`  supabase secrets set MERLIN_EMAIL_ADDRESS='merlin@camelot.nyc'`);
    console.log("\nAlso save the refresh token in 1Password / Bitwarden. It is the only");
    console.log("credential the bot needs forever. Treat it like a password.\n");

    server.close();
    process.exit(0);
  } catch (err) {
    res.writeHead(500).end(`token exchange failed: ${err}`);
    console.error("Token exchange failed:", err);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`\nLocal OAuth callback listening on http://localhost:${PORT}\n`);
  console.log("Opening Google consent screen...");
  console.log("→ Sign in as merlin@camelot.nyc (NOT dgoldoff@) when prompted.\n");
  console.log(`If the browser doesn't open, paste this URL:\n${consentUrl}\n`);
  openBrowser(consentUrl);
});
