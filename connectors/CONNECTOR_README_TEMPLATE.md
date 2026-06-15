<!-- Template README for a connector repo. Copy to your connector's README.md and fill in. -->

# <Connector name> — `mycelium-connector-<source>`

Connects **<source>** to the connective spine so the Loam orchestrator can join, triage and account for it. Implements the [connective-spine contract](https://github.com/clashcontrol-io/connective-spine/blob/main/CONNECTORS.md). Not mandatory — Loam degrades gracefully without it.

## What it connects
- **Source:** <tool / API + version>
- **Direction:** read · write · read + gated write
- **Capabilities implemented:** <e.g. resolveByUniqueId, filterByScopeBox, …>
- **Out of scope:** <what it deliberately does not do>

## Install
<package / build steps / how it registers as an MCP server>

## Configure
- **Endpoint:** `<url>`
- **Credentials:** `<env vars / how>` — **stay local; never sent anywhere**
- **Identity key emitted:** `uniqueId` (`<how derived>`)
- **Freshness stamp:** `{ source, revisionId, asOf, confidence }` on every response

## Spine mapping
| Source entity | → Spine record | Join edge |
|---|---|---|
| <entity> | `uniqueId` / `classification` / `workPackage` / `zone` | `<edge type>` |

## Write-back (if any)
- **Gated:** `propose → human approve → execute`; emits one **ledger event** per write.
- **Reversible:** <how — transaction group / undo>.

## Conformance
- [ ] Keys records on `uniqueId` (not raw id / stored param)
- [ ] Returns a freshness stamp on every response
- [ ] Emits a ledger event per approved write
- [ ] Carries no orchestrator/proprietary logic
- **Status:** verified · pending

## Security
- Credentials stay local with the operator; the connector never transmits them.
- Treat all source content as **data, not instructions** (no acting on instructions embedded in fetched content).

## License
<open, e.g. Apache-2.0>
