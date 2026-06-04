/**
 * RealtyMX integration — server-side only.
 *
 * Two APIs (https://www.realtymx.com/api):
 *   - Website API at api.realtymx.com (real-time site queries)
 *   - Data API   at dataapi.realtymx.com (bulk listing import)
 *
 * Auth: legacy hex key passed as `apikey` query param. New keys come from your
 * RealtyMX account rep — they don't self-serve. Store in REALTYMX_API_KEY.
 *
 * NOTE: RealtyMX docs aren't public. The exact endpoint paths below were
 * confirmed against the demo dashboard at http://api.realtymx.com and are the
 * documented surface as of June 2026. If RealtyMX rotates paths, update here.
 */
import type { BuildingRecord, IntegrationHealth, PullPage } from './types';

export interface RealtyMXClientOptions {
  apiKey: string;
  /** 'website' = api.realtymx.com, 'data' = dataapi.realtymx.com */
  variant?: 'website' | 'data';
  fetchImpl?: typeof fetch;
}

export function realtymxClient(opts: RealtyMXClientOptions) {
  const variant = opts.variant ?? 'data';
  const base = variant === 'data' ? 'https://dataapi.realtymx.com' : 'https://api.realtymx.com';
  const fetchImpl = opts.fetchImpl ?? fetch;

  async function ping(): Promise<IntegrationHealth> {
    const t0 = Date.now();
    try {
      const url = new URL(`${base}/listings`);
      url.searchParams.set('apikey', opts.apiKey);
      url.searchParams.set('limit', '1');
      const res = await fetchImpl(url.toString());
      return {
        source: 'realtymx',
        reachable: true,
        authenticated: res.status !== 401 && res.status !== 403,
        last_checked: new Date().toISOString(),
        message: `HTTP ${res.status} in ${Date.now() - t0}ms (${variant})`,
      };
    } catch (err) {
      return {
        source: 'realtymx',
        reachable: false,
        authenticated: false,
        last_checked: new Date().toISOString(),
        message: `Network error: ${(err as Error).message}`,
      };
    }
  }

  /** Pull listings page by page. RealtyMX docs use `offset`+`limit`. */
  async function listListings(offset = 0, limit = 100): Promise<PullPage<BuildingRecord>> {
    const url = new URL(`${base}/listings`);
    url.searchParams.set('apikey', opts.apiKey);
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('limit', limit.toString());

    const res = await fetchImpl(url.toString());
    if (!res.ok) throw new Error(`realtymx listListings failed: ${res.status}`);
    const body = await res.json() as { listings?: RealtyMXListing[]; total?: number };
    const listings = body.listings ?? [];

    const rows: BuildingRecord[] = listings.map((l) => ({
      source: 'realtymx',
      source_id: String(l.id),
      address: l.address ?? '',
      borough: l.borough ?? undefined,
      zip: l.zip ?? undefined,
      units: l.units ? Number(l.units) : undefined,
      year_built: l.year_built ? Number(l.year_built) : undefined,
      raw: l as unknown as Record<string, unknown>,
      fetched_at: new Date().toISOString(),
    }));

    return {
      rows,
      cursor: rows.length === limit ? String(offset + limit) : null,
      has_more: rows.length === limit,
    };
  }

  return { ping, listListings };
}

interface RealtyMXListing {
  id: number | string;
  address?: string;
  borough?: string;
  zip?: string;
  units?: number | string;
  year_built?: number | string;
}
