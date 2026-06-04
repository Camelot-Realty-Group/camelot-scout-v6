/**
 * HubSpot integration — server-side only.
 *
 * Object model (matches scripts/hubspot-rollout.mjs):
 *   Company  = Building
 *   Contact  = Decision Maker
 *   Deal     = Pitch (12-stage pipeline)
 *
 * Auth: Private App access token in HUBSPOT_PRIVATE_APP_TOKEN.
 * Scopes required:
 *   crm.objects.companies.read     crm.objects.companies.write
 *   crm.objects.contacts.read      crm.objects.contacts.write
 *   crm.objects.deals.read         crm.objects.deals.write
 *   crm.schemas.companies.read     crm.schemas.contacts.read
 *   crm.schemas.deals.read         tickets (optional)
 *
 * Docs: https://developers.hubspot.com/docs/api/crm/companies
 */
import type { BuildingRecord, ContactRecord, IntegrationHealth, PullPage } from './types';

const HS_BASE = 'https://api.hubapi.com';

export interface HubSpotClientOptions {
  token: string;
  fetchImpl?: typeof fetch;
}

export function hubspotClient(opts: HubSpotClientOptions) {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const headers = {
    Authorization: `Bearer ${opts.token}`,
    'Content-Type': 'application/json',
  };

  async function ping(): Promise<IntegrationHealth> {
    const t0 = Date.now();
    try {
      const res = await fetchImpl(`${HS_BASE}/account-info/v3/details`, { headers });
      return {
        source: 'hubspot',
        reachable: true,
        authenticated: res.status !== 401 && res.status !== 403,
        last_checked: new Date().toISOString(),
        message: `HTTP ${res.status} in ${Date.now() - t0}ms`,
      };
    } catch (err) {
      return {
        source: 'hubspot',
        reachable: false,
        authenticated: false,
        last_checked: new Date().toISOString(),
        message: `Network error: ${(err as Error).message}`,
      };
    }
  }

  async function listCompanies(after?: string): Promise<PullPage<BuildingRecord>> {
    const url = new URL(`${HS_BASE}/crm/v3/objects/companies`);
    url.searchParams.set('limit', '100');
    url.searchParams.set(
      'properties',
      'name,address,city,state,zip,number_of_units,year_built,owner_name,domain',
    );
    if (after) url.searchParams.set('after', after);

    const res = await fetchImpl(url.toString(), { headers });
    if (!res.ok) throw new Error(`hubspot listCompanies failed: ${res.status}`);
    const body = await res.json() as {
      results: Array<{ id: string; properties: Record<string, string | null> }>;
      paging?: { next?: { after: string } };
    };

    const rows: BuildingRecord[] = body.results.map((row) => ({
      source: 'hubspot',
      source_id: row.id,
      address: row.properties.address ?? row.properties.name ?? 'unknown',
      borough: row.properties.city ?? undefined,
      zip: row.properties.zip ?? undefined,
      units: row.properties.number_of_units ? Number(row.properties.number_of_units) : undefined,
      year_built: row.properties.year_built ? Number(row.properties.year_built) : undefined,
      owner_name: row.properties.owner_name ?? undefined,
      raw: row.properties,
      fetched_at: new Date().toISOString(),
    }));

    return { rows, cursor: body.paging?.next?.after ?? null, has_more: Boolean(body.paging?.next) };
  }

  async function upsertCompany(record: BuildingRecord): Promise<{ id: string }> {
    const body = {
      properties: {
        name: record.address,
        address: record.address,
        city: record.borough,
        zip: record.zip,
        number_of_units: record.units?.toString(),
        year_built: record.year_built?.toString(),
        owner_name: record.owner_name,
        camelot_source: record.source,
        camelot_source_id: record.source_id,
      },
    };
    const res = await fetchImpl(`${HS_BASE}/crm/v3/objects/companies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`hubspot upsertCompany failed: ${res.status}`);
    const json = await res.json() as { id: string };
    return { id: json.id };
  }

  async function upsertContact(contact: ContactRecord): Promise<{ id: string }> {
    const body = {
      properties: {
        email: contact.email,
        firstname: contact.name.split(' ')[0],
        lastname: contact.name.split(' ').slice(1).join(' '),
        phone: contact.phone,
        jobtitle: contact.role,
        camelot_source: contact.source,
        camelot_source_id: contact.source_id,
      },
    };
    const res = await fetchImpl(`${HS_BASE}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`hubspot upsertContact failed: ${res.status}`);
    return await res.json() as { id: string };
  }

  return { ping, listCompanies, upsertCompany, upsertContact };
}
