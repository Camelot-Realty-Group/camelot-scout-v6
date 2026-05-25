import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  try {
    const host = new URL(supabaseUrl).hostname;
    return (
      supabaseUrl !== 'https://placeholder.supabase.co' &&
      supabaseAnonKey !== 'placeholder-key' &&
      host.endsWith('.supabase.co')
    );
  } catch {
    return false;
  }
};

export const getSupabaseStatusMessage = (): string => {
  if (isSupabaseConfigured()) {
    const host = new URL(supabaseUrl).hostname;
    return `Connected to ${host}`;
  }

  return 'Demo mode active - add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Render, then redeploy.';
};
