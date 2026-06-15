#!/usr/bin/env node
// Lint hub/REGISTRY.md so a contributor PR adding a row fails CI loudly if it's
// malformed. Checks the connector table: required columns, name convention,
// known spine version, license token, valid status, plausible repo URL.
import { readFileSync } from 'node:fs';

const REQUIRED_COLS = ['Connector', 'Source', 'Spine version', 'Repo', 'License', 'Maintainer', 'Status'];
const KNOWN_SPINE = new Set(['v0.1']);
const VALID_STATUS = new Set(['proposed', 'reference', 'community', 'verified', 'experimental']);
const NAME_RE = /^`mycelium-connector-[a-z0-9][a-z0-9-]*`$/;
const PLACEHOLDER = /^_?(add|add yours|…|tbd)_?$/i;

function parseConnectorTable(md) {
  const lines = md.split('\n');
  const headerIdx = lines.findIndex((l) => REQUIRED_COLS.every((c) => l.includes(c)));
  if (headerIdx === -1) throw new Error('connector table header not found');
  const header = lines[headerIdx].split('|').map((s) => s.trim()).filter(Boolean);
  const rows = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('|')) break;
    const cells = line.split('|').map((s) => s.trim());
    cells.shift(); cells.pop();
    if (cells.length !== header.length) {
      rows.push({ lineNo: i + 1, error: `expected ${header.length} cells, got ${cells.length}` });
      continue;
    }
    const row = Object.fromEntries(header.map((h, j) => [h, cells[j]]));
    row.lineNo = i + 1;
    rows.push(row);
  }
  return rows;
}

export function lintRegistry(md) {
  const errors = [];
  const rows = parseConnectorTable(md);
  for (const row of rows) {
    if (row.error) { errors.push(`line ${row.lineNo}: ${row.error}`); continue; }
    const isPlaceholder = Object.values(row).some((v) => typeof v === 'string' && PLACEHOLDER.test(v));
    if (isPlaceholder) continue;
    const at = `line ${row.lineNo} (${row['Connector']})`;
    if (!NAME_RE.test(row['Connector'])) errors.push(`${at}: Connector must be \`mycelium-connector-<source>\``);
    if (!KNOWN_SPINE.has(row['Spine version'])) errors.push(`${at}: unknown spine version "${row['Spine version']}" (known: ${[...KNOWN_SPINE].join(', ')})`);
    if (!/(Apache-2\.0|MIT|BSD-[23]-Clause|MPL-2\.0)/.test(row['License'])) errors.push(`${at}: unrecognized SPDX license "${row['License']}"`);
    const status = row['Status'].toLowerCase();
    if (!VALID_STATUS.has(status)) errors.push(`${at}: status "${row['Status']}" not in ${[...VALID_STATUS].join(', ')}`);
    const repo = row['Repo'];
    const repoOk = /https?:\/\//.test(repo) || /this repo/.test(repo) || /^`[^`]+`$/.test(repo);
    if (!repoOk) errors.push(`${at}: Repo must be a URL, a backticked path, or "this repo …"`);
    if (!row['Source']) errors.push(`${at}: Source is empty`);
    if (!row['Maintainer']) errors.push(`${at}: Maintainer is empty`);
  }
  return { ok: errors.length === 0, rows: rows.length, errors };
}

if (process.argv[1] && process.argv[1].endsWith('lint-registry.mjs')) {
  const path = process.argv[2] || new URL('./REGISTRY.md', import.meta.url).pathname;
  const md = readFileSync(path, 'utf8');
  const r = lintRegistry(md);
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 1);
}
