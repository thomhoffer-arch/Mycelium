#!/usr/bin/env node
// BCF-API connector (example) — a LIVE issue source over the buildingSMART
// BCF-API (the REST web service), as opposed to reading exported .bcfzip files.
//
// One adapter covers every BCF-API-compliant server — BIMcollab Cloud,
// Solibri BCF Live, Dalux, … — because they all speak the same standard. Only
// the *preset* (base URL + auth + a few field names) differs per vendor; the
// spine mapping is identical. This in-repo example uses mock topics so it runs
// offline; the standalone repo `mycelium-for-bcf-api` wires a real REST client
// into `fetchSource` (see scaffolds/).
import { runAdapter, deriveIfcGuid } from 'mycelium-sdk';

// A preset is just a spine `config` (same shape as example-bcf) for one vendor.
// confidence:'live' is the upgrade over reading exported files (snapshot).
const PRESETS = {
  bimcollab: {
    source: 'bimcollab',
    identity: { uniqueId: 'bcf:{topicGuid}', projectKey: '{project}', localIdField: 'topicGuid' },
    freshness: { revisionId: '{modifiedDate}', asOf: '{modifiedDate}', confidence: 'live' },
  },
  solibri: {
    source: 'solibri-live',
    identity: { uniqueId: 'bcf:{topicGuid}', projectKey: '{project}', localIdField: 'topicGuid' },
    freshness: { revisionId: '{modifiedDate}', asOf: '{modifiedDate}', confidence: 'live' },
  },
};

const vendor = process.env.BCF_VENDOR ?? 'bimcollab';
const config = PRESETS[vendor];
if (!config) throw new Error(`unknown BCF_VENDOR "${vendor}" (have: ${Object.keys(PRESETS).join(', ')})`);

// Real connectors call the BCF-API over HTTP here; this example returns one
// mock topic so it runs with no network. A topic's ifcGuid comes from its
// viewpoint component selection; when only a Revit UniqueId is present we
// derive the IFC GlobalId deterministically.
async function fetchSource() {
  return [
    {
      topicGuid: 'B-033',
      project: 'horizons',
      revitUniqueId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee-00000042',
      modelInstanceId: 'verguid-ae5e3f31',
      zone: { kind: 'storey', id: 'B01', name: 'B – onderbouw' },
      modifiedDate: '2026-06-17T09:15:00Z',
    },
  ].map((r) => ({ ...r, ifcGuid: deriveIfcGuid(r.revitUniqueId) }));
}

const result = await runAdapter(config, { fetchSource });
console.log(JSON.stringify(result, null, 2));
process.exit(result.conformant ? 0 : 1);
