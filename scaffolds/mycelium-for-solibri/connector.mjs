#!/usr/bin/env node
// mycelium-for-solibri — Solibri checking/QA results as spine identity records.
// (For plain BCF issues use mycelium-for-bcf-api via Solibri BCF Live.)
import { runAdapter } from './vendor/mycelium-sdk.mjs';
import { makeFetchSource } from './src/solibri-client.mjs';

const config = {
  source: 'solibri',
  identity: {
    uniqueId: 'solibri:{guid}',
    projectKey: '{project}',
    localIdField: 'guid',
  },
  freshness: {
    revisionId: '{modified}',
    asOf: '{modified}',
    // 'live' while Solibri Desktop serves the REST API; downgrade to 'snapshot'
    // if you ingest an exported result set instead.
    confidence: 'live',
  },
  // Pull rule/severity/status edges out of the carried text.
  extract: {
    deterministic: [
      { edge: 'severity', regex: 'severity=([a-zA-Z]+)' },
      { edge: 'status', regex: 'status=([a-zA-Z]+)' },
    ],
  },
};

export async function run(env = process.env) {
  return runAdapter(config, { fetchSource: makeFetchSource({ env }) });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await run();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.conformant ? 0 : 1);
}
