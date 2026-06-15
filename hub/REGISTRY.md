# Mycelium Hub — connector registry

The index of connectors and third-party hubs that conform to the **Connective Spine**. Connectors
live in their own repos; this hub only **indexes** them. To add yours: open a PR adding a row.

| Connector | Source | Spine version | Repo | License | Maintainer | Status |
|---|---|---|---|---|---|---|
| `mycelium-connector-reference` | (example) | v0.1 | this repo `/connectors/reference-connector` | Apache-2.0 | Mycelium | reference |
| _add yours_ | … | v0.1 | … | … | … | proposed |

## How to register
1. Your connector passes `conformance/` against the spine version it targets.
2. Its README **declares that version** and links the spine it conforms to.
3. Open a PR adding a row above: name (`mycelium-connector-<source>`), source, spine version, repo
   URL, license, maintainer, status (proposed | reference | verified).

## Third-party hubs
Other registries/marketplaces that list spine-conformant connectors can be linked here too — the
spine is the contract; hubs are not gatekeepers.

| Hub | Scope | URL |
|---|---|---|
| _add_ | … | … |
