#!/usr/bin/env node
/**
 * Runs the project's existing quality scripts (typecheck / lint / build),
 * captures pass/fail + tail of output into .qa-cache/, then invokes qa-scan.mjs
 * to fold those results into public/qa-report.json.
 *
 * Resilient by design: a missing tool or failing check is RECORDED, never
 * hidden. The QA console shows the truth.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const cacheDir = resolve(root, '.qa-cache');
if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

const CHECKS = [
  { name: 'typecheck', cmd: 'npx tsc -b --pretty false', tool: 'node_modules/.bin/tsc' },
  { name: 'lint', cmd: 'npx eslint . --max-warnings=9999', tool: 'node_modules/.bin/eslint' },
  { name: 'build', cmd: 'npm run build', tool: 'node_modules/.bin/vite' },
];

const skip = (process.argv[2] === '--scan-only');

if (!skip) {
  for (const check of CHECKS) {
    const started = Date.now();
    let status = 'pass';
    let output = '';
    if (check.tool && !existsSync(resolve(root, check.tool))) {
      // Toolchain not installed (e.g. `npm install` could not complete). Record honestly.
      writeFileSync(
        resolve(cacheDir, `${check.name}.json`),
        JSON.stringify(
          {
            name: check.name,
            status: 'blocked',
            command: check.cmd,
            ranAt: new Date().toISOString(),
            detail: `Toolchain missing: ${check.tool} not found. Run \`npm install\` (or \`npm ci\`) with registry access, then re-run \`npm run qa\`.`,
          },
          null,
          2
        )
      );
      console.log(`[qa] ${check.name}: blocked (tool missing)`);
      continue;
    }
    try {
      output = execSync(check.cmd, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], timeout: 600000 }).toString();
    } catch (err) {
      status = 'fail';
      output = `${err.stdout?.toString() || ''}\n${err.stderr?.toString() || ''}`.trim() || String(err.message || err);
    }
    const tail = output.split('\n').slice(-60).join('\n');
    writeFileSync(
      resolve(cacheDir, `${check.name}.json`),
      JSON.stringify(
        { name: check.name, status, command: check.cmd, durationMs: Date.now() - started, ranAt: new Date().toISOString(), detail: tail },
        null,
        2
      )
    );
    console.log(`[qa] ${check.name}: ${status} (${Date.now() - started}ms)`);
  }
}

execSync('node scripts/qa-scan.mjs', { cwd: root, stdio: 'inherit' });
