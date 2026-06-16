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

| Connector | Source | Status | Repo |
|---|---|---|---|
| good-name | thing | 🧪 | https://example.com |
|  | thing | 🧪 | https://example.com |
| bad name | thing | weirdstatus |  |
`;
const r = lintRegistry(broken);
assert.equal(r.ok, false, 'broken fixture must fail');
const joined = r.errors.join('\n');
assert.match(joined, /Connector cell is empty/, 'empty connector rule must fire');
assert.match(joined, /unknown status/, 'status rule must fire');
assert.match(joined, /Repo cell is empty/, 'empty repo rule must fire');

console.log(JSON.stringify({ ok: true, real: realResult, broken: r }, null, 2));
