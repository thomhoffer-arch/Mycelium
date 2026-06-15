#!/usr/bin/env node
// Smoke tests for the Revit UniqueId → IFC GlobalId derivation.
// We assert: (a) the output is a syntactically valid IFC GlobalId
// (22 chars from the IFC base-64 alphabet); (b) it's deterministic for a
// given input; (c) it changes when the ElementId portion changes (so the
// XOR step is wired up); (d) invalid input is rejected.
import assert from 'node:assert/strict';
import { deriveIfcGuid } from '../lib/derive-ifc-guid.mjs';

const IFC_GUID = /^[0-9A-Za-z_$]{22}$/;

const uid1 = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee-00000001';
const uid2 = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee-00000002';

const g1 = deriveIfcGuid(uid1);
const g2 = deriveIfcGuid(uid2);

assert.match(g1, IFC_GUID, `g1 not a valid IFC GlobalId: ${g1}`);
assert.match(g2, IFC_GUID, `g2 not a valid IFC GlobalId: ${g2}`);
assert.equal(g1, deriveIfcGuid(uid1), 'derivation must be deterministic');
assert.notEqual(g1, g2, 'different ElementId must produce different IfcGuid');

assert.throws(() => deriveIfcGuid('not-a-uniqueid'), /invalid Revit UniqueId/);
assert.throws(() => deriveIfcGuid(''), /invalid Revit UniqueId/);

console.log(JSON.stringify({ ok: true, uid1, g1, uid2, g2 }, null, 2));
