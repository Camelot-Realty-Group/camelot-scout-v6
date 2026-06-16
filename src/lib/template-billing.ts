import type { Building } from '@/types';

export type TemplateCategory =
  | 'leasing'
  | 'board_packages'
  | 'operations'
  | 'compliance'
  | 'accounting'
  | 'sales'
  | 'resident'
  | 'internal';

export type FeeBillingParty =
  | 'association'
  | 'board_member'
  | 'unit_owner'
  | 'shareholder'
  | 'owner'
  | 'resident'
  | 'renter'
  | 'vendor'
  | 'buyer'
  | 'seller'
  | 'landlord'
  | 'broker'
  | 'prospect';
export type FeeBillingMode = 'flat' | 'hourly' | 'percent' | 'included' | 'quote_required';
export type InvoiceStatus = 'draft' | 'approval_needed' | 'approved' | 'sent' | 'paid' | 'void';
export type BillableTaskStatus = 'queued' | 'needs_review' | 'approved' | 'invoiced' | 'waived' | 'rejected';

export interface TemplateRate {
  id: string;
  templateName: string;
  category: TemplateCategory;
  jurisdiction: 'NYC' | 'Westchester' | 'CT' | 'FL' | 'Multi-state';
  assetTypes: string[];
  billingParty: FeeBillingParty;
  billingMode: FeeBillingMode;
  baseAmount: number;
  minAmount?: number;
  maxAmount?: number;
  percentRate?: number;
  description: string;
  includedInBase?: boolean;
  approvalRequired: boolean;
  revenueNote: string;
}

export interface TemplateInvoiceLine {
  rateId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  billingParty: FeeBillingParty;
  notes?: string;
}

export interface TemplateInvoiceDraft {
  id: string;
  invoiceNumber: string;
  buildingId?: string;
  buildingAddress: string;
  buildingName?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  status: InvoiceStatus;
  lines: TemplateInvoiceLine[];
  subtotal: number;
  approvalNote: string;
  paymentLink?: string;
  hubspotSyncStatus: 'not_synced' | 'queued' | 'synced';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillableTaskEvent {
  id: string;
  sourceBot: 'tara' | 'template_desk' | 'excalibur' | 'shield' | 'merlin' | 'report_center' | 'manual';
  taskType: string;
  rateId?: string;
  buildingId?: string;
  buildingAddress: string;
  buildingName?: string;
  requestedByName?: string;
  requestedByRole?: FeeBillingParty;
  requestedByEmail?: string;
  payerRole: FeeBillingParty;
  payerName?: string;
  payerEmail?: string;
  managerOwner?: string;
  description: string;
  evidenceUrl?: string;
  billable: boolean;
  amount: number;
  status: BillableTaskStatus;
  reviewReason: string;
  createdAt: string;
  updatedAt: string;
}

export const TEMPLATE_RATE_SHEET: TemplateRate[] = [
  {
    id: 'proposal-property-management',
    templateName: 'Proposal of Property Management Services',
    category: 'sales',
    jurisdiction: 'Multi-state',
    assetTypes: ['co-op', 'condo', 'rental', 'mixed-use', 'commercial'],
    billingParty: 'prospect',
    billingMode: 'included',
    baseAmount: 0,
    includedInBase: true,
    approvalRequired: false,
    description: 'New-business proposal, management scope, pricing, transition plan, and next steps.',
    revenueNote: 'Free sales document that should create a management-fee opportunity.',
  },
  {
    id: 'management-agreement',
    templateName: 'Property Management Agreement + Schedule A',
    category: 'sales',
    jurisdiction: 'Multi-state',
    assetTypes: ['co-op', 'condo', 'rental', 'mixed-use'],
    billingParty: 'association',
    billingMode: 'included',
    baseAmount: 0,
    includedInBase: true,
    approvalRequired: true,
    description: 'Final management agreement with fee schedule and ancillary fee exhibit.',
    revenueNote: 'Controls the recurring management fee and all downstream ancillary revenue.',
  },
  {
    id: 'transition-request-letter',
    templateName: 'Outgoing Management Transition Request',
    category: 'operations',
    jurisdiction: 'Multi-state',
    assetTypes: ['co-op', 'condo', 'rental', 'hoa'],
    billingParty: 'association',
    billingMode: 'flat',
    baseAmount: 250,
    approvalRequired: true,
    description: 'Formal request to prior manager for records, bank data, vendor files, arrears, and resident data.',
    revenueNote: 'Can be included in onboarding or billed when transition work expands beyond standard scope.',
  },
  {
    id: 'alteration-agreement',
    templateName: 'Alteration Agreement Package',
    category: 'operations',
    jurisdiction: 'NYC',
    assetTypes: ['co-op', 'condo'],
    billingParty: 'unit_owner',
    billingMode: 'flat',
    baseAmount: 500,
    minAmount: 350,
    maxAmount: 1500,
    approvalRequired: true,
    description: 'Alteration application, contractor requirements, COI checklist, scope intake, DOB/TPP review path.',
    revenueNote: 'High-frequency resident service. Processing and administrative review should be billable.',
  },
  {
    id: 'decorative-agreement',
    templateName: 'Decorative / Repair Agreement',
    category: 'operations',
    jurisdiction: 'NYC',
    assetTypes: ['co-op', 'condo'],
    billingParty: 'unit_owner',
    billingMode: 'flat',
    baseAmount: 250,
    minAmount: 150,
    maxAmount: 500,
    approvalRequired: true,
    description: 'Small-scope painting, flooring, appliance, and non-structural repair approval package.',
    revenueNote: 'Low-friction processing fee that protects staff time.',
  },
  {
    id: 'move-in-out',
    templateName: 'Move-In / Move-Out Package',
    category: 'resident',
    jurisdiction: 'Multi-state',
    assetTypes: ['co-op', 'condo', 'rental'],
    billingParty: 'resident',
    billingMode: 'flat',
    baseAmount: 500,
    minAmount: 250,
    maxAmount: 1000,
    approvalRequired: false,
    description: 'Elevator reservation, insurance requirements, house rules, superintendent coordination, deposits.',
    revenueNote: 'Frequent building-level fee with clear resident benefit and operational protection.',
  },
  {
    id: 'purchase-board-package',
    templateName: 'Purchase Board Package',
    category: 'board_packages',
    jurisdiction: 'NYC',
    assetTypes: ['co-op', 'condo'],
    billingParty: 'buyer',
    billingMode: 'flat',
    baseAmount: 750,
    minAmount: 500,
    maxAmount: 1500,
    approvalRequired: true,
    description: 'Buyer package checklist, application, financials, references, broker instructions, board workflow.',
    revenueNote: 'A serious revenue center for managed co-op and condo buildings.',
  },
  {
    id: 'sublet-lease-package',
    templateName: 'Sublet / Lease Board Package',
    category: 'board_packages',
    jurisdiction: 'NYC',
    assetTypes: ['co-op', 'condo'],
    billingParty: 'unit_owner',
    billingMode: 'flat',
    baseAmount: 500,
    minAmount: 250,
    maxAmount: 1000,
    approvalRequired: true,
    description: 'Sublet intake, lease review checklist, broker/renter packet, move-in coordination, board approval flow.',
    revenueNote: 'Repeatable charge tied to board control and resident service.',
  },
  {
    id: 'refinance-questionnaire',
    templateName: 'Refinance / Lender Questionnaire Package',
    category: 'board_packages',
    jurisdiction: 'Multi-state',
    assetTypes: ['co-op', 'condo'],
    billingParty: 'unit_owner',
    billingMode: 'flat',
    baseAmount: 350,
    minAmount: 250,
    maxAmount: 750,
    approvalRequired: true,
    description: 'Questionnaire, insurance, financial summary, litigation/compliance questions, lender response packet.',
    revenueNote: 'Billable lender-facing work that frequently consumes office time.',
  },
  {
    id: 'lease-renewal',
    templateName: 'Lease Renewal Package',
    category: 'leasing',
    jurisdiction: 'NYC',
    assetTypes: ['rental', 'mixed-use'],
    billingParty: 'landlord',
    billingMode: 'flat',
    baseAmount: 250,
    minAmount: 150,
    maxAmount: 500,
    approvalRequired: true,
    description: 'Renewal generation, rent-stabilized/free-market branch, owner approval, resident delivery checklist.',
    revenueNote: 'Automates recurring leasing admin while keeping regulated renewals controlled.',
  },
  {
    id: 'rpie-prep',
    templateName: 'RPIE Prep Packet',
    category: 'compliance',
    jurisdiction: 'NYC',
    assetTypes: ['rental', 'commercial', 'mixed-use'],
    billingParty: 'owner',
    billingMode: 'quote_required',
    baseAmount: 750,
    minAmount: 500,
    maxAmount: 2500,
    approvalRequired: true,
    description: 'Income/expense intake, exclusions, owner questions, filing checklist, accounting review path.',
    revenueNote: 'Should be scoped by building complexity and accounting condition.',
  },
  {
    id: 'mdr-hpd-registration',
    templateName: 'MDR / HPD Registration Packet',
    category: 'compliance',
    jurisdiction: 'NYC',
    assetTypes: ['co-op', 'condo', 'rental', 'mixed-use'],
    billingParty: 'association',
    billingMode: 'flat',
    baseAmount: 350,
    minAmount: 250,
    maxAmount: 750,
    approvalRequired: true,
    description: 'Owner, officer, managing agent, emergency contact, annual registration and update workflow.',
    revenueNote: 'Annual compliance task that should be tracked and charged when outside base scope.',
  },
  {
    id: 'coop-condo-abatement',
    templateName: 'Co-op / Condo Tax Abatement Packet',
    category: 'compliance',
    jurisdiction: 'NYC',
    assetTypes: ['co-op', 'condo'],
    billingParty: 'association',
    billingMode: 'flat',
    baseAmount: 500,
    minAmount: 350,
    maxAmount: 1500,
    approvalRequired: true,
    description: 'Unit eligibility, primary residence questionnaire, board signoff, annual submission checklist.',
    revenueNote: 'High-value annual workflow; fee can be building-paid or unit-level depending governing docs.',
  },
  {
    id: 'vendor-onboarding',
    templateName: 'Vendor Onboarding / W-9 / COI Package',
    category: 'accounting',
    jurisdiction: 'Multi-state',
    assetTypes: ['co-op', 'condo', 'rental', 'commercial', 'hoa'],
    billingParty: 'vendor',
    billingMode: 'included',
    baseAmount: 0,
    includedInBase: true,
    approvalRequired: false,
    description: 'W-9, COI, license, ACH, indemnity, preferred vendor setup, compliance document capture.',
    revenueNote: 'Usually not charged directly, but reduces accounting risk and payment delays.',
  },
  {
    id: 'violation-response-packet',
    templateName: 'Violation Response Packet',
    category: 'compliance',
    jurisdiction: 'NYC',
    assetTypes: ['co-op', 'condo', 'rental', 'mixed-use', 'commercial'],
    billingParty: 'association',
    billingMode: 'hourly',
    baseAmount: 175,
    minAmount: 350,
    approvalRequired: true,
    description: 'HPD/DOB/ECB issue summary, vendor assignment, correction proof, certification and hearing path.',
    revenueNote: 'Good fit for hourly or project admin billing because the scope varies widely.',
  },
];

export function getTemplateRateById(id: string) {
  return TEMPLATE_RATE_SHEET.find((rate) => rate.id === id);
}

export function recommendRatesForBuilding(building?: Partial<Building>) {
  if (!building) return TEMPLATE_RATE_SHEET;
  const type = String(building.type || '').toLowerCase();
  return TEMPLATE_RATE_SHEET.filter((rate) => {
    if (rate.assetTypes.includes('mixed-use') && type === 'mixed-use') return true;
    return !type || rate.assetTypes.includes(type) || rate.assetTypes.includes('commercial');
  });
}

export function calculateTemplateFee(rate: TemplateRate, quantity = 1, customAmount?: number) {
  if (rate.billingMode === 'included') return 0;
  if (rate.billingMode === 'quote_required') return customAmount ?? rate.baseAmount;
  const amount = customAmount ?? rate.baseAmount;
  return Math.round(amount * quantity * 100) / 100;
}

export function createTemplateInvoiceDraft(params: {
  building?: Partial<Building>;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  selectedRateIds: string[];
  generatedBy?: string;
  customAmounts?: Record<string, number>;
}): TemplateInvoiceDraft {
  const createdAt = new Date().toISOString();
  const address = params.building?.address || 'Unassigned property';
  const date = createdAt.slice(0, 10).replace(/-/g, '');
  const shortAddress = address.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase() || 'DOC';

  const lines = params.selectedRateIds
    .map((id) => getTemplateRateById(id))
    .filter((rate): rate is TemplateRate => Boolean(rate))
    .map((rate) => {
      const custom = params.customAmounts?.[rate.id];
      const amount = calculateTemplateFee(rate, 1, custom);
      return {
        rateId: rate.id,
        description: rate.templateName,
        quantity: 1,
        unitPrice: amount,
        amount,
        billingParty: rate.billingParty,
        notes:
          rate.billingMode === 'quote_required'
            ? 'Estimate only. Final price requires scope approval.'
            : rate.includedInBase
              ? 'Included or no-charge item; track for value and audit trail.'
              : rate.description,
      };
    });

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const requiresApproval = lines.some((line) => getTemplateRateById(line.rateId)?.approvalRequired);

  return {
    id: `invoice-${shortAddress}-${Date.now()}`,
    invoiceNumber: `CT-${date}-${shortAddress}`,
    buildingId: params.building?.id,
    buildingAddress: address,
    buildingName: params.building?.name,
    recipientName: params.recipientName,
    recipientEmail: params.recipientEmail,
    recipientPhone: params.recipientPhone,
    status: requiresApproval ? 'approval_needed' : 'draft',
    lines,
    subtotal,
    approvalNote: requiresApproval
      ? 'Review scope and governing documents before sending. AI prepared the invoice draft; Camelot must approve billing.'
      : 'Draft created for tracking and optional billing.',
    hubspotSyncStatus: 'not_synced',
    createdBy: params.generatedBy || 'Camelot OS',
    createdAt,
    updatedAt: createdAt,
  };
}

export function classifyPayerRole(input: {
  taskType?: string;
  assetType?: string;
  requestedByRole?: string;
  contactRole?: string;
}): FeeBillingParty {
  const text = [input.taskType, input.assetType, input.requestedByRole, input.contactRole]
    .join(' ')
    .toLowerCase();

  if (/buyer|purchase|sale package|board package/.test(text)) return 'buyer';
  if (/seller|resale|closing/.test(text)) return 'seller';
  if (/renter|tenant|lease|rental application/.test(text)) return 'renter';
  if (/vendor|contractor|w-?9|coi/.test(text)) return 'vendor';
  if (/landlord|rental owner|rent roll|rpie|lease renewal/.test(text)) return 'landlord';
  if (/board member|board|association|condo|coop|co-op|mdr|hpd|abatement/.test(text)) {
    return 'association';
  }
  if (/unit owner|shareholder|alteration|decorative|refinance|sublet/.test(text)) return 'unit_owner';
  if (/broker/.test(text)) return 'broker';
  return 'prospect';
}

export function createBillableTaskEvent(params: {
  sourceBot?: BillableTaskEvent['sourceBot'];
  rateId?: string;
  building?: Partial<Building>;
  requestedByName?: string;
  requestedByRole?: FeeBillingParty;
  requestedByEmail?: string;
  payerRole?: FeeBillingParty;
  payerName?: string;
  payerEmail?: string;
  managerOwner?: string;
  evidenceUrl?: string;
  customDescription?: string;
  customAmount?: number;
}): BillableTaskEvent {
  const rate = params.rateId ? getTemplateRateById(params.rateId) : undefined;
  const createdAt = new Date().toISOString();
  const payerRole =
    params.payerRole ||
    rate?.billingParty ||
    classifyPayerRole({
      taskType: rate?.templateName,
      assetType: params.building?.type,
      requestedByRole: params.requestedByRole,
    });
  const amount = rate ? calculateTemplateFee(rate, 1, params.customAmount) : params.customAmount || 0;
  const billable = Boolean(rate && rate.billingMode !== 'included' && amount > 0);
  const approvalNeeded = Boolean(rate?.approvalRequired || !params.payerName || !params.payerEmail);

  return {
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    sourceBot: params.sourceBot || 'manual',
    taskType: rate?.templateName || 'Manual billable task',
    rateId: rate?.id,
    buildingId: params.building?.id,
    buildingAddress: params.building?.address || 'Unassigned property',
    buildingName: params.building?.name,
    requestedByName: params.requestedByName,
    requestedByRole: params.requestedByRole,
    requestedByEmail: params.requestedByEmail,
    payerRole,
    payerName: params.payerName || params.requestedByName,
    payerEmail: params.payerEmail || params.requestedByEmail,
    managerOwner: params.managerOwner,
    description: params.customDescription || rate?.description || 'AI completed a billable task.',
    evidenceUrl: params.evidenceUrl,
    billable,
    amount,
    status: billable ? (approvalNeeded ? 'needs_review' : 'queued') : 'waived',
    reviewReason: approvalNeeded
      ? 'Manager review required before invoice. Confirm payer, governing documents, fee schedule and recipient.'
      : 'Ready for account manager approval and invoice drafting.',
    createdAt,
    updatedAt: createdAt,
  };
}

export function formatBillingMode(mode: FeeBillingMode) {
  switch (mode) {
    case 'flat':
      return 'Flat fee';
    case 'hourly':
      return 'Hourly';
    case 'percent':
      return 'Percent';
    case 'included':
      return 'Included';
    case 'quote_required':
      return 'Scope quote';
    default:
      return mode;
  }
}
