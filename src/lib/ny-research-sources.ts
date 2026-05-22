export const NY_PEOPLE_ENTITY_COMP_SOURCE_STACK = [
  'PincusCo: lender, note-sale, acquisition, foreclosure, financing, and sponsor/entity intelligence',
  'Compass building pages: unit count, story count, building size, owner/manager references, listing imagery, and active/historical comps',
  'CityRealty building profiles: building review, ratings, amenities, location context, and comparable building positioning',
  'Openigloo: management-company reviews, open violation summaries, resident sentiment, owner/manager signals, and building-affiliated unit counts',
  'CaseMine / court-opinion search: owner, tenant, contractor, lender, and premises-liability litigation cross-checks',
  'StreetEasy building and unit pages: active listings, rentals, sales history, days on market, unit mix, imagery, and broker contact signals',
  'Corcoran building pages: building classification, year built, unit count, listing history, and brokerage comp confirmation',
  'Realtor.com / Zillow: supplemental ownership, sale history, listing, image, and unit-level comp validation',
  'Official property, retail, studio, sample-sale, Instagram, Facebook, and tenant websites: commercial occupant, branding, signage, event, and use confirmation',
];

export const NY_PEOPLE_ENTITY_COMP_SOURCE_NAMES = [
  'PincusCo',
  'Compass',
  'CityRealty',
  'Openigloo',
  'CaseMine',
  'StreetEasy',
  'Corcoran',
  'Realtor.com',
  'Zillow',
  'Official tenant / social / property websites',
];

export function nyPeopleEntityCompSourceSummary(): string {
  return NY_PEOPLE_ENTITY_COMP_SOURCE_NAMES.join(' · ');
}

