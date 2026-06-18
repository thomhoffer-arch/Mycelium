import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../connector.mjs';

test('offline mock run is spine-conformant', async () => {
  const result = await run({}); // no SOLIBRI_BASE_URL → mock mode
  assert.equal(result.conformant, true, JSON.stringify(result, null, 2));
  const [r] = result.records;
  assert.equal(r.identity.source, 'solibri');
  assert.ok(r.identity.ifcGuid, 'must carry the ifcGuid join key');
  assert.equal(r.freshness.confidence, 'live');
});

test('rule severity/status are extracted as edges', async () => {
  const result = await run({});
  const [r] = result.records;
  assert.deepEqual(r.identity.edges?.severity, ['critical']);
  assert.deepEqual(r.identity.edges?.status, ['open']);
});
