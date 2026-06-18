#!/usr/bin/env node
// Example: how a BCF-API connector uses the canonical mapping.
//
// There is NO generic "BCF-API" connector. Each tool ships its own complete,
// standalone package (Mycelium-for-Dalux, Mycelium-for-BIMcollab, …) that
// VENDORS the canonical BCF topic→spine mapping (`packages/bcf-api`) the same
// way it vendors the SDK. This example shows that mapping in action against
// mock topics so the pattern is copy-pasteable. confidence:'live' = the API
// path, vs example-bcf's file-based 'snapshot'.
import { runAdapter, deriveIfcGuid } from 'mycelium-sdk';
import { topicToRow } from 'mycelium-bcf-api';

const config = {
  source: 'dalux', // a real connector picks its own vendor/source
  identity: { uniqueId: 'bcf:{localId}', projectKey: '{project}', localIdField: 'localId' },
  freshness: { revisionId: '{modified}', asOf: '{modified}', confidence: 'live' },
};

// Real connectors build fetchSource from makeBcfApiFetch (REST) or a tool's own
// client; here we map one mock topic through the shared topicToRow().
async function fetchSource() {
  const topics = [
    {
      guid: 'B-033',
      project: 'horizons',
      revit_unique_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee-00000042',
      zone: { kind: 'storey', id: 'B01', name: 'B – onderbouw' },
      modified_date: '2026-06-17T09:15:00Z',
    },
  ];
  return topics.map((t) => topicToRow(t, { projectKey: t.project, deriveIfcGuid }));
}

const result = await runAdapter(config, { fetchSource });
console.log(JSON.stringify(result, null, 2));
process.exit(result.conformant ? 0 : 1);
