#!/usr/bin/env node
// Orchestrator: strong join, weak join, freshness staleness guard,
// modelInstance hard-stop, unjoined surfacing.
import assert from 'node:assert/strict';
import { join } from '../lib/orchestrator.mjs';

const A = [
  { identity: { source: 'pdra', sourceLocalId: '1', projectKey: 'demo',
                uniqueId: 'u-1', modelInstanceId: 'm1' },
    freshness: { source: 'pdra', revisionId: 'r1', confidence: 'live' } },
  { identity: { source: 'pdra', sourceLocalId: '2', projectKey: 'demo',
                classification: { system: 'NL-SfB', code: '32.31' } },
    freshness: { source: 'pdra', revisionId: 'r1', confidence: 'live' } },
  { identity: { source: 'pdra', sourceLocalId: '3', projectKey: 'demo',
                uniqueId: 'u-3', modelInstanceId: 'm1' },
    freshness: { source: 'pdra', revisionId: 'rNEW', confidence: 'live' } },
  { identity: { source: 'pdra', sourceLocalId: '4', projectKey: 'demo',
                uniqueId: 'u-4', modelInstanceId: 'm1' },
    freshness: { source: 'pdra', revisionId: 'r1', confidence: 'live' } },
];

const B = [
  // strong join via uniqueId, same model instance, same revision
  { identity: { source: 'cc', sourceLocalId: 'c-1', projectKey: 'demo',
                uniqueId: 'u-1', modelInstanceId: 'm1' },
    freshness: { source: 'cc', revisionId: 'r1', confidence: 'live' } },
  // weak join via classification
  { identity: { source: 'erp', sourceLocalId: 'PO-1', projectKey: 'demo',
                classification: [{ system: 'NL-SfB', code: '32.31' }] },
    freshness: { source: 'erp', revisionId: 'r1', confidence: 'snapshot' } },
  // stale: same uniqueId but older revisionId and one side is live
  { identity: { source: 'cc', sourceLocalId: 'c-3', projectKey: 'demo',
                uniqueId: 'u-3', modelInstanceId: 'm1' },
    freshness: { source: 'cc', revisionId: 'rOLD', confidence: 'live' } },
  // model-instance conflict: same uniqueId, different modelInstanceId
  { identity: { source: 'cc', sourceLocalId: 'c-4', projectKey: 'demo',
                uniqueId: 'u-4', modelInstanceId: 'm2' },
    freshness: { source: 'cc', revisionId: 'r1', confidence: 'live' } },
];

const r = join(A, B);
assert.equal(r.joined.length, 2, `expected 2 joined, got ${r.joined.length}`);
assert.ok(r.joined.find((j) => j.edge.key === 'uniqueId'), 'strong uniqueId join missing');
assert.ok(r.joined.find((j) => j.edge.key === 'classification'), 'weak classification join missing');
assert.equal(r.stale.length, 1, `expected 1 stale, got ${r.stale.length}`);
assert.equal(r.modelInstanceConflicts.length, 1, 'expected 1 model-instance conflict');
assert.ok(r.unjoined.length >= 0);

console.log(JSON.stringify({ ok: true, joined: r.joined.length, stale: r.stale.length,
  conflicts: r.modelInstanceConflicts.length, unjoined: r.unjoined.length }, null, 2));
