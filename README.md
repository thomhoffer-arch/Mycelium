# Mycelium — the open connective network for AEC data

**🌐 Live site:** https://thomhoffer-arch.github.io/Mycelium/ — *custom domain `connectivespine.org` coming soon.*

**Mycelium** is the open interoperability layer that links fragmented construction data —
model, clash, finance, inspection — across tools, parties and phases. Each **connector** exposes
one source as **spine records** (a shared identity + freshness + provenance shape) so any
orchestrator can join, triage and account for them. **No connector is mandatory; consumers
degrade gracefully when one is absent.**

> **Mycelium Studio** is the intelligence layer that grows in it. Mycelium is the open, neutral
> substrate (Apache-2.0); Mycelium Studio is the private brain built on top. A standard wins by
> being implementable by everyone — open or closed — so Mycelium is permissively licensed by design.

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

Mycelium is implemented by **connectors** (which expose sources as spine records) and consumed by
**Mycelium Studio**, the private intelligence layer.

**Connectors** — the canonical index is the [connector hub](hub/REGISTRY.md). Current connectors:

- [Mycelium-for-Revit](https://github.com/thomhoffer-arch/Mycelium-for-Revit) — Autodesk Revit (model source)
- [Mycelium-for-Solibri](https://github.com/thomhoffer-arch/Mycelium-for-Solibri) — Solibri issues + checking/QA results
- [Mycelium-for-Navisworks](https://github.com/thomhoffer-arch/Mycelium-for-Navisworks) — Navisworks Clash Detective
- [Mycelium-for-Dalux](https://github.com/thomhoffer-arch/Mycelium-for-Dalux) — Dalux Field/Build (live BCF-API)
- [Mycelium-for-OpenAEC](https://github.com/thomhoffer-arch/Mycelium-for-OpenAEC) — OpenAEC Studio (IFCX/BCF)
- [Mycelium-for-Forma](https://github.com/thomhoffer-arch/Mycelium-for-Forma) — Autodesk Forma (early design)
- [Mycelium-for-Qonic](https://github.com/thomhoffer-arch/Mycelium-for-Qonic) — Qonic
- [Mycelium-for-BIM2RDT](https://github.com/thomhoffer-arch/Mycelium-for-BIM2RDT) — robot-ready site digital twins
- …plus in-repo example connectors (reference, email, ERPNext, BCF) under [`connectors/`](connectors/)

**Mycelium Studio** (private) — joins, triages and accounts for spine records across connectors, with
an append-only provenance ledger. The open spine never depends on it.

> Commercial supersets (e.g. **PDRA**) may implement the same contract but ship separately.

---

## License
Apache-2.0 (see `LICENSE`) — implement it freely, open or commercial. "Mycelium" the name and brand
are not granted by the license.