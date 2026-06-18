# example-bcf-api

A **live** BCF source over the buildingSMART **BCF-API** (the REST web service),
not the `.bcfzip` file format. One adapter, many servers: BIMcollab Cloud,
Solibri BCF Live, Dalux — all speak the same standard, so only a per-vendor
**preset** (base URL + auth + field names) changes.

```bash
node connector.mjs                 # mock BIMcollab preset, runs offline
BCF_VENDOR=solibri node connector.mjs
```

Why this exists alongside [`example-bcf`](../example-bcf): that one reads
exported files (`confidence: 'snapshot'`); this one reads the API
(`confidence: 'live'`) and is the basis for write-back. The production version
with a real REST client lives in its own repo — see
[`scaffolds/mycelium-for-bcf-api`](../../scaffolds/mycelium-for-bcf-api).

Join keys: `ifcGuid` (primary) + `zone`.
