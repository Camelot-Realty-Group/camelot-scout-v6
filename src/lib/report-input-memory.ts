const PREFIX = 'camelot_os_last_report_inputs:';

export function saveReportInputs<T>(scope: string, inputs: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${PREFIX}${scope}`, JSON.stringify({ savedAt: new Date().toISOString(), inputs }));
  } catch {
    // Ignore storage failures; reports should still run.
  }
}

export function loadReportInputs<T>(scope: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${scope}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed?.inputs || null) as T | null;
  } catch {
    window.localStorage.removeItem(`${PREFIX}${scope}`);
    return null;
  }
}
