/**
 * Integration types shared across HubSpot, RealtyMX, Concierge Plus, Drive, MDS.
 *
 * Every integration produces a normalized `BuildingRecord` so the Fact Packet
 * builder doesn't have to know the wire format of each upstream.
 */

export type IntegrationSource =
  | 'hubspot'
  | 'realtymx'
  | 'conciergeplus'
  | 'google_drive'
  | 'spier'
  | 'manual';

export interface BuildingRecord {
  source: IntegrationSource;
  source_id: string;            // upstream system's primary key
  address: string;
  borough?: string;
  zip?: string;
  units?: number;
  year_built?: number;
  building_class?: string;
  owner_name?: string;
  decision_makers?: ContactRecord[];
  raw: Record<string, unknown>; // original payload for forensic replay
  fetched_at: string;           // ISO 8601
}

export interface ContactRecord {
  source: IntegrationSource;
  source_id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  building_source_ids?: string[];
}

export interface IntegrationHealth {
  source: IntegrationSource;
  reachable: boolean;
  authenticated: boolean;
  last_checked: string;
  message: string;
}

export interface PullPage<T> {
  rows: T[];
  cursor?: string | null;
  has_more: boolean;
}
