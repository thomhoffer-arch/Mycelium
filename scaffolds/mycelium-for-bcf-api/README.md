# mycelium-for-bcf-api

Mycelium connector for the **live BCF-API** (buildingSMART's REST web service) —
not exported `.bcfzip` files. One connector covers every BCF-API-compliant
server, because they all speak the same standard:

| `BCF_VENDOR` | Server |
|---|---|
| `bimcollab` *(default)* | BIMcollab Cloud / Nexus |
| `solibri` | Solibri BCF Live Connector |
| `dalux` | Dalux Field/Build |

It emits Connective Spine **identity + freshness** records (join keys
`ifcGuid` + `zone`, `confidence: 'live'`), ready for an orchestrator (Loam) to
join against model elements, clashes, and finance.

## Build & run — in one go

Zero runtime dependencies; the Mycelium SDK is **vendored** at
`vendor/mycelium-sdk.mjs`, so there is no install step.

```bash
node connector.mjs     # offline mock (BIMcollab preset) — prints spine records
npm test               # node --test, passes offline
```

> Replace the vendored SDK with the published `mycelium-sdk` package once it is
> on a registry: delete `vendor/`, `npm i mycelium-sdk`, and change the imports.

## Connect to a real server

Set environment variables (no code changes):

```bash
export BCF_VENDOR=bimcollab
export BCF_SPACE=yourspace          # → https://yourspace.bimcollab.com
export BCF_PROJECT_ID=<project-guid>
export BCF_PROJECT_KEY=horizons     # shared spine projectKey across sources
export BCF_TOKEN=<oauth2 access token>
node connector.mjs
```

Auth is OAuth2 bearer; obtain the token via your server's OAuth flow and pass it
as `BCF_TOKEN`. Endpoints used: `GET /projects/{id}/topics` and
`…/topics/{guid}/viewpoints` (for component `ifc_guid`).

## Layout

```
connector.mjs              entry: pick preset → build fetchSource → runAdapter
src/presets.mjs            per-vendor config (URL + auth + spine templates)
src/bcf-api-client.mjs     REST client (offline mock fallback)
vendor/mycelium-sdk.mjs    vendored Connective Spine SDK (zero-dep)
test/conformance.test.mjs  asserts records are spine-conformant
```

## What this owns vs. what it reuses

The BCF-API server gives **raw topics**; this adapter adds the **spine
semantics** on top: `ifcGuid` normalization/derivation, `live` freshness,
`projectKey` scoping, and (next) status write-back via the provenance ledger.

License: Apache-2.0.
