-- 009: Template Library rate sheets, generated documents, invoices and payments
-- This creates the audit trail for billable document automation.

CREATE TABLE IF NOT EXISTS camelot_template_rates (
  id TEXT PRIMARY KEY,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  asset_types TEXT[] DEFAULT '{}',
  billing_party TEXT NOT NULL,
  billing_mode TEXT NOT NULL,
  base_amount NUMERIC DEFAULT 0,
  min_amount NUMERIC,
  max_amount NUMERIC,
  percent_rate NUMERIC,
  description TEXT,
  included_in_base BOOLEAN DEFAULT false,
  approval_required BOOLEAN DEFAULT true,
  revenue_note TEXT,
  legal_review_status TEXT DEFAULT 'needs_review',
  source_url TEXT,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS camelot_generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_rate_id TEXT REFERENCES camelot_template_rates(id),
  building_id UUID REFERENCES scout_buildings(id),
  building_address TEXT NOT NULL,
  building_name TEXT,
  document_title TEXT NOT NULL,
  document_number TEXT NOT NULL,
  version_label TEXT DEFAULT 'v1',
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  generated_by TEXT,
  generated_payload JSONB DEFAULT '{}',
  preview_url TEXT,
  pdf_url TEXT,
  google_drive_url TEXT,
  hubspot_company_id TEXT,
  hubspot_contact_id TEXT,
  hubspot_deal_id TEXT,
  hubspot_synced_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS camelot_template_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_document_id UUID REFERENCES camelot_generated_documents(id),
  building_id UUID REFERENCES scout_buildings(id),
  building_address TEXT NOT NULL,
  building_name TEXT,
  invoice_number TEXT NOT NULL UNIQUE,
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  status TEXT DEFAULT 'draft',
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_provider TEXT,
  payment_link TEXT,
  accounting_system TEXT,
  accounting_invoice_id TEXT,
  hubspot_note_id TEXT,
  hubspot_deal_id TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS camelot_template_invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES camelot_template_invoices(id) ON DELETE CASCADE,
  template_rate_id TEXT REFERENCES camelot_template_rates(id),
  description TEXT NOT NULL,
  billing_party TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS camelot_template_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES camelot_template_invoices(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_by_name TEXT,
  paid_by_email TEXT,
  payment_url TEXT,
  raw_payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_camelot_template_rates_category ON camelot_template_rates(category);
CREATE INDEX IF NOT EXISTS idx_camelot_generated_documents_address ON camelot_generated_documents(building_address);
CREATE INDEX IF NOT EXISTS idx_camelot_template_invoices_address ON camelot_template_invoices(building_address);
CREATE INDEX IF NOT EXISTS idx_camelot_template_invoices_status ON camelot_template_invoices(status);
CREATE INDEX IF NOT EXISTS idx_camelot_template_payments_invoice ON camelot_template_payments(invoice_id);

CREATE OR REPLACE FUNCTION update_template_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_camelot_template_rates_updated_at ON camelot_template_rates;
CREATE TRIGGER trg_camelot_template_rates_updated_at
  BEFORE UPDATE ON camelot_template_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_billing_updated_at();

DROP TRIGGER IF EXISTS trg_camelot_generated_documents_updated_at ON camelot_generated_documents;
CREATE TRIGGER trg_camelot_generated_documents_updated_at
  BEFORE UPDATE ON camelot_generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_template_billing_updated_at();

DROP TRIGGER IF EXISTS trg_camelot_template_invoices_updated_at ON camelot_template_invoices;
CREATE TRIGGER trg_camelot_template_invoices_updated_at
  BEFORE UPDATE ON camelot_template_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_template_billing_updated_at();

DROP TRIGGER IF EXISTS trg_camelot_template_payments_updated_at ON camelot_template_payments;
CREATE TRIGGER trg_camelot_template_payments_updated_at
  BEFORE UPDATE ON camelot_template_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_template_billing_updated_at();

ALTER TABLE camelot_template_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE camelot_generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE camelot_template_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE camelot_template_invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE camelot_template_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage template rates"
  ON camelot_template_rates FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage generated documents"
  ON camelot_generated_documents FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage template invoices"
  ON camelot_template_invoices FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage template invoice lines"
  ON camelot_template_invoice_lines FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage template payments"
  ON camelot_template_payments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
