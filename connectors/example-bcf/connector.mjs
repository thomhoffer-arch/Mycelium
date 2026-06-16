#!/usr/bin/env node
// BCF connector — translates BCF topics into spine identity records.
// Each topic carries an ifcGuid (model-side) and a zone; we also derive the
// uniqueId-equivalent from the topic's stored Revit UniqueId when present.
import { runAdapter } from '../../lib/spine-adapter.mjs';
import { deriveIfcGuid } from '../../lib/derive-ifc-guid.mjs';

const config = {
  source: 'bcf',
  identity: {
    uniqueId: 'bcf:{topicGuid}',
    projectKey: '{project}',
    localIdField: 'topicGuid',
  },
  freshness: { revisionId: '{modifiedDate}', asOf: '{modifiedDate}', confidence: 'snapshot' },
};

async function fetchSource() {
  return [
    {
      topicGuid: 'B-033',
      project: 'horizons',
      revitUniqueId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee-00000042',
      modelInstanceId: 'verguid-ae5e3f31',
      zone: { kind: 'scopeBox', id: 'Horizons_B_Onderbouw', name: 'B – onderbouw' },
      modifiedDate: '2026-06-13T12:30:00Z',
    },
  ].map((r) => ({ ...r, ifcGuid: deriveIfcGuid(r.revitUniqueId) }));
}

const result = await runAdapter(config, { fetchSource });
console.log(JSON.stringify(result, null, 2));
process.exit(result.conformant ? 0 : 1);
