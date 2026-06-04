/**
 * Runtime-mode helpers.
 *
 * The v6 build ships as a static SPA on Render — there is no Node server
 * answering POST /api/daily-hunt/run. Until the corresponding Supabase Edge
 * Function is deployed, any "run now" trigger from the UI is dead. We hide
 * those controls and replace them with a read-only queue + a link to the
 * server-side scheduler.
 *
 * Flip VITE_ENABLE_RUN_TRIGGERS=true in Render once the Edge Function is live.
 */
import { isSupabaseConfigured, getSupabaseHealth } from '@/lib/supabase';

export function isStaticBuild(): boolean {
  // explicit override: VITE_RUNTIME_MODE='server' means a Node backend is hosting us
  const mode = (import.meta.env.VITE_RUNTIME_MODE as string | undefined)?.toLowerCase();
  if (mode === 'server') return false;
  if (mode === 'static') return true;
  // sensible default: assume static unless told otherwise
  return true;
}

export function runTriggersEnabled(): boolean {
  // Only show "Run now" buttons when (a) the operator opted in AND (b) Supabase is healthy
  const flag = (import.meta.env.VITE_ENABLE_RUN_TRIGGERS as string | undefined)?.toLowerCase();
  if (flag !== 'true') return false;
  if (!isSupabaseConfigured()) return false;
  return getSupabaseHealth() === 'healthy';
}
