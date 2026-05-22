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

export type NyOwnershipHuntSource = {
  source: string;
  website: string;
  importance: string;
  bestUseCase: string;
  weakness: string;
};

export const NY_OWNERSHIP_HUNT_SOURCE_STACK: NyOwnershipHuntSource[] = [
  {
    source: 'ACRIS',
    website: 'NYC ACRIS',
    importance: '10/10',
    bestUseCase: 'Deeds, mortgages, signatories, guarantors, mailing addresses, and entity tracing',
    weakness: 'Only Manhattan, Bronx, Brooklyn, and Queens; not Staten Island',
  },
  {
    source: 'PropertyShark',
    website: 'PropertyShark',
    importance: '10/10',
    bestUseCase: 'Fast ownership lookups, portfolio tracing, contact information, and comps',
    weakness: 'Paid source; some contact data can be stale',
  },
  {
    source: 'HPD Online',
    website: 'HPD Online',
    importance: '9.5/10',
    bestUseCase: 'Managing agent, officer names, emergency contacts, and violations',
    weakness: 'Often LLC-heavy',
  },
  {
    source: 'NY DOS Entity Search',
    website: 'NY Department of State Business Search',
    importance: '9/10',
    bestUseCase: 'LLC filings, service address, and formation attorney',
    weakness: 'Often hides beneficial ownership',
  },
  {
    source: 'DOB BIS',
    website: 'NYC DOB BIS',
    importance: '9/10',
    bestUseCase: 'Permit applicants, engineers, expediters, contractors, and ownership clues',
    weakness: 'Old interface and messy records',
  },
  {
    source: 'DOB NOW',
    website: 'DOB NOW',
    importance: '8.5/10',
    bestUseCase: 'Active filings, permits, and filings tied to current activity',
    weakness: 'Harder to navigate',
  },
  {
    source: 'OpenCorporates',
    website: 'OpenCorporates',
    importance: '8.5/10',
    bestUseCase: 'Cross-entity ownership tracing across states',
    weakness: 'Not always current',
  },
  {
    source: 'PincusCo',
    website: 'PincusCo NYC Real Estate News',
    importance: '8.5/10',
    bestUseCase: 'Institutional ownership, debt, acquisitions, and hidden players',
    weakness: 'Mostly larger deals',
  },
  {
    source: 'The Real Deal',
    website: 'The Real Deal NYC',
    importance: '8/10',
    bestUseCase: "Who is buying, selling, financing, developing, or sponsoring a property",
    weakness: 'Media source, not hard records',
  },
  {
    source: 'Reonomy',
    website: 'Reonomy',
    importance: '8/10',
    bestUseCase: 'Owner contact information, LLC mapping, and debt intelligence',
    weakness: 'Expensive',
  },
  {
    source: 'Trellis Law / court records',
    website: 'Lexis / Trellis / Court Records',
    importance: '7.5/10',
    bestUseCase: 'Litigation that reveals principals, partners, disputes, liens, and claims',
    weakness: 'Time-consuming',
  },
  {
    source: 'JustFix Who Owns What',
    website: 'JustFix / Who Owns What',
    importance: '7.5/10',
    bestUseCase: 'Portfolio clustering and landlord mapping',
    weakness: 'Residential-focused',
  },
  {
    source: 'OpenIgloo',
    website: 'OpenIgloo',
    importance: '7/10',
    bestUseCase: 'Quick owner/entity snapshots and resident-facing management signals',
    weakness: 'Consumer-level',
  },
  {
    source: 'StreetEasy',
    website: 'StreetEasy',
    importance: '7/10',
    bestUseCase: 'Building branding, leasing agents, listing history, imagery, and portfolio clues',
    weakness: 'Not ownership-grade',
  },
  {
    source: 'CityRealty',
    website: 'CityRealty',
    importance: '7/10',
    bestUseCase: 'Condo, co-op, sponsor, building, amenity, and market background',
    weakness: 'Limited legal ownership depth',
  },
  {
    source: 'Google Maps / LinkedIn',
    website: 'Google Maps / LinkedIn',
    importance: '8/10',
    bestUseCase: 'Asset managers, property managers, acquisitions people, tenants, and operating contacts',
    weakness: 'Requires detective work',
  },
  {
    source: 'SEC EDGAR / FINRA / fund filings',
    website: 'SEC EDGAR',
    importance: '7/10',
    bestUseCase: 'Private equity, fund ownership, securities, principals, and institutional sponsor context',
    weakness: 'Mostly institutional',
  },
];

export const NY_OWNERSHIP_HUNT_SOURCE_NAMES = NY_OWNERSHIP_HUNT_SOURCE_STACK.map(({ source }) => source);

export const NY_OWNERSHIP_HUNT_SEQUENCE = [
  'PropertyShark quick owner and portfolio clue',
  'ACRIS mortgage/deed signatory review',
  'HPD Online managing agent and emergency contact review',
  'NY DOS LLC filing address and formation attorney review',
  'DOB BIS and DOB NOW active building-player review',
  'LinkedIn asset manager, director, acquisitions, property manager, and principal search',
  'PincusCo / The Real Deal ownership, financing, acquisition, and pain-point scan',
];

export const NY_OWNERSHIP_HUNT_SIGNATORY_RULE =
  'ACRIS mortgage signatories are often more valuable than deed owners; the person signing a major refinance is frequently the real decision-maker or family-office principal.';

export function nyOwnershipHuntSummary(): string {
  return NY_OWNERSHIP_HUNT_SOURCE_NAMES.join(' · ');
}
