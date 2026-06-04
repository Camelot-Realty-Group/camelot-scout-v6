/**
 * Concierge Plus integration — server-side only.
 *
 * Concierge Plus exposes an "extensive API ecosystem" per their marketing copy
 * (https://conciergeplus.com/features/api-integration) but the docs are
 * partner-gated. Until your CP rep delivers the developer guide we model the
 * surface as a generic REST adapter that you configure with:
 *
 *   CONCIERGEPLUS_BASE_URL      e.g. https://api.conciergeplus.com or your
 *                               tenant-specific gateway
 *   CONCIERGEPLUS_API_KEY       bearer/header per CP's docs (TBD)
 *   CONCIERGEPLUS_TENANT_ID     your community/portfolio id
 *
 * Common CP objects we'll need to surface in HubSpot:
 *   - units / residences
 *   - residents
 *   - service requests
 *   - amenity bookings
 *   - communication logs
 *
 * Once CP sends the developer guide, fill in the real endpoint paths below.
 */
import type { IntegrationHealth, PullPage } from './types';

export interface ConciergePlusClientOptions {
  baseUrl: string;
  apiKey: string;
  tenantId: string;
  fetchImpl?: typeof fetch;
}

export interface ConciergePlusResident {
  id: string;
  unit_label: string;
  name: string;
  email?: string;
  phone?: string;
  move_in_date?: string;
}

export function conciergePlusClient(opts: ConciergePlusClientOptions) {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const headers = {
    Authorization: `Bearer ${opts.apiKey}`,
    'X-Tenant-Id': opts.tenantId,
    'Content-Type': 'application/json',
  };

  async function ping(): Promise<IntegrationHealth> {
    const t0 = Date.now();
    try {
      const res = await fetchImpl(`${opts.baseUrl}/v1/health`, { headers });
      return {
        source: 'conciergeplus',
        reachable: true,
        authenticated: res.status !== 401 && res.status !== 403,
        last_checked: new Date().toISOString(),
        message: `HTTP ${res.status} in ${Date.now() - t0}ms`,
      };
    } catch (err) {
      return {
        source: 'conciergeplus',
        reachable: false,
        authenticated: false,
        last_checked: new Date().toISOString(),
        message: `Network error: ${(err as Error).message}`,
      };
    }
  }

  /**
   * STUB — real endpoint path TBD from CP partner docs.
   * Confirmed once we get the developer guide from our CP account rep.
   */
  async function listResidents(cursor?: string): Promise<PullPage<ConciergePlusResident>> {
    const url = new URL(`${opts.baseUrl}/v1/residents`);
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetchImpl(url.toString(), { headers });
    if (!res.ok) throw new Error(`conciergeplus listResidents failed: ${res.status}`);
    const body = await res.json() as { residents: ConciergePlusResident[]; next_cursor?: string };
    return {
      rows: body.residents ?? [],
      cursor: body.next_cursor ?? null,
      has_more: Boolean(body.next_cursor),
    };
  }

  return { ping, listResidents };
}
