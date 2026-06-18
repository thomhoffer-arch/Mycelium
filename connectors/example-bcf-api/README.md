# example-bcf-api

Shows how a BCF-speaking connector turns live BCF topics into spine records
using the **canonical mapping** in [`packages/bcf-api`](../../packages/bcf-api)
(`topicToRow` / `makeBcfApiFetch`).

```bash
node connector.mjs     # maps a mock topic through the shared mapping
```

There is **no generic BCF-API connector**. Each tool ships a complete,
standalone package that *vendors* this mapping (like it vendors the SDK):

- **Mycelium-for-Dalux** — live BCF-API/REST (finish the existing repo).
- **Mycelium-for-Solibri** — `/bcfxml` issues (this mapping) + native QA results.
  See [`scaffolds/mycelium-for-solibri`](../../scaffolds/mycelium-for-solibri).
- **Mycelium-for-BIMcollab** — same pattern, when wanted.

`confidence: 'live'` here vs the file-based [`example-bcf`](../example-bcf)'s
`'snapshot'`. Join keys: `ifcGuid` (primary) + `zone`.
