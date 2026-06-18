# scaffolds — standalone connector repo seeds

These are **complete, drop-in seeds for new repositories** — not part of the
Mycelium monorepo build (they're outside the `workspaces` globs on purpose).
Each folder is meant to be copied/moved into its **own** repo, matching the
registry's "each connector lives in its own repo" rule.

| Folder | New repo | Stack | Build in one go |
|---|---|---|---|
| `mycelium-for-bcf-api` | `thomhoffer-arch/mycelium-for-bcf-api` | Node ≥18, zero-dep (vendored SDK) | `node connector.mjs` / `npm test` |
| `mycelium-for-solibri` | `thomhoffer-arch/mycelium-for-solibri` | Node ≥18, zero-dep (vendored SDK) | `node connector.mjs` / `npm test` |
| `mycelium-for-navisworks` | `thomhoffer-arch/mycelium-for-navisworks` | C# / .NET Framework 4.8 add-in | `./build.ps1` (needs local Navisworks DLLs) |

## To stand one up

```bash
# create the new repo, then:
cp -r scaffolds/mycelium-for-bcf-api/* path/to/new-repo/
cd path/to/new-repo && git init && npm test
```

The two Node seeds **vendor** the zero-dep Connective Spine SDK at
`vendor/mycelium-sdk.mjs` so they run with no install and no network. Swap it
for the published `mycelium-sdk` package once that's on a registry.

Each seed runs **offline against mock data** so it builds green immediately;
set the documented environment variables to point it at a real server/tool.

> Once copied out, you can delete the corresponding folder here — these seeds
> are a convenience, the registry rows in `hub/REGISTRY.md` are the source of
> truth for where each connector lives.
