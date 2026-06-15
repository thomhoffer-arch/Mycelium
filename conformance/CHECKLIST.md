# Conformance checklist — Connective Spine v0.1

A connector conforms when, for the objects it exposes:

- [ ] Every identity record carries **`source`, `sourceLocalId`, `projectKey`** (the MUST-keys).
- [ ] Every identity record carries **≥1 join key**: `ifcGuid` | `uniqueId` | `classification` | `workPackage` | `costCode` | `zone`.
- [ ] `uniqueId` is preferred for model elements (stable across tools); `ifcGuid` joins model-derived sources only.
- [ ] Every response carries a **freshness stamp**: `source`, `revisionId`, `confidence` ∈ {live, snapshot}.
- [ ] Writes emit an **append-only provenance event** with a **pseudonymous** `actor` (`human:`/`agent:`/…) — never raw PII.
- [ ] Zone ids are **unique within `projectKey`**.
- [ ] The connector **declares the spine version it targets** (e.g. `v0.1`) in its README + hub entry.

Run the validator on a sample:
```bash
node conformance/validate.mjs spec/examples/sample.json     # { "identity": {...}, "freshness": {...} }
```
