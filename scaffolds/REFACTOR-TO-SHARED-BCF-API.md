# Finish Mycelium-for-Dalux → shared BCF-API mapping

> **Drop this file into the root of the `Mycelium-for-Dalux` repo** (rename as
> you like, e.g. `REFACTOR.md`). It's a complete, self-contained task: a human
> or a Claude Code session running *inside that repo* can follow it top to
> bottom. Appendix A contains the canonical `bcf-api.mjs` to vendor, so you
> don't need the Mycelium clone.

## Goal & guardrails

Mycelium-for-Dalux already is the live BCF-API/REST pattern (own repo, `ifcGuid`
join, `confidence: 'live'`, provenance `append()`), just hardcoded to Dalux's
endpoint/auth/field names. This refactor makes it **preset #1 of the shared
pattern** without changing what the package *is*:

- **Keep the repo name** (`Mycelium-for-Dalux`). No rename, no generic repo.
- **Stay one complete, standalone package** — `npm install`, set env, run. No
  shared lib dependency; the shared mapping is **vendored** (copied in), exactly
  like `vendor/mycelium-sdk.mjs`.
- **Three deliverables:** (1) vendor the canonical mapping, (2) rewire the
  hardcoded topic→spine mapping to it, (3) finish OAuth + pagination + write-back.

Acceptance: the connector still emits the same spine records it does today (no
regression in `source`, join keys, or freshness), but the bespoke mapping code
is gone and a real Dalux project can be pulled live and have a status written
back.

---

## Step 1 — Vendor the canonical mapping

Create `vendor/bcf-api.mjs` from **Appendix A** (or copy it from a Mycelium
checkout: `cp <Mycelium>/packages/bcf-api/bcf-api.mjs vendor/bcf-api.mjs`).

This file is **import-free and zero-dep** on purpose — it's portable and you
re-sync it the same way you re-sync `vendor/mycelium-sdk.mjs`. Add a one-line
note to the repo README:

> `vendor/bcf-api.mjs` is a vendored copy of `Mycelium/packages/bcf-api`. Edit
> the canonical source there, then `cp` it back here.

---

## Step 2 — Rewire `connector.mjs` to the shared mapping

Replace the bespoke topic→record code with the shared `topicToRow` /
`makeBcfApiFetch`. Target shape:

```js
import { runAdapter, deriveIfcGuid } from './vendor/mycelium-sdk.mjs';
import { makeBcfApiFetch, BCF_PRESETS } from './vendor/bcf-api.mjs';

const preset = BCF_PRESETS.dalux;            // baseUrl + auth, shared

const config = {
  source: 'dalux',
  identity: { uniqueId: 'bcf:{localId}', projectKey: '{project}', localIdField: 'localId' },
  freshness: { revisionId: '{modified}', asOf: '{modified}', confidence: 'live' },
};

export async function run(env = process.env) {
  const token = await getAccessToken(env);   // Step 3
  const fetchSource = makeBcfApiFetch({
    baseUrl: preset.baseUrl,
    token,
    projectId: env.DALUX_PROJECT_ID,
    projectKey: env.DALUX_PROJECT_KEY,
    deriveIfcGuid,
  });
  return runAdapter(config, { fetchSource });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await run();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.conformant ? 0 : 1);
}
```

**Migration checklist for this step**
- [ ] Delete the old per-field mapping; rely on `topicToRow` (it resolves
      `ifc_guid` from the topic, its viewpoint components, or a Revit UniqueId).
- [ ] If Dalux returns field names that differ from BCF-API defaults
      (`guid`, `modified_date`, `title`, `viewpoints[].components.selection[].ifc_guid`),
      normalize them in a thin adapter **before** `topicToRow`, OR widen
      `topicToRow` in the canonical source and re-vendor. Prefer the latter if
      it's a real BCF-API field — that's the whole point of one source of truth.
- [ ] Confirm the emitted records match a saved sample from the current version
      (same `source`, `uniqueId`, `ifcGuid`, `zone`, `confidence`).

---

## Step 3 — OAuth2 token acquisition

Dalux's BCF-API is OAuth2-protected. Add a `getAccessToken(env)` that fetches a
bearer token. Implement the grant Dalux issues you (client-credentials shown;
swap for auth-code + refresh if that's your setup):

```js
async function getAccessToken(env) {
  if (env.DALUX_TOKEN) return env.DALUX_TOKEN;        // allow a pre-obtained token
  const res = await fetch(env.DALUX_TOKEN_URL, {       // confirm Dalux's token endpoint
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.DALUX_CLIENT_ID,
      client_secret: env.DALUX_CLIENT_SECRET,
      scope: env.DALUX_SCOPE ?? '',
    }),
  });
  if (!res.ok) throw new Error(`Dalux OAuth ${res.status} ${res.statusText}`);
  return (await res.json()).access_token;
}
```

Env vars: `DALUX_TOKEN_URL`, `DALUX_CLIENT_ID`, `DALUX_CLIENT_SECRET`,
`DALUX_SCOPE` (optional), or `DALUX_TOKEN` to bypass. **Never commit secrets** —
read from env only; add `.env` to `.gitignore`.

- [ ] Confirm the exact token URL, grant type, and scope with Dalux's API docs.
- [ ] Cache the token until expiry (`expires_in`) so each run doesn't re-auth.

---

## Step 4 — Pagination

`makeBcfApiFetch` (Appendix A) fetches one page of `/topics`. Dalux projects can
exceed a page, so extend it to follow paging. BCF-API servers vary; the common
shapes are `$top`/`$skip` query params or a `Link: rel="next"` header. Add a
loop in `makeBcfApiFetch` (edit the canonical source + re-vendor):

```js
// inside makeBcfApiFetch, replace the single getJson(topics) with:
const pageSize = 500;
let skip = 0, page;
const topics = [];
do {
  page = await getJson(`${baseUrl}/projects/${projectId}/topics?$top=${pageSize}&$skip=${skip}`, token, fetchImpl);
  topics.push(...(page ?? []));
  skip += pageSize;
} while ((page?.length ?? 0) === pageSize);
```

- [ ] Confirm Dalux's paging convention (`$top/$skip` vs `Link` header vs cursor).
- [ ] Apply the same paging to viewpoints if a topic can have many.

---

## Step 5 — Status write-back (propose → approve → execute)

Reading is half the value; the seamless win is pushing a status change back into
Dalux and logging it in the tamper-evident provenance ledger. Add a `writeBack`
path:

```js
import { append } from './vendor/mycelium-sdk.mjs';

// Set a topic's status via the BCF-API, then record provenance.
export async function setTopicStatus({ env, topicGuid, ifcGuid, before, after, actor, approvedBy }) {
  const token = await getAccessToken(env);
  const preset = BCF_PRESETS.dalux;

  // 1) propose (log intent)
  append('ledger.jsonl', {
    source: 'dalux', action: 'set_topic_status', actor, proposedBy: actor,
    approvedBy: approvedBy ?? null, targetKeys: { ifcGuid },
    before: { status: before }, after: { status: after }, result: 'proposed',
  });

  // 2) execute against Dalux BCF-API  (confirm exact endpoint/body)
  const res = await fetch(`${preset.baseUrl}/projects/${env.DALUX_PROJECT_ID}/topics/${topicGuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ topic_status: after }),
  });

  // 3) record outcome
  append('ledger.jsonl', {
    source: 'dalux', action: 'set_topic_status', actor,
    approvedBy: approvedBy ?? null, targetKeys: { ifcGuid },
    before: { status: before }, after: { status: after },
    result: res.ok ? 'executed' : 'failed',
  });
  if (!res.ok) throw new Error(`Dalux write-back ${res.status} ${res.statusText}`);
}
```

Rules (from the spine contract): `actor`/`approvedBy` must be **pseudonymous**
refs (`human:` / `agent:` / `service:` / `did:`) — no PII. The ledger is
append-only and hash-chained; verify with `verifyChain('ledger.jsonl')`.

- [ ] Confirm Dalux's status-update endpoint, method, and field name
      (`topic_status` vs `status`), plus whether comments need a separate POST.
- [ ] Gate `result: 'executed'` behind an approval step if a human must sign off.

---

## Acceptance / done criteria

- [ ] `node connector.mjs` against a real Dalux project returns spine records;
      `result.conformant === true`.
- [ ] Records are unchanged vs. the pre-refactor version for the same data
      (diff a saved sample).
- [ ] All bespoke topic-mapping code removed; only `topicToRow` /
      `makeBcfApiFetch` used. `vendor/bcf-api.mjs` is byte-identical to the
      canonical `packages/bcf-api/bcf-api.mjs`.
- [ ] OAuth token fetched (and cached), topics paginated fully, one status
      write-back round-trips and appears in `ledger.jsonl` with a valid chain.
- [ ] README documents env vars and the "re-sync vendored bcf-api.mjs" step.
- [ ] Registry row in the Mycelium hub already reads "Dalux Field/Build issues
      (live BCF-API/REST)" — no change needed.

---

## Appendix A — `vendor/bcf-api.mjs` (canonical, paste verbatim)

```js
// Canonical BCF-API → Connective Spine mapping.
//
// HOUSE RULE: this file is the single source of truth for the BCF topic→spine
// mapping. It is **vendored** (copied identically) into each connector that
// speaks BCF — Mycelium-for-Dalux, Mycelium-for-Solibri, Mycelium-for-BIMcollab
// — exactly like `vendor/mycelium-sdk.mjs`. Edit it HERE, then re-sync the
// copies. One canonical source, duplicated artifact, one-package-per-tool install.
//
// Deliberately **import-free and zero-dep** so the copy is portable to any
// connector directory without rewriting paths. Helpers it needs (deriveIfcGuid)
// are passed IN from the connector's vendored SDK.

// Transport presets for true BCF-API REST servers. Solibri issues arrive via
// its local /bcfxml endpoint instead, so Solibri reuses topicToRow() directly.
export const BCF_PRESETS = {
  dalux: {
    source: 'dalux',
    baseUrl: 'https://field.dalux.com/service/api/bcf/2.1',
    auth: 'oauth2-bearer',
  },
  bimcollab: {
    source: 'bimcollab',
    baseUrl: 'https://{space}.bimcollab.com/bcf/2.1',
    auth: 'oauth2-bearer',
  },
};

// First component IFC GlobalId from a topic's viewpoints, if present.
export function firstComponentIfcGuid(topic) {
  for (const vp of topic.viewpoints ?? []) {
    const sel = vp?.components?.selection ?? [];
    for (const c of sel) if (c?.ifc_guid) return c.ifc_guid;
  }
  return undefined;
}

// Pure mapping: one BCF topic → one spine-adapter row. `deriveIfcGuid` is the
// vendored SDK helper; pass it so this file stays import-free.
export function topicToRow(topic, { projectKey, deriveIfcGuid } = {}) {
  let ifcGuid = topic.ifc_guid ?? firstComponentIfcGuid(topic);
  if (!ifcGuid && topic.revit_unique_id && typeof deriveIfcGuid === 'function') {
    try { ifcGuid = deriveIfcGuid(topic.revit_unique_id); } catch { /* leave undefined */ }
  }
  return {
    localId: topic.guid,
    project: projectKey ?? topic.project,
    ifcGuid,
    zone: topic.zone, // present only on BIMcollab-extended servers
    modified: topic.modified_date ?? topic.creation_date,
    text: topic.title ?? '',
  };
}

async function getJson(url, token, fetchImpl) {
  const res = await fetchImpl(url, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`BCF-API ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

// Build a fetchSource() that pulls topics (+ their viewpoints) from a real
// BCF-API REST server and returns spine rows. Used by Dalux/BIMcollab; Solibri
// has its own client. Caller supplies token/projectId/deriveIfcGuid.
export function makeBcfApiFetch({
  baseUrl,
  token,
  projectId,
  projectKey,
  deriveIfcGuid,
  fetchImpl = fetch,
} = {}) {
  return async function fetchSource() {
    const topics = await getJson(`${baseUrl}/projects/${projectId}/topics`, token, fetchImpl);
    const rows = [];
    for (const t of topics ?? []) {
      const vps = await getJson(
        `${baseUrl}/projects/${projectId}/topics/${t.guid}/viewpoints`, token, fetchImpl,
      ).catch(() => []);
      rows.push(topicToRow({ ...t, viewpoints: vps }, { projectKey, deriveIfcGuid }));
    }
    return rows;
  };
}
```

> Note: Appendix A is the *baseline*. Steps 4 (pagination) and 5 (write-back)
> ask you to extend this canonical file and re-vendor it into every BCF
> connector — that's the "one source of truth" payoff.
