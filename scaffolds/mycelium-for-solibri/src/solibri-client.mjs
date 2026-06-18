// Solibri Desktop REST API client → rows for the spine adapter.
//
// Scope: this connector targets the data the BCF-API does NOT express — the
// rule **checking results** (quality/clash issues with their component IFC
// GlobalIds and locations). Plain BCF issues should go through
// `mycelium-for-bcf-api` (Solibri BCF Live) instead.
//
// The Solibri REST API is OpenAPI-specced and served on localhost while Solibri
// Desktop runs (see RestApiUsage in the Solibri Developer Platform docs). Exact
// paths/fields vary slightly by version — confirm against YOUR version's
// OpenAPI and adjust the constants below. The shape used here:
//   GET /checking/results  -> [{ guid, rule, severity, status, component:{ifcGuid}, location, modified }]
//
// Offline-safe: with no SOLIBRI_BASE_URL set it returns mock results so
// `npm start` / `npm test` work in one go with zero network.
import { deriveIfcGuid } from '../vendor/mycelium-sdk.mjs';

const RESULTS_PATH = '/checking/results'; // ← verify against your OpenAPI

const MOCK = [
  {
    guid: 'SOL-INT-114',
    rule: 'Intersection: Structural vs MEP',
    severity: 'critical',
    status: 'open',
    revitUniqueId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee-000000a1',
    project: 'horizons',
    zone: { kind: 'storey', id: 'B01', name: 'B – onderbouw' },
    modified: '2026-06-17T11:02:00Z',
  },
];

async function getJson(url, token) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Solibri REST ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

export function makeFetchSource({ env = process.env } = {}) {
  const baseUrl = env.SOLIBRI_BASE_URL; // e.g. http://localhost:10876/api
  const token = env.SOLIBRI_TOKEN;
  const projectKey = env.SOLIBRI_PROJECT_KEY ?? 'horizons';

  return async function fetchSource() {
    if (!baseUrl) {
      return MOCK.map((r) => ({
        ...r,
        ifcGuid: deriveIfcGuid(r.revitUniqueId),
        text: `${r.rule} severity=${r.severity} status=${r.status}`,
      }));
    }
    const results = await getJson(`${baseUrl}${RESULTS_PATH}`, token);
    return (results ?? []).map((r) => ({
      // local id within Solibri
      guid: r.guid ?? r.id,
      project: projectKey,
      // component IFC GlobalId is the cross-tool join key
      ifcGuid: r.component?.ifcGuid ?? r.ifcGuid,
      classification: r.classification, // if the rule emits one
      zone: r.location?.zone ?? r.zone,
      // carry severity/status/rule as free text for edge extraction downstream
      text: `${r.rule ?? ''} severity=${r.severity ?? ''} status=${r.status ?? ''}`,
      modified: r.modified ?? r.modifiedDate,
    }));
  };
}
