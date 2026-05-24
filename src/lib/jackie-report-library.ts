import type { MasterReportData, ReportFocusKey } from './camelot-report';
import { JACKIE_REPORT_PACKAGES, type JackieReportPackage } from './pitch-report';

export type SavedJackieReport = {
  id: string;
  reportNumber: string;
  address: string;
  buildingName: string;
  borough?: string;
  packageType: JackieReportPackage;
  packageLabel: string;
  filename: string;
  html: string;
  dataSnapshot?: MasterReportData;
  inquiryContact?: string;
  inquiryEmail?: string;
  inquiryPhone?: string;
  focus: ReportFocusKey[];
  generatedAt: string;
};

export const JACKIE_REPORT_LIBRARY_KEY = 'camelot_generated_jackie_report_library_v1';

export const packageLabelFor = (packageType: JackieReportPackage) => (
  JACKIE_REPORT_PACKAGES.find(pkg => pkg.key === packageType)?.label || 'Jackie Report'
);

export const formatLibraryDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const loadLocalJackieReportLibrary = (): SavedJackieReport[] => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(JACKIE_REPORT_LIBRARY_KEY) || sessionStorage.getItem(JACKIE_REPORT_LIBRARY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(JACKIE_REPORT_LIBRARY_KEY);
    return [];
  }
};

export const writeLocalJackieReportLibrary = (records: SavedJackieReport[]) => {
  const trimmed = records.slice(0, 80);
  try {
    localStorage.setItem(JACKIE_REPORT_LIBRARY_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    const tighter = records.slice(0, 20);
    try {
      localStorage.setItem(JACKIE_REPORT_LIBRARY_KEY, JSON.stringify(tighter));
      return tighter;
    } catch {
      try {
        sessionStorage.setItem(JACKIE_REPORT_LIBRARY_KEY, JSON.stringify(tighter));
        return tighter;
      } catch {
        const metadataOnly = records.slice(0, 20).map(record => ({
          ...record,
          html: `<html><body><h1>${record.packageLabel}</h1><p>${record.address}</p><p>This report reference was saved, but browser storage was too full to retain the full HTML package. Re-run Jackie and download the report to preserve a file copy.</p></body></html>`,
          dataSnapshot: undefined,
        }));
        try {
          localStorage.setItem(JACKIE_REPORT_LIBRARY_KEY, JSON.stringify(metadataOnly));
        } catch {
          // Keep the in-memory list available to the caller even when browser storage is full.
        }
        return metadataOnly;
      }
    }
  }
};

export const saveJackieReportRecord = (record: SavedJackieReport) => (
  writeLocalJackieReportLibrary([record, ...loadLocalJackieReportLibrary()])
);

export const removeJackieReportRecord = (id: string) => (
  writeLocalJackieReportLibrary(loadLocalJackieReportLibrary().filter(record => record.id !== id))
);
