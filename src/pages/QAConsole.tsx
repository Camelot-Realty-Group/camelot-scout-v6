import { useEffect, useState, type ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PackageX,
  ExternalLink,
  RefreshCw,
  GitCommit,
  GitCompare,
  FileCode,
  MinusCircle,
} from 'lucide-react';

type CheckStatus = 'pass' | 'fail' | 'blocked' | 'not-run' | 'error';

interface BrokenImport {
  spec: string;
  from: string;
  fromLink: string;
}
interface PageEntry {
  path: string;
  component: string;
  importSpec: string | null;
  status: 'ok' | 'broken' | 'redirect';
  issues: string[];
  file: string | null;
  fileLink: string | null;
  brokenImports: BrokenImport[];
  importedModuleCount?: number;
  hasDefaultExport?: boolean;
  note?: string;
}
interface CheckEntry {
  name: string;
  status: CheckStatus;
  command?: string;
  detail?: string;
  ranAt?: string;
  durationMs?: number;
}
interface MissingPackage {
  name: string;
  uses: { importer: string; spec: string }[];
}
interface BaselineDiff {
  ref: string;
  sha: string;
  shortSha: string;
  subject: string;
  rationale: string;
  changedFiles: { status: string; file: string; link: string }[];
  changedFileCount: number;
  diffStatTail: string;
  source?: 'live' | 'fallback';
  capturedAt?: string;
  capturedAgainstShortCommit?: string;
}
interface Verdict {
  level: 'pass' | 'warn' | 'fail';
  deployReady: boolean;
  headline: string;
  scanClean: boolean;
  requiredChecks: string[];
  requiredChecksPassed: boolean;
  requiredChecksIncomplete: boolean;
  requiredChecksFailed: boolean;
}
interface QAReport {
  generatedAt: string;
  git: { branch: string; commit: string; shortCommit: string; githubSlug: string; blobBase: string };
  verdict?: Verdict;
  scanLimits?: string[];
  baseline: BaselineDiff | null;
  summary: {
    totalRoutes: number;
    importScanPassed?: number;
    workingPages: number;
    brokenPages: number;
    redirectRoutes: number;
    missingPackages: number;
    sourceFiles: number;
    checks: Record<string, CheckStatus>;
    requiredChecksPassed?: boolean;
  };
  pages: PageEntry[];
  missingPackages: MissingPackage[];
  checks: CheckEntry[];
}

// Vite serves /public at the app base. With base:'./' the report sits next to index.html.
// BASE_URL is a path ('./' or '/sub/'), always ending in '/', so simple concat is safe.
const REPORT_URL = `${import.meta.env.BASE_URL || './'}qa-report.json`;

const checkColor: Record<CheckStatus, string> = {
  pass: 'text-green-700 bg-green-50 border-green-200',
  fail: 'text-red-700 bg-red-50 border-red-200',
  blocked: 'text-amber-700 bg-amber-50 border-amber-200',
  error: 'text-red-700 bg-red-50 border-red-200',
  'not-run': 'text-gray-600 bg-gray-50 border-gray-200',
};

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  tone: 'good' | 'bad' | 'warn' | 'neutral';
  icon: ReactNode;
}) {
  const toneClasses = {
    good: 'border-green-200 bg-green-50 text-green-800',
    bad: 'border-red-200 bg-red-50 text-red-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    neutral: 'border-gray-200 bg-white text-gray-800',
  }[tone];
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${toneClasses}`}>
      <div className="opacity-80">{icon}</div>
      <div>
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-xs font-medium mt-1 opacity-80">{label}</div>
      </div>
    </div>
  );
}

export default function QAConsole() {
  const [report, setReport] = useState<QAReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<number>(0);

  const load = () => {
    setError(null);
    fetch(`${REPORT_URL}?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${REPORT_URL}`);
        return r.json();
      })
      .then((data: QAReport) => {
        setReport(data);
        setLoadedAt(Date.now());
      })
      .catch((e) => setError(String(e?.message || e)));
  };

  useEffect(load, []);

  // Derive a tri-state verdict. Prefer the scanner-computed verdict; fall back
  // to recomputing from raw data for older reports that predate the field.
  const REQUIRED = ['typecheck', 'build'];
  const verdict: Verdict | null = report
    ? report.verdict ??
      (() => {
        const checkStatus = (n: string) =>
          report.checks.find((c) => c.name === n)?.status ?? 'not-run';
        const required = REQUIRED.map(checkStatus);
        const scanClean =
          report.summary.brokenPages === 0 && report.summary.missingPackages === 0;
        const failed = required.some((s) => s === 'fail' || s === 'error');
        const incomplete = required.some((s) => s === 'blocked' || s === 'not-run');
        const passed = required.every((s) => s === 'pass');
        const level: Verdict['level'] = !scanClean || failed ? 'fail' : passed ? 'pass' : 'warn';
        return {
          level,
          deployReady: level === 'pass',
          headline:
            level === 'pass'
              ? 'Deploy-ready — route import scan passed and typecheck + build passed.'
              : level === 'fail'
                ? 'Attention required before deploy — broken pages, missing packages, or a failed check.'
                : 'Static route import scan passed, but checks are INCOMPLETE — typecheck/build did not run, so deploy-readiness is unverified.',
          scanClean,
          requiredChecks: REQUIRED,
          requiredChecksPassed: passed,
          requiredChecksIncomplete: incomplete,
          requiredChecksFailed: failed,
        };
      })()
    : null;

  const verdictTone =
    verdict?.level === 'pass' ? 'good' : verdict?.level === 'fail' ? 'bad' : 'warn';
  const importScanPassed = report
    ? report.summary.importScanPassed ?? report.summary.workingPages
    : 0;

  return (
    <div className="min-h-screen bg-camelot-cream/40">
      {/* Header */}
      <div className="bg-camelot-dark text-white px-8 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity size={24} className="text-camelot-gold" /> Scout QA Console
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Pre-deploy diagnostics &middot; routes, imports, packages, build checks
            </p>
          </div>
          <div className="flex items-center gap-3">
            {report && (
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <GitCommit size={13} /> {report.git.branch}@{report.git.shortCommit}
              </span>
            )}
            <button
              onClick={load}
              className="flex items-center gap-2 bg-camelot-gold text-camelot-dark px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-camelot-gold-light transition-colors"
            >
              <RefreshCw size={14} /> Reload
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold flex items-center gap-2">
              <XCircle size={16} /> Could not load QA report
            </p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-red-700/80">
              Generate it with <code className="bg-red-100 px-1 rounded">npm run qa</code> (or{' '}
              <code className="bg-red-100 px-1 rounded">npm run qa:scan</code> for the static-only pass), then redeploy /
              reload.
            </p>
          </div>
        )}

        {report && (
          <>
            {/* Deploy verdict */}
            <div
              className={`rounded-xl border p-4 flex items-start gap-3 ${
                verdictTone === 'good'
                  ? 'border-green-200 bg-green-50'
                  : verdictTone === 'warn'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-red-200 bg-red-50'
              }`}
            >
              {verdictTone === 'good' ? (
                <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
              ) : (
                <AlertTriangle
                  className={`${verdictTone === 'warn' ? 'text-amber-600' : 'text-red-600'} mt-0.5`}
                  size={20}
                />
              )}
              <div className="text-sm">
                <p
                  className={`font-semibold ${
                    verdictTone === 'good'
                      ? 'text-green-800'
                      : verdictTone === 'warn'
                        ? 'text-amber-800'
                        : 'text-red-800'
                  }`}
                >
                  {verdict?.headline ?? 'QA status'}
                </p>
                <p className="text-gray-600 mt-0.5">
                  Report generated {new Date(report.generatedAt).toLocaleString()} &middot; loaded{' '}
                  {loadedAt ? new Date(loadedAt).toLocaleTimeString() : ''}
                </p>
                {verdict && !verdict.requiredChecksPassed && (
                  <p className="text-amber-700 mt-1">
                    Required checks ({verdict.requiredChecks.join(' + ')}){' '}
                    {verdict.requiredChecksFailed ? (
                      <>
                        <strong>failed</strong> — see Build &amp; Test Checks below.
                      </>
                    ) : (
                      <>
                        did not complete (<strong>blocked / not-run</strong> — toolchain not installed
                        in the generating environment). Static route/import analysis below is
                        authoritative; type and runtime correctness remain <strong>unverified</strong>.
                      </>
                    )}
                  </p>
                )}
                {report.scanLimits && report.scanLimits.length > 0 && (
                  <details className="mt-2 text-xs text-gray-600">
                    <summary className="cursor-pointer font-medium">What this scan does and does not cover</summary>
                    <ul className="mt-1 space-y-1 list-disc pl-5">
                      {report.scanLimits.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard label="Routes" value={report.summary.totalRoutes} tone="neutral" icon={<Activity size={22} />} />
              <StatCard
                label="Import-scan passed"
                value={importScanPassed}
                tone="neutral"
                icon={<CheckCircle2 size={22} />}
              />
              <StatCard
                label="Broken pages"
                value={report.summary.brokenPages}
                tone={report.summary.brokenPages ? 'bad' : 'good'}
                icon={<XCircle size={22} />}
              />
              <StatCard
                label="Missing packages"
                value={report.summary.missingPackages}
                tone={report.summary.missingPackages ? 'bad' : 'good'}
                icon={<PackageX size={22} />}
              />
              <StatCard label="Source files" value={report.summary.sourceFiles} tone="neutral" icon={<FileCode size={22} />} />
            </div>

            {/* Build / lint / typecheck checks */}
            <section>
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Build & Test Checks</h2>
              <div className="grid md:grid-cols-3 gap-3">
                {report.checks.map((c) => (
                  <div key={c.name} className={`rounded-xl border p-4 ${checkColor[c.status]}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold capitalize flex items-center gap-1">
                        {c.name}
                        {(verdict?.requiredChecks ?? REQUIRED).includes(c.name) && (
                          <span className="text-[9px] font-bold uppercase tracking-wide rounded bg-gray-200 text-gray-700 px-1 py-0.5">
                            required
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-bold uppercase">{c.status}</span>
                    </div>
                    {c.command && <code className="block text-[11px] mt-1 opacity-70 break-all">{c.command}</code>}
                    {c.detail && (
                      <pre className="mt-2 text-[11px] whitespace-pre-wrap max-h-40 overflow-auto opacity-90 bg-white/50 rounded p-2">
                        {c.detail}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Baseline comparison */}
            {report.baseline && (
              <section>
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <GitCompare size={15} /> Compared to last working baseline
                  {report.baseline.source === 'fallback' && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      cached / fallback
                    </span>
                  )}
                </h2>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  {report.baseline.source === 'fallback' && (
                    <p className="text-xs text-amber-700 mb-2">
                      Live git history was unavailable (likely a shallow deploy clone). Showing the last
                      committed baseline snapshot
                      {report.baseline.capturedAgainstShortCommit
                        ? ` (captured against ${report.baseline.capturedAgainstShortCommit})`
                        : ''}
                      .
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    Baseline:{' '}
                    <a
                      href={`${report.git.blobBase.replace(/\/blob\/.*/, '')}/commit/${report.baseline.sha}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-camelot-gold-dark hover:underline font-mono"
                    >
                      {report.baseline.shortSha}
                    </a>{' '}
                    &mdash; {report.baseline.subject}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{report.baseline.rationale}</p>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    {report.baseline.changedFileCount} frontend file(s) changed since baseline:
                  </p>
                  <ul className="mt-1 text-xs space-y-0.5 max-h-56 overflow-auto">
                    {report.baseline.changedFiles.map((f) => (
                      <li key={f.file} className="flex items-center gap-2">
                        <span
                          className={`inline-block w-4 text-center font-bold ${
                            f.status === 'A' ? 'text-green-600' : f.status === 'D' ? 'text-red-600' : 'text-amber-600'
                          }`}
                        >
                          {f.status}
                        </span>
                        <a href={f.link} target="_blank" rel="noreferrer" className="text-gray-600 hover:underline">
                          {f.file}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Broken pages */}
            {report.summary.brokenPages > 0 && (
              <section>
                <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <XCircle size={15} /> Broken Pages
                </h2>
                <div className="space-y-2">
                  {report.pages
                    .filter((p) => p.status === 'broken')
                    .map((p) => (
                      <div key={p.path} className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <code className="font-semibold text-red-800">{p.path}</code>
                          {p.fileLink && (
                            <a
                              href={p.fileLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-red-700 hover:underline flex items-center gap-1"
                            >
                              {p.file} <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                        <ul className="mt-2 space-y-1 text-sm text-red-700">
                          {p.issues.map((iss, i) => (
                            <li key={i}>&bull; {iss}</li>
                          ))}
                        </ul>
                        {p.brokenImports.length > 0 && (
                          <div className="mt-2 text-xs space-y-1">
                            {p.brokenImports.map((b, i) => (
                              <a
                                key={i}
                                href={b.fromLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-red-600 hover:underline flex items-center gap-1"
                              >
                                {b.from} <ExternalLink size={10} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Missing packages */}
            {report.missingPackages.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <PackageX size={15} /> Missing Packages
                </h2>
                <div className="space-y-2">
                  {report.missingPackages.map((m) => (
                    <div key={m.name} className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <code className="font-semibold text-red-800">{m.name}</code>
                      <p className="text-xs text-red-600 mt-1">
                        imported but not in package.json &middot; install:{' '}
                        <code className="bg-red-100 px-1 rounded">npm i {m.name}</code>
                      </p>
                      <ul className="mt-1 text-xs text-red-700">
                        {m.uses.slice(0, 6).map((u, i) => (
                          <li key={i}>&bull; {u.importer} (<code>{u.spec}</code>)</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Routes that passed the static import scan */}
            <section>
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <CheckCircle2 size={15} className="text-green-600" /> Routes — import scan passed ({importScanPassed})
              </h2>
              <p className="text-xs text-gray-500 mb-2">
                &ldquo;Import scan passed&rdquo; means the route page file exists, its import graph resolves on
                disk, and it exposes a default export. It does <strong>not</strong> mean the page renders
                correctly — named exports, types, and runtime behavior are covered by typecheck and build.
              </p>
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Route</th>
                      <th className="text-left px-4 py-2 font-medium">Component</th>
                      <th className="text-left px-4 py-2 font-medium">Imports</th>
                      <th className="text-left px-4 py-2 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.pages
                      .filter((p) => p.status !== 'broken')
                      .map((p) => (
                        <tr key={p.path} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <code className="text-gray-800">{p.path}</code>
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {p.status === 'redirect' ? (
                              <span className="inline-flex items-center gap-1 text-gray-400">
                                <MinusCircle size={12} /> {p.note || 'redirect'}
                              </span>
                            ) : (
                              p.component
                            )}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {p.status === 'redirect' ? '—' : `${p.importedModuleCount ?? 0} modules`}
                          </td>
                          <td className="px-4 py-2">
                            {p.fileLink ? (
                              <a
                                href={p.fileLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-camelot-gold-dark hover:underline flex items-center gap-1 text-xs"
                              >
                                {p.file} <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="text-xs text-gray-400 text-center pt-4">
              Generated by <code>scripts/qa-scan.mjs</code> &middot; commit{' '}
              <a href={report.git.blobBase} target="_blank" rel="noreferrer" className="hover:underline">
                {report.git.shortCommit}
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
