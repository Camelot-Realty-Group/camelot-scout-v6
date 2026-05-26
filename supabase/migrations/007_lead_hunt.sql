-- supabase/migrations/007_lead_hunt.sql
-- Adds the Daily Lead Hunt feature to Camelot OS.
-- The bot inserts net-new prospects into the existing `scout_buildings` table with
-- stage = 'lead' so they appear automatically in the Pipeline Kanban via
-- the existing usePipeline() / useBuildings() hooks. We add the columns
-- needed to attribute, filter, and dedupe bot-sourced rows, plus a small
-- run-log table for auditability.

-- 1. Augment scout_buildings with lead-bot attribution fields ---------------------

ALTER TABLE scout_buildings
  ADD COLUMN IF NOT EXISTS lead_source        text,        -- 'kimi_deep_research' | 'cityrealty' | 'cnyc' | 'bizbuysell' | 'flagstar_auction' | etc.
  ADD COLUMN IF NOT EXISTS lead_category      text,        -- 'new_dev_manhattan' | 'new_dev_brooklyn' | 'new_dev_queens' | 'self_managed' | 'distress' | 'competitive_takeaway' | 'suburban' | 'florida' | 'pm_acquisition' | 'family_office' | 'referral_channel'
  ADD COLUMN IF NOT EXISTS lead_priority      text CHECK (lead_priority IN ('HIGH','MEDIUM','LOW')),
  ADD COLUMN IF NOT EXISTS lead_pitch_angle   text,        -- one-liner of why this fits Camelot
  ADD COLUMN IF NOT EXISTS lead_contact_path  text,        -- best route to the decision maker
  ADD COLUMN IF NOT EXISTS lead_source_url    text,
  ADD COLUMN IF NOT EXISTS lead_found_at      timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS lead_run_id        uuid;        -- FK -> lead_hunt_runs(id) so we can group "today's leads"

CREATE INDEX IF NOT EXISTS idx_buildings_lead_found_at ON scout_buildings(lead_found_at DESC);
CREATE INDEX IF NOT EXISTS idx_buildings_lead_priority ON scout_buildings(lead_priority);
CREATE INDEX IF NOT EXISTS idx_buildings_lead_category ON scout_buildings(lead_category);
CREATE INDEX IF NOT EXISTS idx_buildings_lead_run_id   ON scout_buildings(lead_run_id);

-- 2. Run log -- one row per scheduled bot execution ------------------------

CREATE TABLE IF NOT EXISTS lead_hunt_runs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at        timestamptz NOT NULL DEFAULT now(),
  finished_at       timestamptz,
  triggered_by      text NOT NULL DEFAULT 'cron',         -- 'cron' | 'manual' | 'api'
  sources_queried   text[] NOT NULL DEFAULT '{}',          -- list of source slugs hit
  candidates_found  integer NOT NULL DEFAULT 0,            -- rows the bot considered
  new_leads_inserted integer NOT NULL DEFAULT 0,           -- rows after dedupe
  duplicates_skipped integer NOT NULL DEFAULT 0,
  rejected_count    integer NOT NULL DEFAULT 0,
  corrected_count   integer NOT NULL DEFAULT 0,
  errors            jsonb NOT NULL DEFAULT '[]'::jsonb,
  email_sent_to     text[],                                -- ['dgoldoff@camelot.nyc']
  email_message_id  text,
  notes             text
);

CREATE INDEX IF NOT EXISTS idx_lead_hunt_runs_started_at ON lead_hunt_runs(started_at DESC);

ALTER TABLE scout_buildings
  ADD CONSTRAINT fk_buildings_lead_run
  FOREIGN KEY (lead_run_id) REFERENCES lead_hunt_runs(id) ON DELETE SET NULL;

-- Verification provenance from the Claude/Twin verification-gate handoff.
ALTER TABLE scout_buildings
  ADD COLUMN IF NOT EXISTS verification_status text,           -- 'VERIFIED' | 'CORRECTED' | 'UNVERIFIED'
  ADD COLUMN IF NOT EXISTS verified_at         timestamptz,
  ADD COLUMN IF NOT EXISTS verified_sources    jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS corrections         jsonb DEFAULT '[]'::jsonb;

-- 3. Source registry -- editable in the Settings UI ------------------------

CREATE TABLE IF NOT EXISTS lead_hunt_sources (
  slug              text PRIMARY KEY,                      -- 'cityrealty', 'cnyc', 'bizbuysell_ny', 'flagstar_auction', etc.
  display_name      text NOT NULL,
  category          text NOT NULL,                         -- 'new_dev' | 'board_rfp' | 'distress' | 'm_and_a' | 'compliance' | 'referral'
  geo_coverage      text[] NOT NULL DEFAULT '{NYC}',       -- ['NYC','Westchester','Fairfield_CT','NJ','FL']
  default_priority  text NOT NULL DEFAULT 'MEDIUM' CHECK (default_priority IN ('HIGH','MEDIUM','LOW')),
  enabled           boolean NOT NULL DEFAULT true,
  config            jsonb NOT NULL DEFAULT '{}'::jsonb,    -- per-source params (URL, RSS feed, search query, etc.)
  last_run_at       timestamptz,
  last_status       text
);

-- Seed the registry with the sources the boutique-fit rebuild used today.
INSERT INTO lead_hunt_sources (slug, display_name, category, geo_coverage, default_priority, config) VALUES
  ('cityrealty_new_dev',        'CityRealty new-development tracker',  'new_dev',    ARRAY['NYC'],                                  'HIGH',   '{}'::jsonb),
  ('nyyimby_new_dev',           'New York YIMBY',                       'new_dev',    ARRAY['NYC'],                                  'MEDIUM', '{}'::jsonb),
  ('cnyc_small_buildings',      'CNYC Small Co-op/Condo Group',         'board_rfp',  ARRAY['NYC'],                                  'HIGH',   '{"member_directory_url":"https://www.cnyc.com/"}'::jsonb),
  ('habitat_mag',               'Habitat Magazine board operations',    'board_rfp',  ARRAY['NYC'],                                  'MEDIUM', '{"rss":"https://www.habitatmag.com/rss"}'::jsonb),
  ('cooperator_news',           'CooperatorNews New York',              'board_rfp',  ARRAY['NYC'],                                  'MEDIUM', '{"rss":"https://cooperatornews.com/rss"}'::jsonb),
  ('flagstar_auction',          'Flagstar 5,100-unit bankruptcy auction','distress',  ARRAY['NYC'],                                  'HIGH',   '{"bid_deadline":"2026-12-15"}'::jsonb),
  ('nyc_dob_bis',               'NYC DOB BIS repeat violators',         'compliance', ARRAY['NYC'],                                  'HIGH',   '{}'::jsonb),
  ('nyc_ll97_dashboard',        'NYC Local Law 97 fines dashboard',     'compliance', ARRAY['NYC'],                                  'HIGH',   '{}'::jsonb),
  ('bizbuysell_ny_pm',          'BizBuySell â€” NY PM firms for sale',    'm_and_a',    ARRAY['NYC'],                                  'MEDIUM', '{"url":"https://www.bizbuysell.com/new-york/property-management-businesses-for-sale/"}'::jsonb),
  ('bizquest_nj_pm',            'BizQuest â€” NJ PM firms for sale',      'm_and_a',    ARRAY['NJ'],                                   'MEDIUM', '{"url":"https://www.bizquest.com/property-management-businesses-for-sale-in-new-jersey/"}'::jsonb),
  ('bizquest_fl_pm',            'BizQuest â€” FL PM firms for sale',      'm_and_a',    ARRAY['FL'],                                   'MEDIUM', '{"url":"https://www.bizquest.com/property-management-businesses-for-sale-in-florida/"}'::jsonb),
  ('fcap_fl_associations',      'FCAP Florida condo associations',      'board_rfp',  ARRAY['FL'],                                   'HIGH',   '{}'::jsonb),
  ('njbiz_hoa',                 'NJBIZ HOA + multifamily coverage',     'new_dev',    ARRAY['NJ'],                                   'MEDIUM', '{}'::jsonb),
  ('westchester_bizj',          'Westchester Business Journal',         'new_dev',    ARRAY['Westchester'],                          'MEDIUM', '{}'::jsonb),
  ('nyc_public_admin',          'NYC County Public Administrator',      'distress',   ARRAY['NYC'],                                  'MEDIUM', '{}'::jsonb),
  ('streeteasy_sponsor_units',  'StreetEasy unsold sponsor units',      'distress',   ARRAY['NYC'],                                  'HIGH',   '{"keywords":["sponsor unit","no board approval","unsold shares"]}'::jsonb),
  ('kimi_deep_research',        'Kimi Deep Research (Chrome agent)',    'new_dev',    ARRAY['NYC','Westchester','Fairfield_CT','NJ','FL'], 'HIGH', '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- 4. RLS so only authenticated org members can read leads ------------------

ALTER TABLE lead_hunt_runs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_hunt_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read runs"     ON lead_hunt_runs    FOR SELECT TO authenticated USING (true);
CREATE POLICY "service role write runs"     ON lead_hunt_runs    FOR ALL    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated read sources"  ON lead_hunt_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated update sources" ON lead_hunt_sources FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service role write sources"  ON lead_hunt_sources FOR ALL    TO service_role USING (true) WITH CHECK (true);

-- 5. Schedule the daily hunt at 6am America/New_York via pg_cron ----------
-- This requires the pg_cron extension to be enabled in your Supabase project
-- (Database -> Extensions -> pg_cron). The cron job calls the Edge Function
-- daily-lead-hunt deployed in the next file.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;   -- needed to POST to the Edge Function

-- 11:00 UTC = 06:00 America/New_York (EST) / 07:00 (EDT). Run daily.
SELECT cron.schedule(
  'camelot-daily-lead-hunt',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.settings.lead_hunt_function_url', true),
    headers := jsonb_build_object(
                  'Content-Type','application/json',
                  'Authorization','Bearer ' || current_setting('app.settings.lead_hunt_function_token', true)
              ),
    body    := jsonb_build_object('triggered_by','cron')
  );
  $$
);

-- Set these two values once after deploying the Edge Function:
--   ALTER DATABASE postgres SET app.settings.lead_hunt_function_url   = 'https://<project>.supabase.co/functions/v1/daily-lead-hunt';
--   ALTER DATABASE postgres SET app.settings.lead_hunt_function_token = '<service-role-jwt>';

