# Connectors

Open connectors for the **connective spine** — the interoperability layer that links fragmented AEC data (model, clash, finance, inspection) across tools, parties and phases. Each connector exposes one source as spine records so the Loam orchestrator can join, triage and account for them. **No connector is mandatory; Loam degrades gracefully when one is absent.**

> Contract: [`connective-spine`](https://github.com/clashcontrol-io/connective-spine) · [`CONNECTORS.md`](https://github.com/clashcontrol-io/connective-spine/blob/main/CONNECTORS.md)
> Orchestrator (private): `loam` · this catalog is **open connectors only**.

## Catalog

| Connector | Source | Direction | Status | Repo |
|---|---|---|---|---|
| Revit model source | Autodesk Revit (live) | read + gated write | beta | `mycelium-connector-revit` |
| ClashControl | IFC clash detection | read + write-back | beta | `clashcontrol` |
| ERPNext | Finance (PO, retention) | read | alpha | `mycelium-connector-erpnext` |
| BCF | Inspection / coordination | read + write | alpha | `mycelium-connector-bcf` |
| PDRA (superset) | Revit, full automation | read + gated write | commercial | `pdra` (separate) |

**Maturity legend (the "is it safe to trust?" column):**
- **✅ Verified** — passed the conformance kit **and** tested against a real model/project. Carries the verified badge.
- **🟡 Community** — works and is in use, but not independently verified here.
- **🧪 Experimental** — early or partial; expect rough edges.

These connectors touch live models and financial data, so the badge is the trust signal — prefer **Verified** for anything production.

## What every connector must do (conformance)

- Key records on **`uniqueId`** (identity record, not raw ElementId or a stored param).
- Return a **freshness stamp** `{ source, revisionId, asOf, confidence }` on every response.
- Implement the relevant **contract capabilities** (e.g. a model source = the ~8 read + ~3–4 gated reversible write primitives in `CONNECTORS.md`).
- Emit a **provenance ledger event** for every approved write (`propose → approve → execute`).
- Carry **no orchestrator/proprietary logic** — a connector only translates its source to/from the spine.

A connector earns **✅ Verified** when it (1) passes the automated **conformance kit** and (2) has been **tested against a real model/project**. Below that: **🟡 Community** (works, unverified) and **🧪 Experimental** (early/partial). The badge is the trust signal — connectors touch live models and financial data, so verification matters.

## How a connector repo is structured

```
mycelium-connector-<source>/
├─ README.md          # what it connects, install, config, which capabilities it implements
├─ src/               # the implementation
├─ contract/          # pinned reference to the connective-spine contract version it targets
├─ conformance/       # tests proving it meets the contract (run in CI)
├─ examples/          # sample spine records it emits / accepts
└─ LICENSE            # open (e.g. Apache-2.0)
```

Each connector's own README states: the **source** it wraps, the **capabilities** it implements (read / write), **install + config** (credentials, env vars, endpoint), the **identity key** and **freshness** it emits, and its **conformance status**.

## Add a connector

1. Read the contract in `connective-spine` (`CONNECTORS.md`) — identity, freshness, the capability your source needs.
2. Fork the connector template; implement the capabilities; map your source ↔ spine records.
3. Run the **conformance kit**; fix until green.
4. Open a PR here to list it in the catalog (and request the verified badge).

## Boundary

Open connectors + the contract live here and in `connective-spine`. The **orchestrator, triage rules, profiles and accumulated judgment stay private** (`loam`). Commercial supersets (e.g. `pdra`) may implement the contract but ship separately. Rule of thumb: *interoperability → open; accumulated judgment → private.*
