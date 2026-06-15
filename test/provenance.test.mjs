#!/usr/bin/env node
// Round-trip test: append a few events to a temp ledger and verify the chain.
// Then tamper with one event and confirm verify() catches it.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { append, verify } from '../lib/provenance.mjs';

const dir = mkdtempSync(join(tmpdir(), 'mycelium-prov-'));
const path = join(dir, 'ledger.jsonl');

append(path, {
  source: 'clashcontrol', action: 'set_clash_status', result: 'proposed',
  actor: 'agent:llm', projectKey: 'demo',
  targetKeys: { uniqueId: 'reference:PO-2041' },
});
append(path, {
  source: 'clashcontrol', action: 'set_clash_status', result: 'approved',
  actor: 'human:u_8f3a', approvedBy: 'human:u_8f3a', projectKey: 'demo',
});
append(path, {
  source: 'clashcontrol', action: 'set_clash_status', result: 'executed',
  actor: 'agent:orchestrator', projectKey: 'demo',
});

const clean = verify(path);
assert.equal(clean.ok, true, `clean chain should verify: ${JSON.stringify(clean)}`);
assert.equal(clean.count, 3);

// Tamper: rewrite the second event's projectKey.
const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
const tampered = JSON.parse(lines[1]);
tampered.projectKey = 'attacker-rewrote-this';
lines[1] = JSON.stringify(tampered);
writeFileSync(path, lines.join('\n') + '\n');

const dirty = verify(path);
assert.equal(dirty.ok, false, 'tampered chain must fail verify');
assert.ok(dirty.errors.length >= 1, 'verify must report at least one mismatch');

assert.throws(() => append(path, {
  source: 'x', action: 'y', result: 'proposed', actor: 'mallory@example.com',
}), /pseudonymous/, 'non-pseudonymous actor must be rejected');

console.log(JSON.stringify({ ok: true, clean, dirty }, null, 2));
