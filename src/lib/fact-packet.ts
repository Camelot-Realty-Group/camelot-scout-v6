/**
 * Fact Packet — the single source of truth for every Jackie deliverable.
 *
 * Every field carries its source + retrieved-at timestamp + confidence so the
 * release validator can reject anything missing a primary source. The packet
 * is immutable once `release_status='ready'`; corrections force a new version.
 *
 * Server-side counterpart: `supabase/functions/build-fact-packet/index.ts`
 *
 * Spec: reference/jackie-skill.md (10 release blockers) and the master
 * Connecticut/HOA skillset markdown in the repo root.
 */

export type FactSource =
  | 'nyc_open_data'
  | 'dob'
  | 'hpd'
  | 'acris'
  | 'propertyshark'
  | 'opencorporates'
  | 'google_maps'
  | 'perplexity_sonar'
  | 'manual_intern'
  | 'fallback_estimate';

export type FactConfidence = 'verified' | 'inferred' | 'estimated';

export interface FactValue<T = string | number | boolean | null> {
  value: T;
  source: FactSource;
  retrieved_at: string; // ISO 8601
  confidence: FactConfidence;
  /** Optional URL that proves the value (deeplink to NYC ACRIS doc, etc.). */
  citation_url?: string;
  /** Human readable note for the auditor. */
  note?: string;
}

export interface FactPacket {
  /** Bumped any time a field is corrected. */
  version: number;
  packet_id: string;
  address: string;
  borough?: string;
  zip?: string;

  year_built?: number;
  units?: number;
  stories?: number;
  building_class?: string;

  /** Arbitrary additional fields. Keep keys snake_case. */
  fields: Record<string, FactValue>;

  /** Lifecycle. UI uses this as the intern gate. */
  release_status: 'draft' | 'review' | 'ready' | 'archived';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface FactPacketBuildInput {
  address: string;
  borough?: string;
}

export interface FactPacketBlocker {
  code: string;
  message: string;
  field?: string;
}

export interface FactPacketValidation {
  blockers: FactPacketBlocker[];
  warnings: FactPacketBlocker[];
}

/**
 * Build a draft Fact Packet for an address. Client-side stub — real fetching
 * happens in the `build-fact-packet` Edge Function. This stub lets the UI
 * exercise the new flow without waiting for the server.
 */
export async function buildFactPacket(
  input: FactPacketBuildInput,
): Promise<FactPacket> {
  const now = new Date().toISOString();
  return {
    version: 1,
    packet_id: `fp_${Date.now().toString(36)}`,
    address: input.address,
    borough: input.borough,
    fields: {},
    release_status: 'draft',
    created_at: now,
    updated_at: now,
  };
}

/**
 * Runtime port of the 10 release blockers from reference/jackie-skill.md.
 * These are the same checks the server-side `jackie-validate` Edge Function
 * runs; running them in the browser too gives the user instant feedback.
 */
export function validateFactPacket(fp: FactPacket): FactPacketValidation {
  const blockers: FactPacketBlocker[] = [];
  const warnings: FactPacketBlocker[] = [];

  // 1. Address must be present and look like a real street address
  if (!fp.address || fp.address.trim().length < 5) {
    blockers.push({ code: 'B01_ADDRESS_MISSING', message: 'Address is missing or too short.', field: 'address' });
  }

  // 2. Year built must be known for NYC pitches (board pitches require it)
  if (!fp.year_built) {
    warnings.push({ code: 'W02_YEAR_BUILT_UNKNOWN', message: 'Year built unknown — Jackie will say so explicitly.', field: 'year_built' });
  } else if (fp.year_built < 1800 || fp.year_built > new Date().getFullYear()) {
    blockers.push({ code: 'B02_YEAR_BUILT_INVALID', message: `Year built ${fp.year_built} is out of plausible range.`, field: 'year_built' });
  }

  // 3. Unit count must be > 0 if present
  if (fp.units !== undefined && fp.units !== null && fp.units <= 0) {
    blockers.push({ code: 'B03_UNITS_INVALID', message: 'Unit count must be positive.', field: 'units' });
  }

  // 4. No field can be sourced from `fallback_estimate` on a packet marked ready
  const fallbackFields = Object.entries(fp.fields).filter(([, v]) => v.source === 'fallback_estimate');
  if (fp.release_status === 'ready' && fallbackFields.length > 0) {
    blockers.push({
      code: 'B04_FALLBACK_ESTIMATE_IN_READY',
      message: `Ready packet contains ${fallbackFields.length} field(s) with fallback_estimate source. Replace with a verified source.`,
    });
  }

  // 5. Every field must carry a retrieved_at within the last 365 days
  const oneYearAgo = Date.now() - 365 * 24 * 3600 * 1000;
  Object.entries(fp.fields).forEach(([k, v]) => {
    const t = Date.parse(v.retrieved_at);
    if (Number.isNaN(t)) {
      blockers.push({ code: 'B05_FIELD_TIMESTAMP_INVALID', message: `Field ${k} has invalid retrieved_at.`, field: k });
    } else if (t < oneYearAgo) {
      warnings.push({ code: 'W05_FIELD_STALE', message: `Field ${k} is older than 12 months.`, field: k });
    }
  });

  // 6. Manual intern entries flagged for second-pair-of-eyes review
  Object.entries(fp.fields).forEach(([k, v]) => {
    if (v.source === 'manual_intern' && v.confidence !== 'verified') {
      warnings.push({ code: 'W06_INTERN_UNVERIFIED', message: `Intern-entered field ${k} not yet verified.`, field: k });
    }
  });

  // 7. Borough required for NYC addresses (city-state-zip heuristic)
  if (/new york|brooklyn|queens|bronx|staten island/i.test(fp.address) && !fp.borough) {
    blockers.push({ code: 'B07_BOROUGH_MISSING', message: 'NYC address requires borough.' });
  }

  // 8. Packet ID present
  if (!fp.packet_id) {
    blockers.push({ code: 'B08_PACKET_ID_MISSING', message: 'Fact Packet is missing a packet_id.' });
  }

  // 9. Version monotonic positive
  if (!Number.isFinite(fp.version) || fp.version < 1) {
    blockers.push({ code: 'B09_VERSION_INVALID', message: 'Fact Packet version must be a positive integer.' });
  }

  // 10. Release_status must be one of the allowed enum
  if (!['draft', 'review', 'ready', 'archived'].includes(fp.release_status)) {
    blockers.push({ code: 'B10_STATUS_INVALID', message: `release_status '${fp.release_status}' is not valid.` });
  }

  return { blockers, warnings };
}
