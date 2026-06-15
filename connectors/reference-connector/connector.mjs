#!/usr/bin/env node
// Reference Mycelium connector (v0.1).
// Demonstrates the spine-adapter library against an in-memory source.
// Replace `fetchSource()` with a real MCP/REST call; keep the config shape.
import { runAdapter } from '../../lib/spine-adapter.mjs';

const config = {
  source: 'reference',
  identity: {
    uniqueId: 'reference:{id}',
    projectKey: '{project}',
    localIdField: 'id',
  },
  freshness: {
    revisionId: '{modified}',
    asOf: '{modified}',
    confidence: 'snapshot',
  },
};

async function fetchSource() {
  return [
    {
      id: 'PO-2041',
      project: 'demo',
      classification: [{ system: 'NL-SfB', code: '22.20' }],
      workPackage: 'WP-WALL-A',
      modified: '2026-06-15T09:00:00Z',
    },
    {
      id: 'PO-2042',
      project: 'demo',
      classification: [{ system: 'NL-SfB', code: '41.11' }],
      modified: '2026-06-15T09:00:00Z',
    },
  ];
}

const result = await runAdapter(config, { fetchSource });
console.log(JSON.stringify(result, null, 2));
process.exit(result.conformant ? 0 : 1);
