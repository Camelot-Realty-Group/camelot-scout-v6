# Merlin OAuth Setup — Give the bot its own Gmail mailbox

Goal: `merlin@camelot.nyc` becomes a real, addressable Google Workspace mailbox that the bot owns. The bot sends mail FROM it, reads replies INTO it, and classifies inbound conversations so they automatically update the Pipeline.

## What this delivers
- A real Sent / Inbox / Spam folder for Merlin
- OAuth refresh token stored once in Supabase, used forever (no passwords in code)
- Automatic reply classification (positive / objection / meeting_request / junk / unsubscribe)
- High-priority alert to dgoldoff@ whenever someone asks for a meeting
- Threaded conversation tracking — replies stay attached to the original Camelot outreach
- Every send and every receive logged in Supabase for audit + Pipeline updates

## Files (drop these in the repo)

| Output filename                   | Repo path                                              | Purpose                                         |
| --------------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| `setup_merlin_oauth.ts`           | `scripts/setup_merlin_oauth.ts`                        | One-time local OAuth dance, captures refresh token |
| `gmail_merlin.ts`                 | `supabase/functions/_shared/gmail_merlin.ts`           | Shared Gmail send + read client                 |
| `merlin-inbox-poll_index.ts`      | `supabase/functions/merlin-inbox-poll/index.ts`        | Inbox poller — runs every 10 minutes            |
| `008_merlin_inbox.sql`            | `supabase/migrations/008_merlin_inbox.sql`             | Inbound/outbound tables + cron schedule         |

## One-time setup (~25 minutes)

### Step 1 — Create the mailbox (5 min, ~$6/month)
1. Open **Google Workspace Admin Console** → **Directory** → **Users** → **Add new user**.
2. First name: `Merlin`. Last name: `Bot`. Username: `merlin`. Domain: `camelot.nyc`.
3. Pick **Business Starter** ($6/user/month) or higher.
4. Set a strong password, generate a 2FA backup code, save both in 1Password.
5. Sign in to merlin@camelot.nyc once in an incognito window to clear the first-login prompts (accept Terms, set timezone).
6. Bonus: in Workspace Admin → Apps → Gmail → Routing, add an alias `ai@camelot.nyc → merlin@camelot.nyc` so the bot is reachable at both addresses but uses one mailbox.

### Step 2 — Create the OAuth client (8 min, free)
1. Open **Google Cloud Console** → pick or create a project named `camelot-os` for the same `camelot.nyc` organization.
2. **APIs & Services → Library**: enable **Gmail API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **Internal** (this restricts the client to your workspace — much safer)
   - App name: `Camelot Merlin Bot`
   - Support email + developer email: dgoldoff@camelot.nyc
   - Scopes — add: `gmail.send`, `gmail.compose`, `gmail.modify`, `gmail.readonly`
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Camelot Merlin Local Setup`
   - **Authorized redirect URI**: `http://localhost:53682/oauth2callback`
   - Save. Copy the **Client ID** and **Client Secret** to a scratch note.

### Step 3 — Run the local OAuth setup script (3 min)
On your laptop, inside the camelot-scout-v6 repo:

```bash
# install the tiny dev deps the script needs
npm install --save-dev tsx

# run with the credentials from Step 2
GOOGLE_CLIENT_ID='1234-abcd.apps.googleusercontent.com' \
GOOGLE_CLIENT_SECRET='GOCSPX-...' \
  npx tsx scripts/setup_merlin_oauth.ts
```

The script will:
- Open Google's consent screen in your browser
- Prompt you to sign in — **sign in as merlin@camelot.nyc, NOT dgoldoff@camelot.nyc**
- Approve the four Gmail scopes
- Redirect back to localhost, capture the refresh token
- Print the exact `supabase secrets set` commands to copy-paste

### Step 4 — Install the secrets in Supabase (2 min)
Paste the commands the script printed:
```bash
supabase secrets set MERLIN_GOOGLE_CLIENT_ID='1234-abcd.apps.googleusercontent.com'
supabase secrets set MERLIN_GOOGLE_CLIENT_SECRET='GOCSPX-...'
supabase secrets set MERLIN_GMAIL_REFRESH_TOKEN='1//04rk....'
supabase secrets set MERLIN_EMAIL_ADDRESS='merlin@camelot.nyc'
supabase secrets set ANTHROPIC_API_KEY='sk-ant-...'   # if not already set
```

Also save the refresh token in 1Password as **Camelot Merlin Refresh Token** — that single string is the only credential the bot needs forever. Treat it like a root password.

### Step 5 — Run the migration (2 min)
```bash
supabase db push     # or paste 008_merlin_inbox.sql into the Supabase SQL editor
```
This creates `merlin_inbound_messages`, `merlin_outbound_messages`, extends `buildings` with outreach fields, and schedules the 10-minute cron poll.

### Step 6 — Deploy the Edge Functions (3 min)
```bash
supabase functions deploy merlin-inbox-poll --no-verify-jwt

# (and re-deploy daily-lead-hunt if you swapped Resend → Merlin send)
supabase functions deploy daily-lead-hunt --no-verify-jwt
```

### Step 7 — Point pg_cron at the function (1 min)
In the Supabase SQL editor:
```sql
ALTER DATABASE postgres
  SET app.settings.merlin_inbox_function_url = 'https://<your-project>.supabase.co/functions/v1/merlin-inbox-poll';
ALTER DATABASE postgres
  SET app.settings.merlin_inbox_function_token = '<your-service-role-jwt>';
```

### Step 8 — Smoke test (1 min)
```bash
# Send a test from Merlin to yourself
curl -X POST https://<project>.supabase.co/functions/v1/merlin-inbox-poll \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# Verify rows landed
psql $DATABASE_URL -c "SELECT id, subject, intent FROM merlin_inbound_messages ORDER BY received_at DESC LIMIT 5"
```

Done. Tomorrow's 6 AM daily hunt run will send from `merlin@camelot.nyc`; replies will be classified and routed within 10 minutes of arrival.

## How the daily-lead-hunt function uses this

Inside `supabase/functions/daily-lead-hunt/index.ts`, replace the Resend call with:

```ts
import { merlinSend } from "../_shared/gmail_merlin.ts";

const result = await merlinSend({
  to:      [DIGEST_TO],            // dgoldoff@camelot.nyc
  cc:      ["sam@camelot.nyc"],
  bcc:     teamBccList,            // the cold callers, interns, agents
  subject: `Daily Camelot Leads — ${today} (${totalNew} new)`,
  html:    digestHtml,
  attachments: [
    { filename: "leads_today.csv", mimeType: "text/csv", contentBase64: csvB64 },
  ],
});

// Log the send so reply matching works later
await supabase.from("merlin_outbound_messages").insert({
  gmail_message_id: result.id,
  thread_id:        result.threadId,
  to_addresses:     [DIGEST_TO],
  cc_addresses:     ["sam@camelot.nyc"],
  bcc_addresses:    teamBccList,
  subject:          `Daily Camelot Leads — ${today}`,
  sent_by_function: "daily-lead-hunt",
});
```

For per-lead outreach (when Camelot agents trigger an individual cold email from the Daily Hunt UI), use the same `merlinSend` call with a `building_id` so replies thread back to the right lead row.

## Pre-creating Gmail labels for triage

After Step 1, sign in once as merlin@camelot.nyc and create six labels in Gmail:
- `Pipeline/Positive`
- `Pipeline/Objection`
- `Pipeline/Meeting Request`
- `Pipeline/Junk`
- `Pipeline/Unsubscribe`
- `Pipeline/Other`

Get each label's ID via:
```bash
curl https://gmail.googleapis.com/gmail/v1/users/me/labels \
     -H "Authorization: Bearer $MERLIN_ACCESS_TOKEN" | jq '.labels[] | {id, name}'
```

Save the IDs as a single JSON env var:
```bash
supabase secrets set MERLIN_LABEL_IDS='{"positive":"Label_123","objection":"Label_124","meeting_request":"Label_125","junk":"Label_126","unsubscribe":"Label_127","other":"Label_128"}'
```

Then every reply gets auto-labeled in Merlin's inbox, making manual triage trivial.

## Camelot OS UI hooks (next iteration)

Once the data is flowing into `merlin_inbound_messages` and `merlin_outbound_messages`, add to the existing camelot-scout-v6 frontend:

1. **Outreach page** — show every send + reply for a given building as a chat-style thread. Hooks: `useMerlinThread(buildingId)`.
2. **Pipeline page** — surface a small badge on each Kanban card showing the last outreach status (positive ✅ / objection ⏸ / meeting 📅 / no-reply 🕓).
3. **Command center widget** — "Meeting requests this week: 3" with a click-through to a filtered list of `merlin_inbound_messages WHERE intent='meeting_request' AND received_at > now() - interval '7 days'`.
4. **Settings → Merlin** — show last successful inbox poll, last successful send, refresh-token last-rotated date, and a "Re-authenticate Merlin" button that re-runs the OAuth flow if the token ever expires.

## Security notes

- **Refresh token = root credential.** Only put it in Supabase secrets. Never check it into git, never paste it into a screenshot, never send it over email. If it leaks, revoke at https://myaccount.google.com/permissions (sign in as merlin@) and re-run the setup script.
- **OAuth consent screen Internal.** This prevents anyone outside camelot.nyc from authorizing the bot.
- **Service-account vs OAuth.** I chose OAuth (with a real mailbox) instead of a service account with domain-wide delegation because Google Workspace's Marketplace/admin guardrails are stricter for service accounts, and domain-wide delegation is overkill for one bot's inbox.
- **Mailbox 2FA.** Even though the bot uses OAuth, 2FA on the merlin@ account prevents someone with the password from logging in via the web. Store the 2FA backup codes in 1Password.
- **Quota.** Gmail API limits to 250 quota units/user/second; sending costs 100 units, listing 5, modifying 5. Our daily volume is well under this.
- **Audit trail.** Every bot send is in `merlin_outbound_messages`. Every bot read is in `merlin_inbound_messages` with the classification reason. You can answer "what did Merlin say to so-and-so?" in one SQL query.

## If something breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `invalid_grant` on refresh | Token revoked, password changed, or 6 months idle | Re-run `setup_merlin_oauth.ts` to get a new refresh token |
| `403 insufficient_scope` | Forgot a scope at consent time | Re-run setup, approve all 4 scopes |
| Inbound poll returns 0 every time | Cron token misconfigured OR no recent inbound mail | Manually `curl -X POST` the function and check the response |
| Replies not threading | The original message didn't include `threadId` when sent | Use `merlinSend({ ..., threadId })` when replying to existing threads |
| All replies classified `junk` | Claude API key missing or wrong model | Check `ANTHROPIC_API_KEY` secret; verify model name in classifier |
| Workspace cost surprise | Merlin counts as a billable user | Confirmed — that's the $6/month tradeoff for a real mailbox |

## Cost summary

| Item | Cost |
| --- | --- |
| Workspace Business Starter (merlin@) | ~$6/month |
| Gmail API calls | Free (well under quotas) |
| Supabase Edge Function invocations (~150/day) | Free tier |
| Claude inbox classification (~20 replies/day × $0.005) | ~$3/month |
| **Total monthly** | **~$10/month** |

## What this replaces

Before: Camelot OS sent emails from dgoldoff@ via a Resend identity. Replies came to dgoldoff@. The bot couldn't read its own inbox.

After: Camelot OS sends from merlin@camelot.nyc, replies flow into merlin's real inbox, get classified within 10 minutes, and update the matching `buildings.outreach_status` row automatically. Meeting requests trigger an immediate alert to dgoldoff@. Sam, Beth, and the team can claim leads directly from the Pipeline view based on real engagement signals.

The bot becomes a real team member — one with its own email, its own audit trail, its own scope of authority. And it scales without you having to forward, copy, or babysit anything.
