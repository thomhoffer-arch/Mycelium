# Contributing

## Versioning (contract semver — versions the CONTRACT, not code)
- **Minor (`v0.x`)** — additive only: new optional keys, edge types, examples. Backward-compatible;
  existing connectors keep working.
- **Major (`v1`, `v2`)** — breaking: removing/renaming a MUST key, changing a shape or join
  semantics. Bump major + document the migration.
- **Deprecate, don't delete** — mark a field deprecated for one major before removal.

## Conformance
Every connector must pass `conformance/` against the spine version it targets and **declare that
version** (in its README and in its hub registry entry). A `v0.1`-conformant connector must keep
working under any later `v0.x`.

## Adding a connector to the hub
Open a PR adding a row to `hub/REGISTRY.md` with: name, source, spine version, repo URL, license,
and maintainer. Connectors live in their own repos; the hub only indexes them.

## Spec changes
Edit `spec/connective-spine.md` and the matching `spec/schema/*.json` together — prose and schema
must agree. Add/expand an example in `spec/examples/`. Run the conformance kit.
