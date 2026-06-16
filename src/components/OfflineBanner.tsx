import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  onSupabaseHealthChange,
  getSupabaseStatusMessage,
  type SupabaseHealth,
} from '@/lib/supabase';

/**
 * Top-of-app banner that surfaces a dead Supabase connection instead of letting
 * the UI fail silently. Dismissible per-session so the user isn't nagged once
 * they've acknowledged that live backend data is blocked.
 */
export default function OfflineBanner() {
  const [health, setHealth] = useState<SupabaseHealth>('unknown');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsub = onSupabaseHealthChange(setHealth);
    return () => {
      unsub();
    };
  }, []);

  if (dismissed) return null;
  if (health !== 'unreachable' && health !== 'demo') return null;

  const isUnreachable = health === 'unreachable';

  return (
    <div
      role="status"
      className={
        isUnreachable
          ? 'fixed top-0 inset-x-0 z-[60] bg-[#7A1F1F] text-white text-sm px-4 py-2 flex items-center gap-3 shadow-md'
          : 'fixed top-0 inset-x-0 z-[60] bg-[#5C4500] text-white text-sm px-4 py-2 flex items-center gap-3 shadow-md'
      }
    >
      <AlertTriangle size={16} className="flex-shrink-0" />
      <div className="flex-1 leading-tight">
        <span className="font-semibold mr-1">
          {isUnreachable ? 'Backend unreachable.' : 'Live data blocked.'}
        </span>
        <span className="opacity-90">{getSupabaseStatusMessage()}</span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
