-- 010: Billable task queue
-- Separates AI-completed work from invoice creation so TARA owns billing review.

CREATE TABLE IF NOT EXISTS camelot_billable_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_bot TEXT NOT NULL DEFAULT 'manual',
  task_type TEXT NOT NULL,
  template_rate_id TEXT REFERENCES camelot_template_rates(id),
  building_id UUID REFERENCES scout_buildings(id),
  building_address TEXT NOT NULL,
  building_name TEXT,
  requested_by_name TEXT,
  requested_by_role TEXT,
  requested_by_email TEXT,
  payer_role TEXT NOT NULL,
  payer_name TEXT,
  payer_email TEXT,
  manager_owner TEXT,
  description TEXT NOT NULL,
  evidence_url TEXT,
  billable BOOLEAN DEFAULT true,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'queued',
  review_reason TEXT,
  invoice_id UUID REFERENCES camelot_template_invoices(id),
  hubspot_note_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_camelot_billable_tasks_status ON camelot_billable_tasks(status);
CREATE INDEX IF NOT EXISTS idx_camelot_billable_tasks_address ON camelot_billable_tasks(building_address);
CREATE INDEX IF NOT EXISTS idx_camelot_billable_tasks_payer_role ON camelot_billable_tasks(payer_role);
CREATE INDEX IF NOT EXISTS idx_camelot_billable_tasks_source_bot ON camelot_billable_tasks(source_bot);

DROP TRIGGER IF EXISTS trg_camelot_billable_tasks_updated_at ON camelot_billable_tasks;
CREATE TRIGGER trg_camelot_billable_tasks_updated_at
  BEFORE UPDATE ON camelot_billable_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_template_billing_updated_at();

ALTER TABLE camelot_billable_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage billable tasks"
  ON camelot_billable_tasks FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
