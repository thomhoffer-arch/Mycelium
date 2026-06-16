---
name: New connector
about: Propose a new Mycelium connector
title: 'Connector: <source>'
labels: connector
---

**Source**: <e.g. ERPNext, BCF, Revit>
**Spine version targeted**: v0.1
**License**: <Apache-2.0 / MIT / …>
**Maintainer**: <github handle or org>
**Repo**: <URL or `this repo/connectors/<dir>`>

### Identity keys it emits
- [ ] `source`, `sourceLocalId`, `projectKey` (MUST)
- [ ] At least one join key (`uniqueId` / `ifcGuid` / `classification` / `workPackage` / `costCode` / `zone`)

### Capabilities
- Read: <which tools / endpoints>
- Write (optional): <which, gated propose→approve→execute>

### Conformance
- [ ] `node conformance/validate.mjs` passes on example records
- [ ] Freshness stamp emitted on every response
- [ ] Provenance event on every approved write
