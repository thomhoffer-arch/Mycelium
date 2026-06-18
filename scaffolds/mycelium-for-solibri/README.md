# mycelium-for-solibri

Mycelium connector for **Solibri checking/QA results** via the Solibri Desktop
**REST API**. Emits Connective Spine identity + freshness records (join keys
`ifcGuid` + `zone`, `confidence: 'live'`).

## Scope — read this first

Solibri exposes two kinds of data:

| Data | Use |
|---|---|
| Plain BCF issues (Presentation view) | **`mycelium-for-bcf-api`** via Solibri BCF Live |
| **Rule checking / QA results** (severity, status, rule, component) | **this connector** |

This repo deliberately covers only the second — the quality/clash results that
the BCF-API can't express. Don't duplicate issue ingestion here.

## Build & run — in one go

Zero runtime dependencies; the SDK is **vendored** at `vendor/mycelium-sdk.mjs`.

```bash
node connector.mjs   # offline mock — prints spine records
npm test             # node --test, passes offline
```

## Connect to Solibri Desktop

The REST API is served on localhost while Solibri Desktop runs (Solibri
Developer Platform → *Using Solibri with REST API*). Set:

```bash
export SOLIBRI_BASE_URL=http://localhost:10876/api   # confirm host/port + base path
export SOLIBRI_TOKEN=<bearer if your setup requires one>
export SOLIBRI_PROJECT_KEY=horizons
node connector.mjs
```

> **Verify the endpoint.** `src/solibri-client.mjs` assumes
> `GET /checking/results` with `{ guid, rule, severity, status, component.ifcGuid,
> location, modified }`. Exact paths/fields differ by Solibri version — check
> your version's OpenAPI document and adjust `RESULTS_PATH` and the field
> mapping. Everything else (spine mapping, conformance) stays the same.

## Layout

```
connector.mjs              spine config + entry
src/solibri-client.mjs     REST client (offline mock fallback)
vendor/mycelium-sdk.mjs    vendored Connective Spine SDK (zero-dep)
test/conformance.test.mjs  asserts records are spine-conformant
```

License: Apache-2.0.
