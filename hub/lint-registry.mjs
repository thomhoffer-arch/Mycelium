#!/usr/bin/env node
// Lint hub/REGISTRY.md. The hub has multiple connector tables (model sources,
// other sources) with different columns; the shared rule is "any markdown
// table starting with a 'Connector' column": each non-placeholder row must
// have a non-empty connector name, a non-empty Status, and a non-empty Repo.
import { readFileSync } from 'node:fs';

const PLACEHOLDER = /^_?(add|add yours|…|tbd|—|-)_?$/i;
const NAME_RE = /^[*_`]*[a-z][a-z0-9-]*[*_`]*$/i;
const KNOWN_STATUS = /(🧪|🟡|✅|—|commercial|verified|community|experimental|reference|proposed)/i;

function parseTables(md) {
  const lines = md.split('\n');
  const tables = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes('|') || !lines[i].trim().startsWith('|')) continue;
    if (!/Connector/i.test(lines[i])) continue;
    if (!lines[i + 1] || !/^\s*\|[-\s|:]+\|\s*$/.test(lines[i + 1])) continue;
    const header = lines[i].split('|').map((s) => s.trim()).filter(Boolean);
    const rows = [];
    for (let j = i + 2; j < lines.length; j++) {
      if (!lines[j].trim().startsWith('|')) break;
      const cells = lines[j].split('|').map((s) => s.trim());
      cells.shift(); cells.pop();
      const row = Object.fromEntries(header.map((h, k) => [h, cells[k] ?? '']));
      row.lineNo = j + 1;
      rows.push(row);
    }
    tables.push({ headerLine: i + 1, header, rows });
  }
  return tables;
}

function isPlaceholder(row) {
  return Object.values(row).some((v) => typeof v === 'string' && PLACEHOLDER.test(v));
}

export function lintRegistry(md) {
  const errors = [];
  const tables = parseTables(md);
  if (!tables.length) errors.push('no connector tables found (need a markdown table with a "Connector" column)');
  for (const t of tables) {
    for (const row of t.rows) {
      if (isPlaceholder(row)) continue;
      const name = row['Connector'] || '';
      const status = row['Status'] || '';
      const repo = row['Repo'] || '';
      const at = `line ${row.lineNo} (${name || '?'})`;
      if (!name) errors.push(`${at}: Connector cell is empty`);
      else if (!NAME_RE.test(name.replace(/\s+\*\(.+\)\*/, ''))) errors.push(`${at}: Connector "${name}" not in lower-kebab form`);
      if (!status) errors.push(`${at}: Status cell is empty`);
      else if (!KNOWN_STATUS.test(status)) errors.push(`${at}: unknown status "${status}"`);
      if (!repo) errors.push(`${at}: Repo cell is empty`);
    }
  }
  return { ok: errors.length === 0, tables: tables.length, errors };
}

if (process.argv[1] && process.argv[1].endsWith('lint-registry.mjs')) {
  const path = process.argv[2] || new URL('./REGISTRY.md', import.meta.url).pathname;
  const md = readFileSync(path, 'utf8');
  const r = lintRegistry(md);
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 1);
}
