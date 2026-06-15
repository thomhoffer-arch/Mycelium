#!/usr/bin/env node
// Lint the real REGISTRY.md (must pass) and a fixture with broken rows
// (must surface specific errors).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { lintRegistry } from '../hub/lint-registry.mjs';

const real = readFileSync(new URL('../hub/REGISTRY.md', import.meta.url), 'utf8');
const realResult = lintRegistry(real);
assert.equal(realResult.ok, true, `real registry must lint clean: ${JSON.stringify(realResult.errors)}`);

const broken = `# x

| Connector | Source | Spine version | Repo | License | Maintainer | Status |
|---|---|---|---|---|---|---|
| \`bad-name\` | thing | v0.1 | https://example.com | Apache-2.0 | acme | proposed |
| \`mycelium-connector-erp\` | erp | v9.9 | https://example.com | WeirdLicense | acme | shipped |
`;
const r = lintRegistry(broken);
assert.equal(r.ok, false, 'broken fixture must fail');
const joined = r.errors.join('\n');
assert.match(joined, /Connector must be/, 'name rule must fire');
assert.match(joined, /unknown spine version/, 'spine version rule must fire');
assert.match(joined, /unrecognized SPDX license/, 'license rule must fire');
assert.match(joined, /status "shipped" not in/, 'status rule must fire');

console.log(JSON.stringify({ ok: true, real: realResult, broken: r }, null, 2));
