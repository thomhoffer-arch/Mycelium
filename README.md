# Mycelium — the open connective network for AEC data

**Mycelium** is the open interoperability layer that links fragmented construction data —
model, clash, finance, inspection — across tools, parties and phases. Each **connector** exposes
one source as **spine records** (a shared identity + freshness + provenance shape) so any
orchestrator can join, triage and account for them. **No connector is mandatory; consumers
degrade gracefully when one is absent.**

> Loam is the intelligence layer that grows in it. Mycelium is the open, neutral substrate
> (Apache-2.0); Loam is the private brain built on top. A standard wins by being implementable by
> everyone — open or closed — so Mycelium is permissively licensed by design.

## What's here
```
spec/         The Connective Spine — the contract (identity · freshness · provenance), v0.1
              + machine-readable JSON Schemas + example records
conformance/  A zero-dependency validator + checklist so a connector can self-certify
connectors/   How to build a connector: the spine-adapter template, a README template,
              and a runnable reference connector
hub/          The registry — the index of third-party connectors & hubs (and how to register)
```

## The 90-second pitch
AEC data is trapped in silos (model ≠ clash ≠ finance ≠ inspection). Mycelium gives every source
**one shared shape** — a stable identity record, a freshness stamp, and an append-only provenance
event — so they **join** instead of staying siloed. Build a connector once; any spine-aware tool
can consume it.

## Build a connector
1. Read `spec/connective-spine.md` (the contract) and `connectors/SPINE_ADAPTER_TEMPLATE.md`.
2. Emit spine records (identity + freshness; provenance on writes). Validate with `conformance/`.
3. Declare the spine version you target (`v0.1`). Register in `hub/REGISTRY.md`.

## Status
`v0.1` — the contract, schemas, conformance kit and a reference connector are here. Governance is
lightweight and open (see `GOVERNANCE.md`); the spec evolves by additive minor versions
(`CONTRIBUTING.md`).

---

## Ecosystem

The Connective Spine is implemented by **model sources** (connectors) and consumed by **orchestrators**:

- **Model Sources**:
  - [PDRA](https://github.com/thomhoffer-arch/PDRA) (Revit MCP tools)
  - [loam-revit-connector](https://github.com/thomhoffer-arch/loam-revit-connector) (Revit MCP tools, early stage)

- **Orchestrators**:
  - [Loam](https://github.com/thomhoffer-arch/Loam) (private; constructs spine records and provenance ledger)

---

## License
Apache-2.0 (see `LICENSE`) — implement it freely, open or commercial. "Mycelium" the name and brand
are not granted by the license.