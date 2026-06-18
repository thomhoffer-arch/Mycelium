# mycelium-bcf-api

The **canonical** BCF topic → Connective Spine mapping. Import-free, zero-dep.

This is the one source of truth for how a BCF topic becomes a spine row. It is
**vendored** (copied identically) into each BCF-speaking connector —
`Mycelium-for-Dalux`, `Mycelium-for-Solibri`, `Mycelium-for-BIMcollab` — the
same way `mycelium-sdk.mjs` is vendored. Edit here, then re-sync the copies:

```bash
# from a connector repo, refresh its vendored copy
cp ../Mycelium/packages/bcf-api/bcf-api.mjs vendor/bcf-api.mjs
```

Why duplicate instead of share a dependency: each connector is a **complete,
standalone install** (`npm install <one package>`, set env, run) — no shared
lib to wire up. The cost is re-syncing this one file; the benefit is one-package
-per-tool simplicity.

## Exports

- `topicToRow(topic, { projectKey, deriveIfcGuid })` — pure topic→row mapping
  (resolves `ifc_guid` from the topic, its viewpoint components, or a Revit
  UniqueId via the passed-in `deriveIfcGuid`).
- `makeBcfApiFetch({ baseUrl, token, projectId, projectKey, deriveIfcGuid })` —
  a `fetchSource()` for true BCF-API REST servers (Dalux, BIMcollab).
- `BCF_PRESETS` — transport (baseUrl + auth) per REST vendor.

Solibri issues do not use `makeBcfApiFetch` (they arrive via Solibri's local
`/bcfxml` endpoint) but **do** reuse `topicToRow`.
