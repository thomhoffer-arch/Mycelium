// Minimal buildingSMART BCF-API client → rows for the spine adapter.
//
// Endpoints used (BCF-API 2.1/3.0, all relative to the preset baseUrl):
//   GET /projects/{project_id}/topics
//   GET /projects/{project_id}/topics/{guid}/viewpoints   (for component ifc_guid)
//
// Offline-safe: with no BCF_TOKEN/BCF_PROJECT_ID set it returns one mock topic
// so `npm start` / `npm test` work in one go with zero network. Set the env
// vars (see README) to hit a real server.
import { deriveIfcGuid } from '../vendor/mycelium-sdk.mjs';

const MOCK = [
  {
    topicGuid: 'B-033',
    project: 'horizons',
    revitUniqueId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee-00000042',
    modelInstanceId: 'verguid-ae5e3f31',
    zone: { kind: 'storey', id: 'B01', name: 'B – onderbouw' },
    modifiedDate: '2026-06-17T09:15:00Z',
  },
];

async function getJson(url, token) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`BCF-API ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

// Pull the first component IFC GlobalId from a topic's viewpoints, if any.
async function firstIfcGuid(baseUrl, projectId, topicGuid, token) {
  try {
    const vps = await getJson(`${baseUrl}/projects/${projectId}/topics/${topicGuid}/viewpoints`, token);
    for (const vp of vps ?? []) {
      const comp = vp?.components?.selection?.[0];
      if (comp?.ifc_guid) return comp.ifc_guid;
    }
  } catch {
    /* viewpoints are optional; fall through */
  }
  return undefined;
}

// Returns a fetchSource() for runAdapter.
export function makeFetchSource({ baseUrl, env = process.env } = {}) {
  const token = env.BCF_TOKEN;
  const projectId = env.BCF_PROJECT_ID;

  return async function fetchSource() {
    if (!token || !projectId) {
      // one-go offline mode
      return MOCK.map((r) => ({ ...r, ifcGuid: deriveIfcGuid(r.revitUniqueId) }));
    }
    const topics = await getJson(`${baseUrl}/projects/${projectId}/topics`, token);
    const rows = [];
    for (const t of topics ?? []) {
      let ifcGuid = await firstIfcGuid(baseUrl, projectId, t.guid, token);
      if (!ifcGuid && t.revit_unique_id) {
        try { ifcGuid = deriveIfcGuid(t.revit_unique_id); } catch { /* leave undefined */ }
      }
      rows.push({
        topicGuid: t.guid,
        project: env.BCF_PROJECT_KEY ?? projectId,
        ifcGuid,
        zone: t.zone, // present only on BIMcollab-extended servers
        modifiedDate: t.modified_date ?? t.creation_date,
      });
    }
    return rows;
  };
}
