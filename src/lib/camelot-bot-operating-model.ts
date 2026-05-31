import type { CtaScenarioId } from '@/lib/cta-scenarios';

export type CamelotBotOwner =
  | 'jackie'
  | 'media-desk'
  | 'guardian'
  | 'financing-desk'
  | 'excalibur'
  | 'meeting-desk'
  | 'dailyhunt'
  | 'hubspot-desk'
  | 'merlin';

export type CamelotBotPhase =
  | 'intake'
  | 'fact-authority'
  | 'media'
  | 'risk'
  | 'financing'
  | 'proposal'
  | 'outreach'
  | 'crm';

export interface CamelotBotBoundary {
  id: CamelotBotOwner;
  name: string;
  phase: CamelotBotPhase;
  owns: string[];
  doesNotOwn: string[];
  handoffTo: CamelotBotOwner[];
  hubspotCtaScenarios: CtaScenarioId[];
}

export const CAMELOT_BOT_OPERATING_MODEL: CamelotBotBoundary[] = [
  {
    id: 'dailyhunt',
    name: 'Daily Hunt / Bulk Intake',
    phase: 'intake',
    owns: [
      'CSV/XLSX upload queues',
      'bulk property-list verification',
      'duplicate detection',
      'candidate lead triage',
    ],
    doesNotOwn: [
      'client-facing report copy',
      'pricing recommendations',
      'final property facts without verification',
    ],
    handoffTo: ['jackie', 'hubspot-desk'],
    hubspotCtaScenarios: ['general_management_review', 'compliance_violations'],
  },
  {
    id: 'jackie',
    name: 'Jackie Fact Authority',
    phase: 'fact-authority',
    owns: [
      'canonical property identity',
      'known-property guardrails',
      'address, BBL, unit count, owner, building type, access, and management verification',
      'source conflicts and review warnings',
    ],
    doesNotOwn: [
      'image compression',
      'PDF rendering',
      'proposal pricing tables',
      'HubSpot workflow administration',
      'long-form market reports',
    ],
    handoffTo: ['media-desk', 'guardian', 'financing-desk', 'excalibur', 'meeting-desk', 'hubspot-desk'],
    hubspotCtaScenarios: ['board_management', 'proposal_follow_up', 'general_management_review'],
  },
  {
    id: 'media-desk',
    name: 'Media Desk',
    phase: 'media',
    owns: [
      'uploaded property-photo validation',
      'image resizing and compression',
      'PDF-safe image URLs',
      'neighborhood and landmark imagery',
      'fallback asset selection',
    ],
    doesNotOwn: [
      'property facts',
      'unit-count reconciliation',
      'compliance exposure',
      'pricing',
    ],
    handoffTo: ['meeting-desk', 'excalibur'],
    hubspotCtaScenarios: ['proposal_follow_up'],
  },
  {
    id: 'guardian',
    name: 'Guardian Compliance Desk',
    phase: 'risk',
    owns: [
      'HPD, DOB, ECB/OATH, FISP, LL97, LL84, elevator, boiler, fire-safety and local-law review',
      'violation exposure summaries',
      'plain-English risk reasons',
      'compliance next-step checklists',
    ],
    doesNotOwn: [
      'marketing titles',
      'building images',
      'financing RFPs',
      'management fee math',
    ],
    handoffTo: ['excalibur', 'hubspot-desk'],
    hubspotCtaScenarios: ['compliance_violations', 'll97_carbon', 'capital_project'],
  },
  {
    id: 'financing-desk',
    name: 'Financing Desk',
    phase: 'financing',
    owns: [
      'mortgage and refinance opportunity framing',
      'bank RFP checklist',
      'loan sensitivity analysis placeholders',
      'financing advisory fee disclosure',
    ],
    doesNotOwn: [
      'property management base scope',
      'legal opinions',
      'final lender rates without current source date',
    ],
    handoffTo: ['excalibur', 'hubspot-desk'],
    hubspotCtaScenarios: ['financing_refinance'],
  },
  {
    id: 'excalibur',
    name: 'Excalibur Proposal Desk',
    phase: 'proposal',
    owns: [
      'proposal of property management services',
      'Intelligence package recommendation',
      'Schedule A ancillary fees',
      'pricing options and terms',
      'management agreement data handoff',
    ],
    doesNotOwn: [
      'raw public-record fetching',
      'image ingestion',
      'CRM owner routing',
    ],
    handoffTo: ['hubspot-desk'],
    hubspotCtaScenarios: ['proposal_follow_up', 'new_engagement'],
  },
  {
    id: 'meeting-desk',
    name: '1st Meeting Handout Desk',
    phase: 'proposal',
    owns: [
      'first email intro',
      '1st meeting handout',
      'board-safe cover letters',
      'print, preview, PDF, email, and archive-ready handouts',
    ],
    doesNotOwn: [
      'property fact correction',
      'HubSpot custom-field setup',
      'long-form appendix diligence',
    ],
    handoffTo: ['hubspot-desk'],
    hubspotCtaScenarios: ['proposal_follow_up', 'board_management'],
  },
  {
    id: 'hubspot-desk',
    name: 'HubSpot Desk',
    phase: 'crm',
    owns: [
      'company/contact/deal/task/note sync',
      'pipeline stage hygiene',
      'daily manager review script',
      'intern cleanup queue',
      'cold-caller task discipline',
    ],
    doesNotOwn: [
      'source-of-truth property facts',
      'client-facing source claims',
      'visual report rendering',
    ],
    handoffTo: ['merlin'],
    hubspotCtaScenarios: ['general_management_review', 'proposal_follow_up', 'new_engagement'],
  },
  {
    id: 'merlin',
    name: 'Merlin Follow-Up Copilot',
    phase: 'outreach',
    owns: [
      'follow-up draft language',
      'call talking points',
      'next-step summaries',
      'reply classification support',
    ],
    doesNotOwn: [
      'automatic public sending without approval',
      'overriding HubSpot stages',
      'property facts without Jackie',
    ],
    handoffTo: ['hubspot-desk'],
    hubspotCtaScenarios: ['general_management_review', 'proposal_follow_up'],
  },
];

export const JACKIE_SPLIT_RULES = [
  'Jackie owns the canonical fact packet. Renderers must consume that packet instead of rebuilding facts.',
  'Dirty images are Media Desk warnings, not Jackie release blockers, unless the image is legally unsafe or corrupted enough to crash rendering.',
  'Compliance and financing sections should be specialist handoffs with their own source lists and assumptions.',
  'Proposal and agreement modules must reuse the archived Jackie fact packet and allow key terms to be edited before final PDF.',
  'Every client-facing report event should create or update a HubSpot company/deal/task when HubSpot is configured.',
];

export function getCamelotBotBoundary(id: CamelotBotOwner) {
  return CAMELOT_BOT_OPERATING_MODEL.find((bot) => bot.id === id);
}
