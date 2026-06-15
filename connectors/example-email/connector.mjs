#!/usr/bin/env node
// Example "email" connector — shows the spine adapter's edge-extraction path
// from the Outlook adapter pattern in SPINE_ADAPTER_TEMPLATE.md. The upstream
// is faked here so the demo runs offline.
import { runAdapter } from '../../lib/spine-adapter.mjs';

const config = {
  source: 'outlook',
  identity: {
    uniqueId: 'outlook:{entryId}',
    projectKey: '{project}',
    localIdField: 'entryId',
  },
  freshness: { revisionId: '{receivedAt}', asOf: '{receivedAt}', confidence: 'live' },
  text: (r) => `${r.subject}\n${r.body}`,
  extract: {
    deterministic: [
      { edge: 'po', regex: 'PUR-ORD-\\d{4}-\\d{5}' },
      { edge: 'nlsfb', regex: '\\b(\\d{2}\\.\\d{2})\\b' },
      { edge: 'bcf', regex: 'B-\\d{3}' },
      { edge: 'zone', match: ['Zone-B', 'Zone-A'] },
    ],
  },
};

async function fetchSource() {
  return [
    {
      entryId: '000000A1B2',
      project: 'horizons',
      subject: 'RE: balkonplaat level 3 — clash + meerwerk',
      body: 'See PO PUR-ORD-2026-00005 and BCF B-033 in Zone-B. NL-SfB 23.22.',
      receivedAt: '2026-06-15T09:00:00Z',
    },
  ];
}

const result = await runAdapter(config, { fetchSource });
console.log(JSON.stringify(result, null, 2));
process.exit(result.conformant ? 0 : 1);
