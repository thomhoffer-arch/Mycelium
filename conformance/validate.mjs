#!/usr/bin/env node
// Mycelium conformance check (zero-dependency). Validates that a sample { identity, freshness }
// satisfies the Connective Spine v0.1: MUST-keys + at least one join key + a valid freshness stamp.
// Usage:  node conformance/validate.mjs path/to/sample.json   (or piped JSON on stdin)
//   sample = { "identity": {…}, "freshness": {…} }
export const SPINE_VERSION = 'v0.1';
const MUST = ['source', 'sourceLocalId', 'projectKey'];
const JOIN_KEYS = ['ifcGuid', 'uniqueId', 'classification', 'workPackage', 'costCode', 'zone'];

export function checkConformance({ identity = {}, freshness = {} } = {}) {
  const errors = [];
  for (const k of MUST) if (identity[k] == null || identity[k] === '') errors.push(`identity.${k} is required (spine MUST-key)`);
  const hasJoin = JOIN_KEYS.some((k) => identity[k] != null && identity[k] !== '');
  if (!hasJoin) errors.push(`identity needs at least one join key (${JOIN_KEYS.join(' | ')})`);
  if (identity.actor && !/^(human|agent|service|did):/.test(String(identity.actor))) errors.push('actor must be a pseudonymous ref (human:/agent:/service:/did:)');
  if (freshness && Object.keys(freshness).length) {
    for (const k of ['source', 'revisionId', 'confidence']) if (freshness[k] == null || freshness[k] === '') errors.push(`freshness.${k} is required`);
    if (freshness.confidence && !['live', 'snapshot'].includes(freshness.confidence)) errors.push("freshness.confidence must be 'live' or 'snapshot'");
  } else {
    errors.push('freshness stamp is required (source, revisionId, confidence)');
  }
  return { conformant: errors.length === 0, spineVersion: SPINE_VERSION, errors };
}

// CLI
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const read = async () => {
    const file = process.argv[2];
    if (file) return JSON.parse(await import('node:fs').then((m) => m.readFileSync(file, 'utf8')));
    let s = ''; for await (const c of process.stdin) s += c; return JSON.parse(s);
  };
  read().then((sample) => {
    const r = checkConformance(sample);
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.conformant ? 0 : 1);
  }).catch((e) => { console.error('error:', e.message); process.exit(2); });
}
