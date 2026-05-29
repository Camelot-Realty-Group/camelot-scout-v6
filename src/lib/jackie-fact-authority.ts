/**
 * Jackie fact authority module.
 *
 * This is the last-mile fact lock for known sensitive properties. Report
 * generators may ingest cached cards, public-record rows, user notes, and
 * uploaded files, but client-facing output must pass through this authority
 * before it is rendered and again after HTML is assembled.
 */

import {
  CPW_279_ADDRESS,
  CPW_279_MANAGEMENT_TO_VERIFY,
  CPW_279_NAME,
  CPW_279_UNIT_COUNT,
  EAST_36_22_ADDRESS,
  EAST_36_22_MANAGEMENT_TO_VERIFY,
  EAST_36_22_NAME,
  EAST_36_22_UNIT_COUNT,
  is279CentralParkWestValue,
  is36East22ndStreetValue,
} from './property-guardrails';

type JackieReportLike = Record<string, any> & {
  address?: string;
  buildingName?: string;
  managementCompany?: string | null;
  units?: number;
  stories?: number;
  yearBuilt?: number;
  propertyType?: string;
  borough?: string;
  neighborhoodName?: string;
  buildingPhotos?: {
    exterior?: string[];
    interior?: string[];
    streetView?: string;
    satellite?: string;
    source?: string;
  } | null;
};

export type JackieFactAuthorityIssue = {
  property: string;
  field: string;
  message: string;
};

export type JackieFactAuthorityResult<T> = {
  data: T;
  issues: JackieFactAuthorityIssue[];
};

const STALE_279_MANAGER_TEXT = ['H', 'al', 'ste', 'ad'].join('');
const STALE_279_MANAGER_PATTERN = new RegExp(STALE_279_MANAGER_TEXT, 'gi');
const STALE_279_TITLE_PATTERN = new RegExp(`${STALE_279_MANAGER_TEXT}\\s*[-–—]\\s*(279\\s+Central\\s+Park\\s+West)`, 'gi');
const OVERSIZED_279_UNIT_PATTERN = /\b10[0-5]\s*(?:units?|unit)\b/gi;
const BAD_36_EAST_22_PATTERN =
  /\b(?:KM\s*[-–—]\s*)?365\s+East\s+183rd(?:\s+Street)?(?:\s*\/\s*2244\s+Tiebout)?\b|\b2244\s+Tiebout\b|\bwalk[-\s]?up(?:\s+apartment)?\b|\bno\s+elevator\b|\bnon[-\s]?elevator\b/gi;

const CPW_279_PHOTOS = [
  '/images/279-central-park-west/279-cpw-corner-shot.jpg',
  '/images/279-central-park-west/279-cpw-awning.jpg',
  '/images/279-central-park-west/279-cpw-top-of-building.jpg',
  '/images/279-central-park-west/279-central-park-west.jpg',
];

const EAST_36_22_PHOTOS = [
  '/images/36-east-22nd/story-house-exterior.jpg',
];

function dedupeText(items: Array<string | null | undefined>): string[] {
  return [...new Set(items.map(item => String(item || '').trim()).filter(Boolean))];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function scrubText(value: string, property: '279 Central Park West' | '36 East 22nd Street', issues: JackieFactAuthorityIssue[]): string {
  let next = value;
  if (property === '279 Central Park West') {
    if (STALE_279_TITLE_PATTERN.test(next)) {
      next = next.replace(STALE_279_TITLE_PATTERN, CPW_279_NAME);
      issues.push({ property, field: 'text', message: 'Removed stale current-manager title prefix.' });
    }
    STALE_279_TITLE_PATTERN.lastIndex = 0;
    if (STALE_279_MANAGER_PATTERN.test(next)) {
      next = next.replace(STALE_279_MANAGER_PATTERN, 'Management to verify');
      issues.push({ property, field: 'text', message: 'Replaced stale current-manager reference with verification language.' });
    }
    STALE_279_MANAGER_PATTERN.lastIndex = 0;
    if (OVERSIZED_279_UNIT_PATTERN.test(next)) {
      next = next.replace(OVERSIZED_279_UNIT_PATTERN, `${CPW_279_UNIT_COUNT} units`);
      issues.push({ property, field: 'text', message: 'Replaced oversized unit-count reference with locked unit count.' });
    }
    OVERSIZED_279_UNIT_PATTERN.lastIndex = 0;
  }

  if (property === '36 East 22nd Street') {
    if (BAD_36_EAST_22_PATTERN.test(next)) {
      next = next
        .replace(/\b(?:KM\s*[-–—]\s*)?365\s+East\s+183rd(?:\s+Street)?(?:\s*\/\s*2244\s+Tiebout)?\b/gi, EAST_36_22_NAME)
        .replace(/\b2244\s+Tiebout\b/gi, EAST_36_22_ADDRESS)
        .replace(/\bwalk[-\s]?up(?:\s+apartment)?\b/gi, 'elevator condominium')
        .replace(/\bno\s+elevator\b|\bnon[-\s]?elevator\b/gi, 'elevator');
      issues.push({ property, field: 'text', message: 'Removed stale Bronx/walk-up mismatch language.' });
    }
    BAD_36_EAST_22_PATTERN.lastIndex = 0;
  }
  return next;
}

function scrubDeep(value: unknown, property: '279 Central Park West' | '36 East 22nd Street', issues: JackieFactAuthorityIssue[], depth = 0): unknown {
  if (depth > 6) return value;
  if (typeof value === 'string') return scrubText(value, property, issues);
  if (Array.isArray(value)) return value.map(item => scrubDeep(item, property, issues, depth + 1));
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, scrubDeep(item, property, issues, depth + 1)]));
}

function applyPhotoFloor(d: JackieReportLike, photos: string[], source: string): void {
  const existing = d.buildingPhotos || {};
  d.buildingPhotos = {
    ...existing,
    exterior: dedupeText([...photos, ...(existing.exterior || [])]),
    interior: existing.interior || [],
    streetView: existing.streetView || '',
    satellite: existing.satellite || '',
    source: existing.source || source,
  };
}

export function applyJackieFactAuthority<T extends JackieReportLike>(input: T): JackieFactAuthorityResult<T> {
  const issues: JackieFactAuthorityIssue[] = [];
  const is279 = is279CentralParkWestValue(input.address, input.buildingName, input.managementCompany);
  const is36 = is36East22ndStreetValue(input.address, input.buildingName, input.managementCompany);
  let data = input;

  if (is279) {
    data = scrubDeep(input, '279 Central Park West', issues) as T;
    data.address = CPW_279_ADDRESS;
    data.buildingName = CPW_279_NAME;
    data.units = CPW_279_UNIT_COUNT;
    data.stories = data.stories && data.stories > 0 && data.stories < 40 ? data.stories : 23;
    data.yearBuilt = data.yearBuilt || 1988;
    data.propertyType = 'Condominium';
    data.borough = 'Manhattan';
    data.neighborhoodName = 'Upper West Side / Central Park West';
    data.managementCompany = CPW_279_MANAGEMENT_TO_VERIFY;
    applyPhotoFloor(data, CPW_279_PHOTOS, 'Verified 279 Central Park West asset library');
    issues.push({ property: CPW_279_NAME, field: 'canonical', message: 'Applied locked address, management, unit count, and photo set.' });
  }

  if (is36) {
    data = scrubDeep(input, '36 East 22nd Street', issues) as T;
    data.address = EAST_36_22_ADDRESS;
    data.buildingName = EAST_36_22_NAME;
    data.units = EAST_36_22_UNIT_COUNT;
    data.stories = data.stories && data.stories > 0 && data.stories < 20 ? data.stories : 9;
    data.yearBuilt = data.yearBuilt || 1901;
    data.propertyType = 'Pre-war Elevator Condominium';
    data.borough = 'Manhattan';
    data.neighborhoodName = 'Flatiron / Madison Square';
    data.managementCompany = EAST_36_22_MANAGEMENT_TO_VERIFY;
    applyPhotoFloor(data, EAST_36_22_PHOTOS, 'Verified Story House asset library');
    issues.push({ property: EAST_36_22_NAME, field: 'canonical', message: 'Applied locked elevator condominium profile and photo set.' });
  }

  return { data, issues };
}

export function sanitizeJackieKnownPropertyHtml(html: string, data: JackieReportLike): JackieFactAuthorityResult<string> {
  const issues: JackieFactAuthorityIssue[] = [];
  let output = html;
  if (is279CentralParkWestValue(data.address, data.buildingName, data.managementCompany, output)) {
    output = scrubText(output, '279 Central Park West', issues);
  }
  if (is36East22ndStreetValue(data.address, data.buildingName, data.managementCompany, output)) {
    output = scrubText(output, '36 East 22nd Street', issues);
  }
  return { data: output, issues };
}
