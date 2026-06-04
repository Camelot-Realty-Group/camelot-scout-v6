/**
 * Spier — MDS's new web-based property management platform.
 *
 * Vendor: Multi Data Services Corp (MDS), Hauppauge NY.
 *   888.325.8307 · support@multidataservices.com
 *   740 Old Willets Path, Suite 300, Hauppauge, NY 11788
 *
 * Spier is the modern, browser-based successor to MDS Explorer (the legacy
 * Windows client). It exposes the same accounting / AP / resident-portal data
 * model but is built on a web stack, so there is a reasonable chance of a REST
 * API — though as of June 2026 MDS does NOT publish public developer docs for
 * Spier.
 *
 * Until MDS confirms the surface, this adapter supports THREE modes:
 *
 *   SPIER_MODE=api              Direct REST against Spier's API gateway
 *                               (URL + auth supplied by MDS partner team)
 *   SPIER_MODE=sftp             Nightly CSV/PDF drop into an SFTP folder we
 *                               own; parsed into BuildingRecord[]
 *   SPIER_MODE=partner_pending  Default. UI shows "Spier integration awaiting
 *                               partner-info response — request sent <date>."
 *
 * Expected Spier objects (mirror the MDS Explorer data model):
 *   - Properties / Buildings
 *   - Units
 *   - Residents / Shareholders
 *   - Invoices (AP + AR)
 *   - Work orders / service requests
 *   - Documents (lease, board minutes, financials)
 *   - GL transactions
 */
import type { BuildingRecord, IntegrationHealth, PullPage } from './types';

export type SpierMode = 'api' | 'sftp' | 'partner_pending';

export interface SpierClientOptions {
  mode: SpierMode;
  apiBaseUrl?: string;
  apiKey?: string;
  /** Some tenants are scoped by management company id. */
  tenantId?: string;
  sftpHost?: string;
  sftpUser?: string;
  sftpKeyPem?: string;
  sftpInboxPath?: string;
  fetchImpl?: typeof fetch;
}

export function spierClient(opts: SpierClientOptions) {
  const fetchImpl = opts.fetchImpl ?? fetch;

  async function ping(): Promise<IntegrationHealth> {
    if (opts.mode === 'partner_pending') {
      return {
        source: 'spier',
        reachable: false,
        authenticated: false,
        last_checked: new Date().toISOString(),
        message: 'Spier integration awaiting partner-info response. No endpoint configured yet.',
      };
    }
    if (opts.mode === 'sftp') {
      // Real SFTP reachability check happens inside the Edge Function.
      return {
        source: 'spier',
        reachable: true,
        authenticated: true,
        last_checked: new Date().toISOString(),
        message: `SFTP mode — inbox ${opts.sftpInboxPath ?? '(unset)'}`,
      };
    }
    if (!opts.apiBaseUrl || !opts.apiKey) {
      return {
        source: 'spier',
        reachable: false,
        authenticated: false,
        last_checked: new Date().toISOString(),
        message: 'API mode selected but SPIER_API_BASE_URL or SPIER_API_KEY missing.',
      };
    }
    const t0 = Date.now();
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${opts.apiKey}`,
        Accept: 'application/json',
      };
      if (opts.tenantId) headers['X-Tenant-Id'] = opts.tenantId;
      const res = await fetchImpl(`${opts.apiBaseUrl}/health`, { headers });
      return {
        source: 'spier',
        reachable: true,
        authenticated: res.status !== 401 && res.status !== 403,
        last_checked: new Date().toISOString(),
        message: `HTTP ${res.status} in ${Date.now() - t0}ms`,
      };
    } catch (err) {
      return {
        source: 'spier',
        reachable: false,
        authenticated: false,
        last_checked: new Date().toISOString(),
        message: `Network error: ${(err as Error).message}`,
      };
    }
  }

  async function listBuildings(): Promise<PullPage<BuildingRecord>> {
    if (opts.mode !== 'api') {
      return { rows: [], cursor: null, has_more: false };
    }
    // TODO: real path TBD once MDS confirms. Expected shape:
    //   GET {apiBaseUrl}/v1/properties?limit=100&cursor=...
    return { rows: [], cursor: null, has_more: false };
  }

  return { ping, listBuildings };
}
