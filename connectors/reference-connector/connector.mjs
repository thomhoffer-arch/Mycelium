#!/usr/bin/env node
// Reference Mycelium connector (v0.1) — the minimal working pattern.
// It maps a (here: in-memory dummy) source's records to SPINE RECORDS: an identity record + a
// freshness stamp, plus a provenance event on a write. Replace `fetchSource()` with a real
// MCP/REST call; keep the mapping shape. Zero dependencies. Credentials (if any) come from env.
import { checkConformance } from '../../conformance/validate.mjs';

const SOURCE = 'reference';

// 1) Pull raw records from the upstream source (stub). In a real connector this is your MCP/REST call.
async function fetchSource() {
  return [
    { id: 'PO-2041', project: 'demo', nlsfb: '22.20', amount: 48250, modified: '2026-06-15T09:00:00Z' },
    { id: 'PO-2042', project: 'demo', nlsfb: '41.11', amount: 18600, modified: '2026-06-15T09:00:00Z' },
  ];
}

// 2) Map a raw record -> a spine IDENTITY RECORD (the join edges the spine needs).
function toIdentity(r) {
  return {
    source: SOURCE,
    sourceLocalId: String(r.id),
    projectKey: r.project,                                  // reconcile to the shared project id
    classification: r.nlsfb ? [{ system: 'NL-SfB', code: String(r.nlsfb) }] : undefined,
    workPackage: r.workPackage,
  };
}

// 3) Emit a FRESHNESS STAMP for the response.
function freshness(latest) {
  return { source: SOURCE, revisionId: latest || new Date().toISOString(), asOf: latest || null, confidence: 'snapshot' };
}

async function main() {
  const rows = await fetchSource();
  const records = rows.map(toIdentity);
  const stamp = freshness(rows.map((r) => r.modified).sort().pop());

  // Self-certify every record against the spine before emitting.
  const results = records.map((id) => ({ id, ...checkConformance({ identity: id, freshness: stamp }) }));
  const allOk = results.every((r) => r.conformant);

  console.log(JSON.stringify({ source: SOURCE, spineVersion: 'v0.1', conformant: allOk, freshness: stamp, records, results }, null, 2));
  process.exit(allOk ? 0 : 1);
}
main();
