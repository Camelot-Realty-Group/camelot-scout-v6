import { pushBuildingToIntegrations, type IntegrationPushResult } from '@/lib/integrations';
import { getCtaScenario, renderCtaTemplate, selectCtaScenario, type CtaScenario, type CtaScenarioId } from '@/lib/cta-scenarios';
import { useBuildingsStore } from '@/lib/store';
import type { Building, BuildingGrade, BuildingType, Contact, PipelineStage } from '@/types';

export type BotHubSpotAction =
  | 'lead_discovered'
  | 'lead_scored'
  | 'lead_verified'
  | 'pipeline_added'
  | 'outreach_drafted'
  | 'outreach_sent'
  | 'reply_received'
  | 'report_generated'
  | 'proposal_generated'
  | 'proposal_sent'
  | 'follow_up_due'
  | 'engagement_won'
  | 'engagement_lost'
  | 'task_created';

export interface BotHubSpotActivity {
  id?: string;
  botId: string;
  botName: string;
  action: BotHubSpotAction;
  building: Partial<Building>;
  contacts?: Partial<Contact>[];
  ctaScenarioId?: CtaScenarioId;
  notes?: string;
  source?: string;
  packageType?: string;
  packageLabel?: string;
  priority?: 'same-day' | '24-48 hours' | 'nurture';
  dueAt?: string;
  pipelineStage?: PipelineStage;
  metadata?: Record<string, unknown>;
}

export interface BotHubSpotActivityRecord extends BotHubSpotActivity {
  id: string;
  createdAt: string;
  ctaScenario: CtaScenario;
  ctaSubject: string;
  ctaBody: string;
  hubspotStatus?: IntegrationPushResult['status'];
  hubspotMessage?: string;
  hubspotQueued: boolean;
}

const BOT_ACTIVITY_KEY = 'camelot_bot_hubspot_activity_v1';
const MAX_ACTIVITY_RECORDS = 300;

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadBotHubSpotActivity(): BotHubSpotActivityRecord[] {
  if (typeof window === 'undefined') return [];
  return safeParseArray<BotHubSpotActivityRecord>(window.localStorage.getItem(BOT_ACTIVITY_KEY));
}

function writeBotHubSpotActivity(records: BotHubSpotActivityRecord[]) {
  if (typeof window === 'undefined') return records;
  const trimmed = records.slice(0, MAX_ACTIVITY_RECORDS);
  try {
    window.localStorage.setItem(BOT_ACTIVITY_KEY, JSON.stringify(trimmed));
  } catch {
    // The CRM record should not block the user-facing bot action.
  }
  return trimmed;
}

function appendBotHubSpotActivity(record: BotHubSpotActivityRecord) {
  const next = [record, ...loadBotHubSpotActivity().filter((item) => item.id !== record.id)];
  writeBotHubSpotActivity(next);
  return next;
}

function normalizeBuildingType(type?: string): BuildingType {
  if (/co.?op|cooperative|tenancy/i.test(type || '')) return 'co-op';
  if (/condo|hoa/i.test(type || '')) return 'condo';
  if (/mixed/i.test(type || '')) return 'mixed-use';
  if (/commercial|retail|office/i.test(type || '')) return 'commercial';
  if (/rental|apartment|residential/i.test(type || '')) return 'rental';
  return 'other';
}

function normalizeGrade(grade?: string): BuildingGrade {
  return grade === 'A' || grade === 'B' || grade === 'C' ? grade : 'C';
}

function normalizeContacts(contacts: Partial<Contact>[] = []): Contact[] {
  return contacts
    .filter((contact) => contact.name || contact.email || contact.phone)
    .map((contact) => ({
      name: contact.name || contact.email || contact.phone || 'Contact',
      role: contact.role || 'decision_maker',
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
      source: contact.source || 'Bot activity',
      notes: contact.notes,
    }));
}

function ensureBuildingForHubSpot(activity: BotHubSpotActivity, record: BotHubSpotActivityRecord): Building {
  const incoming = activity.building || {};
  const now = record.createdAt;
  const existing = incoming.id
    ? useBuildingsStore.getState().buildings.find((building) => building.id === incoming.id)
    : undefined;
  const address = incoming.address || existing?.address || incoming.name || 'Unknown property';
  const id = incoming.id || existing?.id || `bot-${address}-${now}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const contacts = normalizeContacts([...(activity.contacts || []), ...((incoming.contacts || existing?.contacts || []) as Contact[])]);

  return {
    id,
    address,
    name: incoming.name || existing?.name || address,
    borough: incoming.borough || existing?.borough,
    region: incoming.region || existing?.region,
    neighborhood: incoming.neighborhood || existing?.neighborhood,
    zip_code: incoming.zip_code || existing?.zip_code,
    units: incoming.units || existing?.units,
    type: normalizeBuildingType(incoming.type || existing?.type),
    year_built: incoming.year_built || existing?.year_built,
    lot_area: incoming.lot_area || existing?.lot_area,
    building_area: incoming.building_area || existing?.building_area,
    stories: incoming.stories || existing?.stories,
    building_class: incoming.building_class || existing?.building_class,
    grade: normalizeGrade(incoming.grade || existing?.grade),
    score: incoming.score ?? existing?.score ?? 0,
    score_breakdown: incoming.score_breakdown || existing?.score_breakdown,
    signals: Array.from(new Set([...(existing?.signals || []), ...(incoming.signals || [])])),
    contacts,
    enriched_data: {
      ...(existing?.enriched_data || {}),
      ...(incoming.enriched_data || {}),
      hubspot_bot_activity: record,
    },
    current_management: incoming.current_management || existing?.current_management,
    source: activity.source || incoming.source || existing?.source || 'Camelot OS bot activity',
    status: incoming.status || existing?.status || 'active',
    assigned_to: incoming.assigned_to || existing?.assigned_to,
    assigned_at: incoming.assigned_at || existing?.assigned_at,
    outreach_status: incoming.outreach_status || existing?.outreach_status,
    outreach_last_sent: incoming.outreach_last_sent || existing?.outreach_last_sent,
    outreach_last_reply: incoming.outreach_last_reply || existing?.outreach_last_reply,
    notes: incoming.notes || existing?.notes,
    tags: Array.from(new Set([...(existing?.tags || []), ...(incoming.tags || []), `bot:${activity.botId}`, ...record.ctaScenario.tags])),
    pipeline_stage: activity.pipelineStage || record.ctaScenario.hubspotStage,
    pipeline_moved_at: now,
    hubspot_deal_id: incoming.hubspot_deal_id || existing?.hubspot_deal_id,
    hubspot_contact_id: incoming.hubspot_contact_id || existing?.hubspot_contact_id,
    hubspot_synced_at: incoming.hubspot_synced_at || existing?.hubspot_synced_at,
    bbl: incoming.bbl || existing?.bbl,
    bin: incoming.bin || existing?.bin,
    hpd_building_id: incoming.hpd_building_id || existing?.hpd_building_id,
    violations_count: incoming.violations_count ?? existing?.violations_count ?? 0,
    open_violations_count: incoming.open_violations_count ?? existing?.open_violations_count ?? 0,
    last_violation_date: incoming.last_violation_date || existing?.last_violation_date,
    market_value: incoming.market_value || existing?.market_value,
    assessed_value: incoming.assessed_value || existing?.assessed_value,
    land_value: incoming.land_value || existing?.land_value,
    tax_class: incoming.tax_class || existing?.tax_class,
    dof_owner: incoming.dof_owner || existing?.dof_owner,
    energy_star_score: incoming.energy_star_score || existing?.energy_star_score,
    site_eui: incoming.site_eui || existing?.site_eui,
    ghg_emissions: incoming.ghg_emissions || existing?.ghg_emissions,
    occupancy_pct: incoming.occupancy_pct || existing?.occupancy_pct,
    scan_id: incoming.scan_id || existing?.scan_id,
    folder_id: incoming.folder_id || existing?.folder_id,
    created_at: incoming.created_at || existing?.created_at || now,
    updated_at: now,
  };
}

function buildRecord(activity: BotHubSpotActivity): BotHubSpotActivityRecord {
  const createdAt = new Date().toISOString();
  const scenario = activity.ctaScenarioId
    ? getCtaScenario(activity.ctaScenarioId)
    : selectCtaScenario(activity.building, {
      action: activity.action,
      packageType: activity.packageType,
      packageLabel: activity.packageLabel,
      notes: activity.notes,
    });
  const dueDate = activity.dueAt || new Date(Date.now() + scenario.taskDueDays * 86_400_000).toISOString();
  const id = activity.id || `${activity.botId}-${activity.action}-${activity.building.address || activity.building.name || 'property'}-${createdAt}`
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();

  return {
    ...activity,
    id,
    createdAt,
    dueAt: dueDate,
    priority: activity.priority || scenario.priority,
    pipelineStage: activity.pipelineStage || scenario.hubspotStage,
    ctaScenario: scenario,
    ctaSubject: renderCtaTemplate(scenario.emailSubject, activity.building),
    ctaBody: renderCtaTemplate(scenario.emailBody, activity.building),
    hubspotQueued: true,
  };
}

export async function reportBotActivityToHubSpot(activity: BotHubSpotActivity) {
  let record = buildRecord(activity);
  appendBotHubSpotActivity(record);

  const building = ensureBuildingForHubSpot(activity, record);
  const existing = useBuildingsStore.getState().buildings.find((item) => item.id === building.id);
  if (existing) {
    useBuildingsStore.getState().updateBuilding(existing.id, building);
  } else if (building.address !== 'Unknown property') {
    useBuildingsStore.getState().addBuildings([building]);
  }

  try {
    const result = await pushBuildingToIntegrations(building);
    record = {
      ...record,
      hubspotStatus: result.status,
      hubspotMessage: result.hubspot?.message || result.scout?.message,
      hubspotQueued: result.hubspot?.status !== 'ok',
    };
  } catch (err: any) {
    record = {
      ...record,
      hubspotStatus: 'error',
      hubspotMessage: err?.message || 'Bot activity HubSpot sync failed; record remains locally queued.',
      hubspotQueued: true,
    };
  }

  appendBotHubSpotActivity(record);
  return record;
}
