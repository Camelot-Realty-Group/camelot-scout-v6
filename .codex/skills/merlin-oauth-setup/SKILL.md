---
name: merlin-oauth-setup
description: |
  Set up or re-authenticate the merlin@camelot.nyc Gmail mailbox the Daily
  Lead Hunt bot uses to send outbound and read inbound mail. Use when the
  user asks to "set up merlin's email", "give the bot its own inbox",
  "rotate merlin's refresh token", "deploy the merlin inbox poller",
  "wire the bot to merlin@camelot.nyc", "configure ai@camelot.nyc",
  "re-auth merlin", or any variation involving merlin's Gmail credentials.
  Also use when the daily-lead-hunt Edge Function needs to switch its
  sender from Resend to merlin@'s real mailbox.
---

# Merlin OAuth Setup (Codex Skill)

## When to use this skill
Trigger on any of:
- "set up merlin's email"
- "give merlin its own inbox"
- "wire merlin@camelot.nyc"
- "configure ai@camelot.nyc"
- "rotate merlin's refresh token"
- "re-auth merlin"
- "deploy merlin inbox poller"
- "switch daily-lead-hunt to use merlin"

## What this skill produces
A PR that adds (or refreshes) the four code files + one doc file required to make merlin@camelot.nyc a real, addressable Google Workspace mailbox owned by the bot, with automatic reply classification and Pipeline status updates.

## Files this skill creates/updates

| Path | Purpose |
|------|---------|
| `scripts/setup_merlin_oauth.ts`                 | Local one-time Node script that captures merlin's refresh token via OAuth |
| `supabase/functions/_shared/gmail_merlin.ts`    | Shared Deno module — Gmail send + read + threading |
| `supabase/functions/merlin-inbox-poll/index.ts` | Edge Function that polls merlin's inbox every 10 min and classifies replies |
| `supabase/migrations/008_merlin_inbox.sql`      | Schema for `merlin_inbound_messages` + `merlin_outbound_messages`, extends `buildings` with outreach columns, schedules pg_cron |
| `docs/MERLIN_OAUTH_SETUP.md`                    | The 8-step manual setup runbook |
| `package.json` (modified)                       | Add `"setup:merlin": "tsx scripts/setup_merlin_oauth.ts"` |
| `.env.example` (modified)                       | Add MERLIN_* secret placeholders |
| `src/types/index.ts` (modified)                 | Add TypeScript types for new `buildings` outreach columns |
| `supabase/functions/daily-lead-hunt/index.ts` (modified) | Swap Resend → `merlinSend()`, log to `merlin_outbound_messages` |

## Procedure when invoked

1. **Verify the source files exist** in the Cowork outputs folder or the user's clipboard. If missing, ask the user to paste the file contents and DO NOT proceed without them — never reconstruct these files from memory.

2. **Create a feature branch**: `git checkout -b codex/merlin-oauth-setup`.

3. **Move the 5 source files** to the repo paths in the table above. Keep file contents byte-for-byte identical to the source — these files have been tested.

4. **Modify `daily-lead-hunt/index.ts`**:
   - Add `import { merlinSend } from "../_shared/gmail_merlin.ts";` at the top.
   - Replace the Resend `fetch("https://api.resend.com/emails", ...)` block with a call to `merlinSend({...})`. Preserve the same html, attachments, recipients, and subject.
   - After the send succeeds, insert a row into `merlin_outbound_messages` with `gmail_message_id`, `thread_id`, `to_addresses`, `cc_addresses`, `bcc_addresses`, `subject`, `sent_by_function: 'daily-lead-hunt'`.
   - Keep the old Resend block commented out with a `// FALLBACK:` header for rollback safety.

5. **Modify `.env.example`** — append:
   ```
   # Merlin Gmail mailbox (see docs/MERLIN_OAUTH_SETUP.md)
   MERLIN_GOOGLE_CLIENT_ID=
   MERLIN_GOOGLE_CLIENT_SECRET=
   MERLIN_GMAIL_REFRESH_TOKEN=
   MERLIN_EMAIL_ADDRESS=merlin@camelot.nyc
   MERLIN_LABEL_IDS={}
   ```

6. **Modify `src/types/index.ts`** — extend the `Building` interface with:
   ```ts
   outreach_status?:    'positive' | 'objection' | 'meeting_request' | 'junk' | 'unsubscribe' | 'other' | null;
   outreach_last_reply?: string | null;
   outreach_last_sent?:  string | null;
   assigned_to?:         string | null;
   assigned_at?:         string | null;
   ```

7. **Modify `package.json`** — add to scripts:
   ```json
   "setup:merlin": "tsx scripts/setup_merlin_oauth.ts"
   ```
   And add `"tsx"` to `devDependencies` if not present.

8. **Run typecheck**: `npm run typecheck` (or `tsc --noEmit`). Fix any type errors that surface from the new `Building` fields cascading into existing components.

9. **Open the PR** with:
   - Title: `feat: Merlin Gmail mailbox + inbox classifier (closes #merlin-oauth)`
   - Body: copy the "What this delivers" + "How the daily-lead-hunt function uses this" sections from `docs/MERLIN_OAUTH_SETUP.md`
   - Labels: `feature`, `infra`, `scout`
   - Reviewers: the user (David Goldoff) — this PR contains infrastructure changes that need David's sign-off before manual setup steps.

10. **Tell the user** which manual steps remain (these can't be automated):
    - Create `merlin@camelot.nyc` in Workspace Admin
    - Create the OAuth client in Google Cloud Console
    - Run `npm run setup:merlin` locally to capture the refresh token
    - Paste the 5 `supabase secrets set` commands the script prints
    - `supabase db push` to apply migration 008
    - `supabase functions deploy merlin-inbox-poll`
    - Re-deploy `daily-lead-hunt`
    - Set the two pg_cron URL/token database settings

## Hard rules

- **NEVER reconstruct these files from memory.** They are working, tested code. If the source isn't available, ask the user.
- **NEVER commit any real OAuth client secrets, refresh tokens, or service-role keys** to the repo. Even in `.env.example`, placeholders only.
- **NEVER run the migration or deploy the functions** as part of the PR — those are manual steps that require David's credentials.
- **NEVER remove the existing Resend code outright** on the first PR — comment it out as a fallback. Remove it in a follow-up PR after the bot is verified working on merlin@ for at least 7 days.
- **ALWAYS verify the OAuth scope list** in `setup_merlin_oauth.ts` matches what's documented in `docs/MERLIN_OAUTH_SETUP.md`. The four scopes must be: gmail.send, gmail.compose, gmail.modify, gmail.readonly.

## If something is wrong

If the source files in Cowork outputs don't match the file list above, STOP. Ask the user to confirm which version they want to ship. Do not guess.

If the user invokes this skill but the repo already has these files at the target paths, treat it as a "rotate" request: leave the code alone, regenerate ONLY the runbook in `docs/MERLIN_OAUTH_SETUP.md` if needed, and tell the user to re-run `npm run setup:merlin` to capture a new refresh token, then `supabase secrets set MERLIN_GMAIL_REFRESH_TOKEN='<new value>'`. No code changes needed for rotation.

## Cost of running this skill

Pure code-shuffling — no API calls beyond what Codex itself uses. Zero infra cost. The infra cost of the FEATURE this skill enables is ~$10/month (Workspace seat + Claude classification + Edge Function invocations).
