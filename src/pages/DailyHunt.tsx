import {
  Archive,
  ArrowRight,
  Building2,
  ExternalLink,
  Eye,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useDailyHunt, type DailyHuntLead } from '@/hooks/useDailyHunt';
import { cn } from '@/lib/utils';

const priorityStyles: Record<string, string> = {
  HIGH: 'bg-[#B99425] text-white border-[#B99425]',
  MEDIUM: 'bg-[#F7F1DE] text-[#7A5A00] border-[#DBBA2E]',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
};

const categoryLabel = (category?: string | null) => category || 'Other';

export default function DailyHunt() {
  const {
    leads,
    latestRun,
    loading,
    running,
    filter,
    setFilter,
    selectedLead,
    setSelectedLead,
    runNow,
    pushToPipeline,
    dismiss,
    stats,
  } = useDailyHunt();

  const grouped = leads.reduce<Record<string, DailyHuntLead[]>>((acc, lead) => {
    const key = categoryLabel(lead.lead_category);
    acc[key] = acc[key] || [];
    acc[key].push(lead);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => grouped[b].length - grouped[a].length);

  return (
    <div className="min-h-screen bg-[#F8F6EF]">
      <div className="bg-white border-b border-slate-200 px-6 py-5 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#B99425] text-xs uppercase tracking-[0.2em] font-bold">
              <Sparkles size={16} />
              Scout Daily Hunt
            </div>
            <h1 className="mt-2 text-3xl font-bold text-[#10233F]">Bot-Sourced Lead Queue</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Overnight lead sourcing from the Claude/Twin handoff, staged for verification, review, and Pipeline action.
              Daily Hunt is built to find boutique-fit board, sponsor, distress, referral, and acquisition opportunities.
            </p>
          </div>
          <button
            type="button"
            onClick={runNow}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#263747] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#182532] disabled:opacity-60"
          >
            <RefreshCcw size={16} className={running ? 'animate-spin' : ''} />
            {running ? 'Running' : 'Run Daily Hunt'}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Leads" value={stats.total} />
          <Metric label="High Priority" value={stats.high} tone="gold" />
          <Metric label="Verified" value={stats.verified} tone="green" />
          <Metric label="Corrected" value={stats.corrected} tone="amber" />
          <Metric label="Rejected Today" value={stats.rejected} tone="red" />
        </div>

        <div className="mt-4 rounded-lg border border-[#DBBA2E]/30 bg-[#FFFBEB] px-4 py-3 text-sm text-[#5C4500]">
          {latestRun ? (
            <>
              Last run {new Date(latestRun.started_at).toLocaleString()}.
              {' '}
              {latestRun.candidates_found} candidates found, {latestRun.new_leads_inserted} currently visible,
              {latestRun.duplicates_skipped} duplicates skipped.
            </>
          ) : (
            <>Using the imported Claude/Twin export until the Supabase Daily Hunt function is deployed.</>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Priority"
            value={filter.priority}
            onChange={(value) => setFilter((prev) => ({ ...prev, priority: value as any }))}
            options={['ALL', 'HIGH', 'MEDIUM', 'LOW']}
          />
          <FilterSelect
            label="Category"
            value={filter.category}
            onChange={(value) => setFilter((prev) => ({ ...prev, category: value }))}
            options={['ALL', ...Array.from(new Set(leads.map((lead) => lead.lead_category).filter(Boolean))) as string[]]}
          />
          <FilterSelect
            label="Geo"
            value={filter.geo}
            onChange={(value) => setFilter((prev) => ({ ...prev, geo: value }))}
            options={['ALL', 'NY', 'NJ', 'CT', 'FL']}
          />
          <FilterSelect
            label="Range"
            value={String(filter.daysBack)}
            onChange={(value) => setFilter((prev) => ({ ...prev, daysBack: Number(value) }))}
            options={['1', '7', '30']}
            labels={{ '1': 'Today', '7': 'Last 7 days', '30': 'Last 30 days' }}
          />
        </div>
      </div>

      <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
        <div className="space-y-7">
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">Loading Daily Hunt leads...</div>
          )}

          {!loading && leads.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <Building2 size={44} className="mx-auto mb-3 text-slate-300" />
              No leads match the current filters.
            </div>
          )}

          {categories.map((category) => (
            <section key={category} className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#D8C8A0] pb-2">
                <h2 className="text-lg font-bold text-[#10233F]">{category}</h2>
                <span className="text-xs font-semibold text-slate-500">{grouped[category].length} leads</span>
              </div>
              <div className="grid gap-3">
                {grouped[category].map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    selected={selectedLead?.id === lead.id}
                    onSelect={() => setSelectedLead(lead)}
                    onPush={() => pushToPipeline(lead)}
                    onDismiss={() => dismiss(lead)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-[#B99425]" />
            <h2 className="font-bold text-[#10233F]">Verification Trail</h2>
          </div>
          {selectedLead ? (
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Selected lead</p>
                <h3 className="mt-1 font-bold text-[#10233F]">{selectedLead.name}</h3>
                <p className="text-slate-600">{selectedLead.address}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-1 font-semibold">{selectedLead.verification_status || 'UNVERIFIED'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Sources</p>
                <div className="mt-2 space-y-2">
                  {(selectedLead.verified_sources?.length
                    ? selectedLead.verified_sources
                    : [{ label: selectedLead.lead_source || 'Imported lead source', url: undefined, checked_at: undefined }]
                  ).map((source, index) => (
                    <div key={`${source.label}-${index}`} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-medium text-slate-700">{source.label || 'Source'}</p>
                      {source.url && (
                        <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-[#B99425] hover:underline">
                          Open source <ExternalLink size={12} />
                        </a>
                      )}
                      {source.checked_at && <p className="mt-1 text-xs text-slate-400">Checked {new Date(source.checked_at).toLocaleString()}</p>}
                    </div>
                  ))}
                </div>
              </div>
              {selectedLead.corrections?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Corrections</p>
                  <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-white">
                    {JSON.stringify(selectedLead.corrections, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Select a lead to see the source trail. The next backend step is the stricter verification gate: unit counts, owner/developer, status, and contact path must be backed by source URLs before outreach.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'gold' | 'green' | 'amber' | 'red' }) {
  const toneClasses = {
    default: 'text-[#10233F]',
    gold: 'text-[#B99425]',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className={cn('text-2xl font-bold', toneClasses[tone])}>{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels = {},
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700"
      >
        {options.map((option) => (
          <option key={option} value={option}>{labels[option] || option}</option>
        ))}
      </select>
    </label>
  );
}

function LeadCard({
  lead,
  selected,
  onSelect,
  onPush,
  onDismiss,
}: {
  lead: DailyHuntLead;
  selected: boolean;
  onSelect: () => void;
  onPush: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className={cn('rounded-xl border bg-white p-4 shadow-sm transition-all', selected ? 'border-[#DBBA2E] ring-2 ring-[#DBBA2E]/20' : 'border-slate-200')}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', priorityStyles[lead.lead_priority || 'LOW'])}>
              {lead.lead_priority || 'LOW'}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck size={12} className="mr-1 inline" />
              {lead.verification_status === 'CORRECTED' ? 'Auto-corrected' : lead.verification_status === 'VERIFIED' ? 'Verified' : 'Needs verification'}
            </span>
            {lead.unit_count ? <span className="text-xs text-slate-500">{lead.unit_count} units</span> : null}
          </div>
          <h3 className="mt-2 text-lg font-bold text-[#10233F]">{lead.name}</h3>
          <p className="text-sm text-slate-600">{lead.address}</p>
          {lead.developer_or_owner ? <p className="mt-1 text-sm text-slate-500">Owner/developer: {lead.developer_or_owner}</p> : null}
          {lead.lead_pitch_angle ? <p className="mt-3 text-sm italic text-slate-700">{lead.lead_pitch_angle}</p> : null}
          {lead.lead_contact_path ? <p className="mt-2 text-xs text-slate-500">Contact path: {lead.lead_contact_path}</p> : null}
        </button>
        <div className="flex flex-wrap gap-2 xl:flex-col">
          <button type="button" onClick={onPush} className="inline-flex items-center justify-center gap-1 rounded-md bg-[#B99425] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9A7A19]">
            Pipeline <ArrowRight size={13} />
          </button>
          <button type="button" onClick={onDismiss} className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Dismiss <Archive size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
