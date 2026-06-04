import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client with graceful-degradation guards.
 *
 * Background: in v6, a build-time-baked `VITE_SUPABASE_URL` pointed at a deleted
 * project. Every call returned `ERR_NAME_NOT_RESOLVED`, killing Daily Hunt and
 * Jackie silently. This module now:
 *   1. Treats a missing/placeholder URL as "demo mode" up front
 *   2. Pings a health endpoint at startup to catch a dead-but-syntactically-valid URL
 *   3. Exposes a single `supabaseStatus` event listeners can subscribe to so the
 *      OfflineBanner can warn the user instead of failing silently.
 */

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || PLACEHOLDER_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || PLACEHOLDER_KEY;

const supabaseUrl = rawUrl;
const supabaseAnonKey = rawKey;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type SupabaseHealth = 'unknown' | 'healthy' | 'unreachable' | 'demo';

let currentHealth: SupabaseHealth = 'unknown';
const listeners = new Set<(h: SupabaseHealth) => void>();

function setHealth(next: SupabaseHealth) {
  if (next === currentHealth) return;
  currentHealth = next;
  listeners.forEach((cb) => {
    try {
      cb(next);
    } catch (err) {
      // a listener throwing should never break health tracking
      console.warn('[supabase] listener error', err);
    }
  });
}

export function onSupabaseHealthChange(cb: (h: SupabaseHealth) => void): () => void {
  listeners.add(cb);
  // fire immediately with current state
  cb(currentHealth);
  return () => listeners.delete(cb);
}

export function getSupabaseHealth(): SupabaseHealth {
  return currentHealth;
}

export const isSupabaseConfigured = (): boolean => {
  try {
    const host = new URL(supabaseUrl).hostname;
    return (
      supabaseUrl !== PLACEHOLDER_URL &&
      supabaseAnonKey !== PLACEHOLDER_KEY &&
      host.endsWith('.supabase.co')
    );
  } catch {
    return false;
  }
};

export const getSupabaseStatusMessage = (): string => {
  switch (currentHealth) {
    case 'healthy':
      try {
        return `Connected to ${new URL(supabaseUrl).hostname}`;
      } catch {
        return 'Connected to Supabase';
      }
    case 'unreachable':
      return 'Supabase project unreachable. Running in read-only demo mode. Update VITE_SUPABASE_URL in Render and redeploy.';
    case 'demo':
      return 'Demo mode active — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Render, then redeploy.';
    case 'unknown':
    default:
      return 'Checking Supabase connection…';
  }
};

/**
 * One-shot health check. Resolves the public REST root which returns 200 + JSON
 * when the project is alive, regardless of auth. Anything that fails to resolve
 * (`ERR_NAME_NOT_RESOLVED`), times out, or returns a network error flips us into
 * `unreachable` so consumers can no-op safely.
 */
export async function checkSupabaseHealth(timeoutMs = 4000): Promise<SupabaseHealth> {
  if (!isSupabaseConfigured()) {
    setHealth('demo');
    return 'demo';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: supabaseAnonKey },
      signal: controller.signal,
    });
    // Any 2xx/4xx response proves DNS + TLS + project are alive. 5xx is also "reachable".
    if (res.status >= 200 && res.status < 600) {
      setHealth('healthy');
      return 'healthy';
    }
    setHealth('unreachable');
    return 'unreachable';
  } catch {
    setHealth('unreachable');
    return 'unreachable';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wrap a Supabase query so a dead project never crashes the page. Returns
 * `fallback` when Supabase is in demo/unreachable mode.
 */
export async function safeSupabase<T>(
  query: () => Promise<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  if (currentHealth === 'demo' || currentHealth === 'unreachable') return fallback;
  try {
    const { data, error } = await query();
    if (error) {
      console.warn('[supabase] query error', error);
      return fallback;
    }
    return (data ?? fallback) as T;
  } catch (err) {
    console.warn('[supabase] threw', err);
    // a single failing fetch flips us to unreachable so the banner shows
    setHealth('unreachable');
    return fallback;
  }
}

// kick off the health check immediately on module load
void checkSupabaseHealth();
