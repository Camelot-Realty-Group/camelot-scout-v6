/**
 * Jackie Engine — the consolidated facade.
 *
 * v6 currently has three engines fighting:
 *   - `jackie-report-library.ts` (template / report shapes)
 *   - `jackie-v2-orchestrator.ts` (orchestrator)
 *   - `jackie-fact-authority.ts`  (fact gatekeeper)
 *
 * Each is wired to different consumers, so we can't yank them today without
 * breaking 7 files. This module is the new front door. New code MUST import
 * from `@/lib/jackie-engine` and let this module dispatch internally. Old call
 * sites get migrated in a follow-up PR, then the old files are deleted.
 *
 * Spec source: reference/jackie-skill.md + Jackie-CT-HOA-Source-Skillset.md
 */
import {
  FactPacket,
  buildFactPacket,
  validateFactPacket,
  type FactPacketBuildInput,
  type FactPacketValidation,
} from '@/lib/fact-packet';

export type JackieReportKind =
  | 'property_intelligence'
  | 'management_proposal'
  | 'instant_proposal'
  | 'pitch_email';

export interface JackieWriteRequest {
  address: string;
  borough?: string;
  kind: JackieReportKind;
  focusKeys?: string[];
  authorName?: string;
  /** When omitted we'll build a Fact Packet from address+borough. */
  factPacket?: FactPacket;
}

export interface JackieWriteResult {
  factPacket: FactPacket;
  validation: FactPacketValidation;
  /** Markdown body. PDF rendering happens in a separate `pdf-render` step. */
  body: string;
  /** True only when validation has zero blockers AND fact packet is `release_status='ready'`. */
  releasable: boolean;
}

/**
 * Single entry point for everything Jackie writes. Internally:
 *   1. Build (or accept) a Fact Packet
 *   2. Run the 10-check validator (`jackie-validate`)
 *   3. Compose the body off the Fact Packet, NEVER off raw model output
 *   4. Return body + validation + releasable flag for the UI to gate on
 */
export async function writeJackie(
  req: JackieWriteRequest,
): Promise<JackieWriteResult> {
  const factPacket =
    req.factPacket ?? (await buildFactPacket({ address: req.address, borough: req.borough }));

  const validation = validateFactPacket(factPacket);

  const body = composeBody(req.kind, factPacket, req.focusKeys ?? []);

  const releasable = validation.blockers.length === 0 && factPacket.release_status === 'ready';

  return { factPacket, validation, body, releasable };
}

/**
 * Re-export of the orchestration helpers, so consumers only have to know about
 * `@/lib/jackie-engine`. The old `jackie-v2-orchestrator` etc. remain in place
 * until call sites are migrated.
 */
export { buildFactPacket, validateFactPacket };
export type { FactPacket, FactPacketBuildInput, FactPacketValidation };

// ---------------------------------------------------------------------------
// internal composers — pure functions over the Fact Packet
// ---------------------------------------------------------------------------
function composeBody(
  kind: JackieReportKind,
  fp: FactPacket,
  focusKeys: string[],
): string {
  switch (kind) {
    case 'property_intelligence':
      return composeIntelligence(fp, focusKeys);
    case 'management_proposal':
      return composeProposal(fp, focusKeys);
    case 'instant_proposal':
      return composeInstantProposal(fp);
    case 'pitch_email':
      return composePitchEmail(fp);
  }
}

function composeIntelligence(fp: FactPacket, focusKeys: string[]): string {
  const focus = focusKeys.length ? focusKeys.join(', ') : 'property_management';
  return [
    `# Property Intelligence — ${fp.address}`,
    `Borough: ${fp.borough ?? 'n/a'}`,
    `Built ${fp.year_built ?? '—'} · ${fp.units ?? '—'} units · ${fp.stories ?? '—'} stories`,
    ``,
    `## Focus`,
    `- ${focus}`,
    ``,
    `## Verified facts (Fact Packet v${fp.version})`,
    ...Object.entries(fp.fields).map(([k, v]) => `- ${k}: ${v.value} _(source: ${v.source})_`),
  ].join('\n');
}

function composeProposal(fp: FactPacket, focusKeys: string[]): string {
  return `# Management Proposal — ${fp.address}\n\nFocus: ${focusKeys.join(', ') || 'full-service property management'}\n\n_(body composed strictly from Fact Packet v${fp.version}; no model-invented numbers)_`;
}

function composeInstantProposal(fp: FactPacket): string {
  return `# Instant Proposal — ${fp.address}\n\n_(stub — wire to instant-proposal Edge Function)_`;
}

function composePitchEmail(fp: FactPacket): string {
  return `Subject: Re: ${fp.address}\n\n_(stub — wire to pitch-email Edge Function)_`;
}
