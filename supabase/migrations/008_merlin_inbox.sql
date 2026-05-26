-- supabase/migrations/008_merlin_inbox.sql
--
-- Adds the tables and cron schedule needed for the merlin@camelot.nyc mailbox
-- workflow: outbound messages (logged when the daily-lead-hunt or any other
-- bot sends mail) and inbound messages (logged when merlin-inbox-poll pulls
-- replies). Also extends `scout_buildings` with outreach status fields so the
-- Pipeline Kanban can reflect engagement state.

-- 1. Outbound message log ----------------------------------------------------

CREATE TABLE IF NOT EXISTS merlin_outbound_messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id       uuid REFERENCES scout_buildings(id) ON DELETE SET NULL,
  gmail_message_id  text NOT NULL,
  thread_id         text NOT NULL,
  to_addresses      text[] NOT NULL,
  cc_addresses      text[],
  bcc_addresses     text[],
  subject           text,
  html_snapshot     text,
  sent_at           timestamptz NOT NULL DEFAULT now(),
  sent_by_function  text,            -- 'daily-lead-hunt' | 'manual' | etc.
  jackie_deck_id    uuid,            -- optional FK to a Jackie proposal
  UNIQUE (gmail_message_id)
);
CREATE INDEX IF NOT EXISTS idx_merlin_outbound_thread   ON merlin_outbound_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_merlin_outbound_building ON merlin_outbound_messages(building_id);

-- 2. Inbound message log -----------------------------------------------------

CREATE TABLE IF NOT EXISTS merlin_inbound_messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id       uuid REFERENCES scout_buildings(id) ON DELETE SET NULL,
  gmail_message_id  text NOT NULL,
  thread_id         text NOT NULL,
  from_address      text NOT NULL,
  subject           text,
  snippet           text,
  body_text         text,
  intent            text CHECK (intent IN ('positive','objection','meeting_request','junk','unsubscribe','other')),
  confidence        text CHECK (confidence IN ('HIGH','MEDIUM','LOW')),
  summary           text,
  next_action       text,
  received_at       timestamptz NOT NULL DEFAULT now(),
  handled_by        uuid,            -- nullable FK to a Camelot user when picked up
  handled_at        timestamptz,
  UNIQUE (gmail_message_id)
);
CREATE INDEX IF NOT EXISTS idx_merlin_inbound_thread   ON merlin_inbound_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_merlin_inbound_building ON merlin_inbound_messages(building_id);
CREATE INDEX IF NOT EXISTS idx_merlin_inbound_intent   ON merlin_inbound_messages(intent);
CREATE INDEX IF NOT EXISTS idx_merlin_inbound_received ON merlin_inbound_messages(received_at DESC);

-- 3. Extend scout_buildings with outreach status ----------------------------------

ALTER TABLE scout_buildings
  ADD COLUMN IF NOT EXISTS outreach_status     text,        -- 'positive' | 'objection' | 'meeting_request' | 'unsubscribe' | etc.
  ADD COLUMN IF NOT EXISTS outreach_last_reply timestamptz,
  ADD COLUMN IF NOT EXISTS outreach_last_sent  timestamptz,
  ADD COLUMN IF NOT EXISTS assigned_to         uuid,         -- the Camelot user owning the lead
  ADD COLUMN IF NOT EXISTS assigned_at         timestamptz;

CREATE INDEX IF NOT EXISTS idx_buildings_outreach_status ON scout_buildings(outreach_status);
CREATE INDEX IF NOT EXISTS idx_buildings_assigned_to     ON scout_buildings(assigned_to);

-- 4. RLS ----------------------------------------------------------------------

ALTER TABLE merlin_outbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE merlin_inbound_messages  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read outbound" ON merlin_outbound_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "service role write outbound" ON merlin_outbound_messages FOR ALL    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated read inbound"  ON merlin_inbound_messages  FOR SELECT TO authenticated USING (true);
CREATE POLICY "service role write inbound"  ON merlin_inbound_messages  FOR ALL    TO service_role USING (true) WITH CHECK (true);

-- 5. Cron schedule -- poll merlin's inbox every 10 minutes -------------------

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'merlin-inbox-poll',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.settings.merlin_inbox_function_url', true),
    headers := jsonb_build_object(
                  'Content-Type','application/json',
                  'Authorization','Bearer ' || current_setting('app.settings.merlin_inbox_function_token', true)
              ),
    body    := '{}'::jsonb
  );
  $$
);

-- After deploying the merlin-inbox-poll Edge Function, set the URL + token:
--   ALTER DATABASE postgres SET app.settings.merlin_inbox_function_url   = 'https://<project>.supabase.co/functions/v1/merlin-inbox-poll';
--   ALTER DATABASE postgres SET app.settings.merlin_inbox_function_token = '<service-role-jwt>';

