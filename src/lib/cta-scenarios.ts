import type { Building, PipelineStage } from '@/types';

export type CtaScenarioId =
  | 'compliance_violations'
  | 'll97_carbon'
  | 'financing_refinance'
  | 'board_management'
  | 'transition_friction'
  | 'vendor_cost_review'
  | 'arrears_collections'
  | 'capital_project'
  | 'resident_experience'
  | 'self_managed'
  | 'pe_consolidation'
  | 'foreign_investor'
  | 'proposal_follow_up'
  | 'new_engagement'
  | 'general_management_review';

export interface CtaScenario {
  id: CtaScenarioId;
  label: string;
  trigger: string;
  primaryCta: string;
  secondaryCta: string;
  hubspotStage: PipelineStage;
  taskTitle: string;
  taskDueDays: number;
  emailSubject: string;
  emailBody: string;
  priority: 'same-day' | '24-48 hours' | 'nurture';
  tags: string[];
}

export const CTA_SCENARIOS: CtaScenario[] = [
  {
    id: 'compliance_violations',
    label: 'Compliance / Violations',
    trigger: 'Open HPD, DOB, ECB, or building-risk issue',
    primaryCta: 'Schedule a compliance gut check',
    secondaryCta: 'Send violation summary and next-step request',
    hubspotStage: 'contacted',
    taskTitle: 'Call owner or board about open violation exposure',
    taskDueDays: 1,
    emailSubject: 'Property compliance review for {{address}}',
    emailBody:
      'Camelot identified public-record compliance signals worth reviewing. The next step is a short call to confirm what is active, what is already being handled, and whether Camelot can help organize a resolution plan.',
    priority: 'same-day',
    tags: ['cta:compliance', 'pain:violations', 'next:gut-check'],
  },
  {
    id: 'll97_carbon',
    label: 'LL97 / Carbon Exposure',
    trigger: 'LL97 modeled penalty or energy-risk signal',
    primaryCta: 'Request an LL97 exposure review',
    secondaryCta: 'Offer carbon-cap summary and compliance roadmap',
    hubspotStage: 'contacted',
    taskTitle: 'Review LL97 exposure and offer compliance roadmap',
    taskDueDays: 2,
    emailSubject: 'LL97 exposure review for {{address}}',
    emailBody:
      'Camelot can provide an initial LL97 exposure summary, then scope any engineering, filing, or remediation work separately once the board confirms the facts and budget goals.',
    priority: '24-48 hours',
    tags: ['cta:ll97', 'pain:energy', 'next:compliance-roadmap'],
  },
  {
    id: 'financing_refinance',
    label: 'Financing / Refinance',
    trigger: 'Mortgage, refinance, line of credit, or capital funding need',
    primaryCta: 'Run financing options',
    secondaryCta: 'Request mortgage statements and maturity schedule',
    hubspotStage: 'proposal',
    taskTitle: 'Prepare refinance or capital funding RFP checklist',
    taskDueDays: 2,
    emailSubject: 'Financing and management review for {{address}}',
    emailBody:
      'Camelot can help ownership compare bank options through an RFP process, coordinate required documents, and present financing sensitivity options for refinancing, capital improvements, credit lines, or reserve planning.',
    priority: '24-48 hours',
    tags: ['cta:financing', 'pain:refinance', 'next:bank-rfp'],
  },
  {
    id: 'board_management',
    label: 'Board Management Review',
    trigger: 'Co-op or condo board lead needing management support',
    primaryCta: 'Book a board management review',
    secondaryCta: 'Send first meeting handout',
    hubspotStage: 'proposal',
    taskTitle: 'Schedule board review and send meeting handout',
    taskDueDays: 2,
    emailSubject: 'Camelot management review for {{address}}',
    emailBody:
      'Camelot can walk the board through management scope, accounting, transition, resident communication, compliance support, and practical next steps without forcing a heavy corporate process onto the building.',
    priority: '24-48 hours',
    tags: ['cta:board-review', 'asset:coop-condo', 'next:meeting-handout'],
  },
  {
    id: 'transition_friction',
    label: 'Transition / Manager Change',
    trigger: 'Current management frustration, stale records, or changeover concern',
    primaryCta: 'Review the 30-day transition plan',
    secondaryCta: 'Request current management reports and vendor list',
    hubspotStage: 'proposal',
    taskTitle: 'Send transition checklist and request core records',
    taskDueDays: 2,
    emailSubject: '30-day transition plan for {{address}}',
    emailBody:
      'Camelot reduces transition risk by controlling files first, establishing the financial baseline, reviewing vendors, setting communication protocols, and issuing an early priority plan.',
    priority: '24-48 hours',
    tags: ['cta:transition', 'pain:manager-change', 'next:file-request'],
  },
  {
    id: 'vendor_cost_review',
    label: 'Vendor / Insurance Cost Review',
    trigger: 'High operating cost, insurance pressure, or vendor inefficiency',
    primaryCta: 'Run vendor and insurance rebid review',
    secondaryCta: 'Request current invoices and policies',
    hubspotStage: 'proposal',
    taskTitle: 'Ask for top vendor invoices and insurance summary',
    taskDueDays: 3,
    emailSubject: 'Vendor and insurance review for {{address}}',
    emailBody:
      'Camelot can compare recurring vendor costs, insurance structure, service levels, and contract terms, then flag practical areas where the building may have savings or better accountability.',
    priority: '24-48 hours',
    tags: ['cta:vendor-review', 'pain:costs', 'next:invoice-request'],
  },
  {
    id: 'arrears_collections',
    label: 'Arrears / Collections',
    trigger: 'Arrears, collections, maintenance billing, or shareholder payment issue',
    primaryCta: 'Review receivables and collection controls',
    secondaryCta: 'Request arrears report',
    hubspotStage: 'proposal',
    taskTitle: 'Request arrears report and collection procedure',
    taskDueDays: 2,
    emailSubject: 'Collections and reporting controls for {{address}}',
    emailBody:
      'Camelot can help boards establish cleaner billing, arrears reporting, counsel coordination, payment controls, and monthly financial visibility.',
    priority: '24-48 hours',
    tags: ['cta:collections', 'pain:arrears', 'next:receivables-review'],
  },
  {
    id: 'capital_project',
    label: 'Capital Project Oversight',
    trigger: 'Capital project, Local Law work, construction, or engineering need',
    primaryCta: 'Scope a project controls review',
    secondaryCta: 'Request contracts, proposals, and project timeline',
    hubspotStage: 'proposal',
    taskTitle: 'Collect project documents and discuss controls',
    taskDueDays: 2,
    emailSubject: 'Capital project support for {{address}}',
    emailBody:
      'Camelot can coordinate project controls, budgets, bidding, insurance certificates, engineer or attorney advisory roles, and board communication for capital work.',
    priority: '24-48 hours',
    tags: ['cta:project-management', 'pain:capital-projects', 'next:project-documents'],
  },
  {
    id: 'resident_experience',
    label: 'Resident Experience / Portal',
    trigger: 'Resident communication, work orders, payment portal, or service issue',
    primaryCta: 'Demo resident and board communication workflow',
    secondaryCta: 'Map current resident service process',
    hubspotStage: 'contacted',
    taskTitle: 'Offer portal and resident communication demo',
    taskDueDays: 3,
    emailSubject: 'Resident service workflow for {{address}}',
    emailBody:
      'Camelot can support payment workflows, work orders, service tickets, file access, resident communication, and board visibility through a practical mix of people, software, and automation.',
    priority: '24-48 hours',
    tags: ['cta:resident-experience', 'pain:communication', 'next:portal-demo'],
  },
  {
    id: 'self_managed',
    label: 'Self-Managed / Lightly Managed',
    trigger: 'Self-managed building or local manager with limited bench',
    primaryCta: 'Discuss professional management readiness',
    secondaryCta: 'Request budget, board cadence, and vendor list',
    hubspotStage: 'contacted',
    taskTitle: 'Book readiness call for self-managed building',
    taskDueDays: 2,
    emailSubject: 'Professional management readiness review for {{address}}',
    emailBody:
      'Camelot can help small buildings move from informal or lightly managed operations into a practical management structure without creating unnecessary bureaucracy.',
    priority: '24-48 hours',
    tags: ['cta:self-managed', 'pain:board-fatigue', 'next:readiness-call'],
  },
  {
    id: 'pe_consolidation',
    label: 'Owner-Operated Alternative',
    trigger: 'Private equity consolidation or large-firm service concern',
    primaryCta: 'Compare owner-operated management model',
    secondaryCta: 'Send boutique management positioning',
    hubspotStage: 'nurture',
    taskTitle: 'Send owner-operated management alternative',
    taskDueDays: 5,
    emailSubject: 'Owner-operated management alternative for {{address}}',
    emailBody:
      'Camelot positions itself as a hands-on owner-operator management partner for boards that want senior attention, disciplined systems, and practical local accountability.',
    priority: 'nurture',
    tags: ['cta:owner-operated', 'market:pe-consolidation', 'next:nurture'],
  },
  {
    id: 'foreign_investor',
    label: 'Foreign Investor / Local Operator',
    trigger: 'Foreign capital, family office, or out-of-market owner',
    primaryCta: 'Partner with a local operator',
    secondaryCta: 'Offer NYC operating review',
    hubspotStage: 'contacted',
    taskTitle: 'Offer local operator meeting',
    taskDueDays: 2,
    emailSubject: 'NYC local operator review for {{address}}',
    emailBody:
      'Camelot can support out-of-market ownership with local management, operating discipline, compliance coordination, vendor oversight, and practical reporting.',
    priority: '24-48 hours',
    tags: ['cta:local-operator', 'audience:foreign-investor', 'next:operator-call'],
  },
  {
    id: 'proposal_follow_up',
    label: 'Proposal Follow-Up',
    trigger: 'Proposal, first email intro, or meeting handout generated',
    primaryCta: 'Schedule the proposal review call',
    secondaryCta: 'Ask for financials and board availability',
    hubspotStage: 'proposal',
    taskTitle: 'Follow up on proposal and request board review slot',
    taskDueDays: 1,
    emailSubject: 'Next step on Camelot proposal for {{address}}',
    emailBody:
      'Camelot should follow up with the contacts tied to this report, confirm receipt, request missing documents, and schedule a board or owner review call.',
    priority: 'same-day',
    tags: ['cta:proposal-follow-up', 'next:board-zoom', 'marketing:first-round'],
  },
  {
    id: 'new_engagement',
    label: 'New Engagement / Kickoff',
    trigger: 'Won opportunity or signed management agreement',
    primaryCta: 'Start transition kickoff',
    secondaryCta: 'Send transition file request',
    hubspotStage: 'won',
    taskTitle: 'Launch new engagement transition checklist',
    taskDueDays: 0,
    emailSubject: 'Transition kickoff for {{address}}',
    emailBody:
      'Camelot should create the transition folder, request prior-agent files, confirm resident communication timing, and schedule a meet-and-greet with the board, residents, and management team.',
    priority: 'same-day',
    tags: ['cta:kickoff', 'stage:won', 'next:transition'],
  },
  {
    id: 'general_management_review',
    label: 'General Management Review',
    trigger: 'General lead without a sharper confirmed pain point',
    primaryCta: 'Offer a complimentary property management review',
    secondaryCta: 'Send short intro and request a 15-minute call',
    hubspotStage: 'contacted',
    taskTitle: 'Send intro and request management review call',
    taskDueDays: 3,
    emailSubject: 'Camelot property management review for {{address}}',
    emailBody:
      'Camelot should introduce its management platform, explain why the property surfaced as a fit, and ask for a short call to discuss property management services.',
    priority: '24-48 hours',
    tags: ['cta:management-review', 'next:intro-call'],
  },
];

const CTA_BY_ID = Object.fromEntries(CTA_SCENARIOS.map((scenario) => [scenario.id, scenario])) as Record<CtaScenarioId, CtaScenario>;

function textHaystack(building: Partial<Building>, context?: Record<string, unknown>) {
  return [
    building.name,
    building.address,
    building.type,
    building.current_management,
    building.neighborhood,
    building.borough,
    ...(building.tags || []),
    ...(building.signals || []),
    context?.action,
    context?.packageType,
    context?.packageLabel,
    context?.notes,
    Array.isArray(context?.reportFocus) ? context.reportFocus.join(' ') : context?.reportFocus,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getCtaScenario(id: CtaScenarioId) {
  return CTA_BY_ID[id] || CTA_BY_ID.general_management_review;
}

export function selectCtaScenario(building: Partial<Building>, context: Record<string, unknown> = {}): CtaScenario {
  const haystack = textHaystack(building, context);
  const openViolations = Number(building.open_violations_count || 0);
  const totalViolations = Number(building.violations_count || 0);
  const isBoardAsset = /co-op|coop|condo|hoa/i.test(`${building.type || ''} ${haystack}`);

  if (/won|signed|kickoff|new engagement|management agreement executed/.test(haystack)) {
    return CTA_BY_ID.new_engagement;
  }
  if (/proposal|first email|meeting handout|board meeting|agenda|appendix|jackie/.test(haystack)) {
    return CTA_BY_ID.proposal_follow_up;
  }
  if (/financ|refinanc|mortgage|credit line|loan|bank|capital funding/.test(haystack)) {
    return CTA_BY_ID.financing_refinance;
  }
  if (/ll97|carbon|energy|eui|emission/.test(haystack)) {
    return CTA_BY_ID.ll97_carbon;
  }
  if (openViolations > 0 || totalViolations > 0 || /violation|hpd|dob|ecb|fisp|local law|compliance/.test(haystack)) {
    return CTA_BY_ID.compliance_violations;
  }
  if (/capital|project|construction|facade|roof|boiler|elevator|engineer/.test(haystack)) {
    return CTA_BY_ID.capital_project;
  }
  if (/arrears|collection|maintenance billing|receivable|common charge/.test(haystack)) {
    return CTA_BY_ID.arrears_collections;
  }
  if (/vendor|insurance|cost|budget savings|rebid|deductible/.test(haystack)) {
    return CTA_BY_ID.vendor_cost_review;
  }
  if (/resident|portal|work order|concierge|communication|ticket/.test(haystack)) {
    return CTA_BY_ID.resident_experience;
  }
  if (/self[- ]managed|lightly managed|board fatigue|local manager/.test(haystack)) {
    return CTA_BY_ID.self_managed;
  }
  if (/private equity|pe consolidation|roll[- ]up|large firm/.test(haystack)) {
    return CTA_BY_ID.pe_consolidation;
  }
  if (/foreign|japan|korea|middle east|singapore|canadian|family office|out-of-market/.test(haystack)) {
    return CTA_BY_ID.foreign_investor;
  }
  if (isBoardAsset) return CTA_BY_ID.board_management;
  return CTA_BY_ID.general_management_review;
}

export function renderCtaTemplate(template: string, building: Partial<Building>) {
  return template
    .replace(/\{\{address\}\}/g, building.address || building.name || 'the property')
    .replace(/\{\{buildingName\}\}/g, building.name || building.address || 'the property');
}
