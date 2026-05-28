import type { Building } from '@/types';

export const CPW_279_ADDRESS = '279 Central Park West, New York, NY 10024';
export const CPW_279_NAME = '279 Central Park West';
export const CPW_279_UNIT_COUNT = 38;
export const CPW_279_MANAGEMENT_TO_VERIFY =
  'Management to verify through board materials, HPD MDR, ACRIS, PropertyShark, and building records';
export const EAST_36_22_ADDRESS = '36 East 22nd Street, New York, NY 10010';
export const EAST_36_22_NAME = 'The Story House';
export const EAST_36_22_UNIT_COUNT = 8;
export const EAST_36_22_MANAGEMENT_TO_VERIFY =
  'Management to verify through board materials, HPD MDR, ACRIS, PropertyShark, and building records';

export function is279CentralParkWestValue(...values: Array<string | null | undefined>): boolean {
  return values.some((value) => {
    const key = String(value || '').toLowerCase();
    if (!/(^|[^0-9])279\b/.test(key)) return false;
    return /\bcpw\b/.test(key) || /\bcentral\s+park\s+w(?:est)?\.?\b/.test(key);
  });
}

export function is36East22ndStreetValue(...values: Array<string | null | undefined>): boolean {
  return values.some((value) => {
    const key = String(value || '').toLowerCase();
    if (!/(^|[^0-9])36\b/.test(key)) return false;
    if (/(^|[^0-9])136\s+(?:e|east)\s+22(?:nd)?\s+(?:st|street)\b/i.test(key)) return false;
    return /\b(?:e|east)\s+22(?:nd)?\s+(?:st|street)\b/i.test(key);
  });
}

export function normalizeBuildingForReportGuardrails<T extends Partial<Building>>(building: T): T {
  if (is36East22ndStreetValue(building.address, building.name, building.current_management)) {
    return {
      ...building,
      address: EAST_36_22_ADDRESS,
      name: EAST_36_22_NAME,
      borough: 'Manhattan',
      region: 'Flatiron / Madison Square',
      neighborhood: 'Flatiron / Madison Square',
      units: EAST_36_22_UNIT_COUNT,
      type: 'condo',
      year_built: building.year_built || 1901,
      stories: building.stories && building.stories > 0 && building.stories < 20 ? building.stories : 9,
      current_management: EAST_36_22_MANAGEMENT_TO_VERIFY,
      signals: [
        ...new Set([
          ...((building.signals || []) as string[]).filter((signal) => !/walk[-\s]?up|no\s+elevator|current\s+management|management\s+verified/i.test(signal)),
          'Known Flatiron pre-war elevator condominium profile',
          'Elevator status locked from verified building profile; management to verify through primary records',
        ]),
      ],
      updated_at: building.updated_at || new Date().toISOString(),
    } as T;
  }

  if (!is279CentralParkWestValue(building.address, building.name, building.current_management)) {
    return building;
  }

  return {
    ...building,
    address: CPW_279_ADDRESS,
    name: CPW_279_NAME,
    borough: 'Manhattan',
    region: 'Upper West Side / Central Park West',
    neighborhood: 'Upper West Side / Central Park West',
    units: CPW_279_UNIT_COUNT,
    type: 'condo',
    year_built: building.year_built || 1988,
    stories: building.stories && building.stories > 0 && building.stories < 40 ? building.stories : 23,
    current_management: CPW_279_MANAGEMENT_TO_VERIFY,
    signals: [
      ...new Set([
        ...((building.signals || []) as string[]).filter((signal) => !/current\s+management|management\s+verified/i.test(signal)),
        'Known Central Park West condominium profile',
        'Management and unit count to verify against board materials and primary records',
      ]),
    ],
    updated_at: building.updated_at || new Date().toISOString(),
  } as T;
}

export function normalizeBuildingsForReportGuardrails<T extends Partial<Building>>(buildings: T[]): T[] {
  return buildings.map((building) => normalizeBuildingForReportGuardrails(building));
}
