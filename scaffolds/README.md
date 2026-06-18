# scaffolds — standalone connector repo seeds

Complete, **drop-in seeds for new repositories** — not part of the Mycelium
monorepo build (they sit outside the `workspaces` globs on purpose). Each folder
is a **complete, self-contained package** meant to be copied into its **own**
repo: install one package, set env vars, run — no shared lib to wire up.

| Folder | New repo | Stack | Build in one go |
|---|---|---|---|
| `mycelium-for-solibri` | `thomhoffer-arch/mycelium-for-solibri` | Node ≥18, zero-dep | `node connector.mjs` / `npm test` |
| `mycelium-for-navisworks` | `thomhoffer-arch/mycelium-for-navisworks` | C# / .NET 4.8 add-in | `./build.ps1` (needs local Navisworks DLLs) |

> **Dalux** is not seeded here — it's an existing published repo
> ([`Mycelium-for-Dalux`](https://github.com/thomhoffer-arch/Mycelium-for-Dalux))
> to finish in place (OAuth/pagination/write-back). It already is the live
> BCF-API/REST pattern. **BIMcollab**, when wanted, follows the same
> one-package shape.

## Self-contained, by design

Each Node seed **vendors** what it needs:

- `vendor/mycelium-sdk.mjs` — the zero-dep Connective Spine SDK.
- `vendor/bcf-api.mjs` — the canonical BCF topic→spine mapping (only in
  BCF-speaking connectors), copied from `packages/bcf-api`.

No second install, no shared dependency. The cost is re-syncing those vendored
files when the canonical source changes (`cp packages/bcf-api/bcf-api.mjs
vendor/bcf-api.mjs`) — the same trade every connector already accepts for the SDK.

Each seed runs **offline against mock data** so it builds green immediately; set
the documented environment variables to point it at a real tool.

## To stand one up

```bash
cp -r scaffolds/mycelium-for-solibri/* path/to/new-repo/
cd path/to/new-repo && git init && npm test
```

> Once copied out, you can delete the corresponding folder here — the registry
> rows in `hub/REGISTRY.md` are the source of truth for where each connector lives.
