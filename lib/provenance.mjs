// Append-only, hash-chained provenance ledger (v0.1).
// One event per propose/approve/execute. Each event carries prevHash = SHA-256
// of the previous canonical event JSON, making the log tamper-evident.
//
// Storage is JSONL on disk. A real deployment would back this with a durable
// append-log; the on-disk shape is the same.

import { createHash, randomUUID } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const RESULTS = new Set(['proposed', 'approved', 'executed', 'rejected', 'failed', 'triaged']);

function canonical(event) {
  // Stable key order so prevHash is reproducible.
  const order = [
    'id', 'prevHash', 'ts', 'projectKey', 'actor', 'proposedBy', 'approvedBy',
    'source', 'action', 'targetKeys', 'revision', 'before', 'after', 'result', 'transport',
  ];
  const o = {};
  for (const k of order) if (k in event) o[k] = event[k];
  return JSON.stringify(o);
}

function sha256(s) {
  return createHash('sha256').update(s).digest('hex');
}

export function lastHash(path) {
  if (!existsSync(path)) return null;
  const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
  if (!lines.length) return null;
  return sha256(canonical(JSON.parse(lines.at(-1))));
}

export function append(path, partial) {
  if (!partial.source || !partial.action || !partial.result) {
    throw new Error('provenance: source, action, result are required');
  }
  if (!RESULTS.has(partial.result)) {
    throw new Error(`provenance: invalid result "${partial.result}"`);
  }
  if (partial.actor && !/^(human|agent|service|did):/.test(partial.actor)) {
    throw new Error('provenance: actor must be a pseudonymous ref (human:/agent:/service:/did:)');
  }
  const event = {
    id: partial.id || randomUUID(),
    prevHash: lastHash(path),
    ts: partial.ts || new Date().toISOString(),
    ...partial,
  };
  appendFileSync(path, JSON.stringify(event) + '\n');
  return event;
}

export function verify(path) {
  if (!existsSync(path)) return { ok: true, count: 0, errors: [] };
  const errors = [];
  let prev = null;
  let count = 0;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line) continue;
    count++;
    const e = JSON.parse(line);
    if (e.prevHash !== prev) {
      errors.push({ index: count - 1, id: e.id, expected: prev, actual: e.prevHash });
    }
    prev = sha256(canonical(e));
  }
  return { ok: errors.length === 0, count, errors };
}

// CLI: `node lib/provenance.mjs verify path/to/ledger.jsonl`
if (process.argv[1] && process.argv[1].endsWith('provenance.mjs')) {
  const [, , cmd, file] = process.argv;
  if (cmd === 'verify' && file) {
    const r = verify(file);
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  } else {
    console.error('usage: node lib/provenance.mjs verify <ledger.jsonl>');
    process.exit(2);
  }
}
