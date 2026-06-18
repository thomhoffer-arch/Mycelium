import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../connector.mjs';

test('offline mock run is spine-conformant', async () => {
  const result = await run({}); // no env → mock mode
  assert.equal(result.conformant, true, JSON.stringify(result, null, 2));
  assert.ok(result.records.length > 0);
  const [r] = result.records;
  assert.equal(r.identity.source, 'bimcollab');
  assert.ok(r.identity.ifcGuid, 'must carry the ifcGuid join key');
  assert.equal(r.freshness.confidence, 'live');
});

test('vendor preset selection works', async () => {
  const result = await run({ BCF_VENDOR: 'dalux' });
  assert.equal(result.conformant, true);
  assert.equal(result.records[0].identity.source, 'dalux');
});
