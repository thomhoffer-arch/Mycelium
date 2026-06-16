# Connective Spine — identity, freshness & provenance contract

> **Status:** draft **v0.1** — the contract every data source conforms to so it can be
> joined, kept fresh, and held accountable across the connective layer.
> **License:** open spec (Apache-2.0) — the schema is public; the *intelligence*
> (orchestrator, composite decisions, models) is private to whoever builds it.
> **Audience:** anyone building a source connector (model, clash, finance, contracts, site/QA, CDE).

## Conformance language

The keywords **MUST**, **SHOULD**, and **MAY** are used per RFC 2119. A connector is
**conformant** when it satisfies every MUST in §7. Conformance is additive: new keys and
new event types may appear over time and **MUST NOT** break existing consumers.

## Why this exists

AEC data lives in silos: the model is in one tool, the clash detector in another, finance in a
third, the field reports in a fourth. The point of this spec is to make those silos joinable —
cross-tool data, joined on a shared identity, with writes going through propose → approve →
execute and a history that can't be re-created elsewhere. The same loop generalises across
more sources (clash, finance/ERP, contracts, site/QA, CDE), more parties, and across the
project lifecycle.

That only works if every source speaks a shared contract for three things:

1. **Identity** — how to name the same real-world thing across tools.
2. **Freshness** — which revision of the truth a datum belongs to.
3. **Provenance** — who proposed/approved/executed each change, append-only.

A GUID is necessary but **not** the spine. It joins model-derived sources (model, clash,
BCF, QA). It does **not** reach finance, contracts, or documents — those join on
**classification, work-package, cost-code, and zone**. So identity is a *record of
keys*, of which any GUID is one edge.

> **Field test (13 Jun 2026) — why v0.1 changed the model-side key.** A live join between
> two Revit-reading tools on a real project **failed**: one emitted `ifcGuid` (the other's
> stored `IFC_GUID` parameter was unpopulated → no match) and `revitId`/ElementId (one tool
> was on a *detached copy* → different document, different id space → no match). Lesson baked
> in below: the stable model-side key is the Revit **UniqueId** (derive the IfcGuid from it),
> never the stored IFC_GUID param and never raw ElementId, and every record carries a
> **modelInstanceId** so joins can't cross copies.

## 1. Identity record

Every source emits, per object, as many of these keys as it has. None is globally mandatory
(except `source`, `sourceLocalId`, `projectKey`, `modelInstanceId`); the join uses whichever
keys two sources share.

| Key | Meaning | Joins to |
|---|---|---|
| `uniqueId` | **Revit UniqueId** — the stable, worksharing-safe element id (GUID + 8 hex) | **model-derived (the reliable Revit key)** |
| `ifcGuid` | IFC GlobalId — **derived deterministically from `uniqueId`**, not the stored param | model, clash, BCF, QA |
| `revitId` | Revit ElementId — **document-local, debug only, NEVER a cross-tool key** | (diagnostics within one doc) |
| `modelInstanceId` | document/version instance (e.g. Revit `VersionGUID`) | guards joins against crossing copies |
| `classification` | `{ system, code }` — NL-SfB / Uniclass / OmniClass / Uniformat | **finance/ERP, specs** |
| `workPackage` | work-package / activity id | **finance/ERP, scheduling** |
| `costCode` | cost / budget code | **finance/ERP** |
| `zone` | spatial bucket; today = storey/level (later IfcZone/IfcSpace) | site, QA, scheduling |
| `source` | originating tool id (`revit`, `ifc`, `bcf`, `erpnext`, …) | provenance, freshness |
| `sourceLocalId` | the object's id *inside* its source tool | round-trip / write-back |
| `projectKey` | shared project identifier | partitioning, multi-party |

**Rules**
- **Model-side identity = `uniqueId`.** It is Revit's only stable, worksharing-safe key.
  Derive `ifcGuid` from it with the standard Revit→IFC algorithm (same algo on every source) so
  all tools produce the same GUID **without** depending on whether anyone ran an IFC export.
- **Do NOT rely on the stored Revit `IFC_GUID` parameter** — it is only populated after an IFC
  export round-trip and is inconsistently present (attribute-completeness problem).
- **`revitId` (ElementId) is document-local** — it MUST NOT be used as a cross-tool join key
  (two copies of the same file have different ElementId spaces). Keep it for diagnostics only.
- **Every record MUST carry `modelInstanceId`.** A consumer MUST refuse/flag a join between
  records whose model instances differ (i.e. different copies of the "same" file).
- A source that can emit `classification` **SHOULD**, even when it also has a GUID — it is the
  only bridge to non-geometric sources.
- Keys are additive: emit more over time without breaking consumers. Every record **MUST**
  carry `source`, `sourceLocalId`, `projectKey`, `modelInstanceId`.

### 1.0 `projectKey` convention (source-agnostic)
`projectKey` is the **shared, source-neutral project id** every source tags its data with
(e.g. `horizons`). It is **not tied to any tool**, so adding non-Revit sources stays trivial —
each maps its own native project id to the same canonical key. Where a source auto-generates
its own id (the two Revit-reading tools today), the orchestrator reconciles it via the mapping
corpus (`kind:'projectkey'`). **Bootstrap for Revit tools only:** so two Revit-reading tools agree on a
deterministic *native* id automatically, both may use `projectKey = "revit:" + ProjectInformation.UniqueId`
(same open doc → same string); that native id is then mapped once to the canonical assigned key.


### 1.1 `classification` object

```jsonc
{ "system": "NL-SfB" | "Uniclass" | "OmniClass" | "Uniformat",
  "code":   "32.31",                 // verbatim code string in that system
  "table":  "Pr" }                   // OPTIONAL, e.g. Uniclass table id
```
A source MAY emit multiple classifications (array); consumers join on a matching
`{system, code}` pair.

### 1.2 `zone` object

```jsonc
{ "kind": "storey" | "ifcZone" | "ifcSpace" | "scopeBox",
  "id":   "Horizons_B_Onderbouw",    // stable id within projectKey
  "name": "B – onderbouw" }
```
Zone ids **MUST** be unique within a `projectKey` (closes the cross-project scope-box trap).

### 1.3 Join semantics

- Two records **join** when they share ≥1 key with equal value, within the same `projectKey`
  **and** compatible `modelInstanceId`.
- **Strongest edge:** `uniqueId` (or `ifcGuid` derived from it) for model-derived sources.
  `classification` / `workPackage` / `costCode` / `zone` are **weaker** (one-to-many) — treat
  them as a **set** join, not a unique match. `revitId` is **not** a join key.
- A pair with **no shared key MUST surface as explicitly *unjoined*** — never silently dropped
  or guessed. Inference is out of scope; links are captured in workflow.

### 1.4 Edge-type registry (the connective tissue)

A GUID is the first edge, not the spine. The projection maintains typed edges:

`same_element` (uniqueId/derived-ifcGuid), `classified_as`, `in_zone`, `in_workpackage`,
`has_costcode`, `door_adjoins_room`, `clash_at_element`, `inspection_at_room`,
`workpackage_assigned_to_sub`, `po_for_workpackage`.

New sources extend this registry by **adding edge types**, never by rewriting the spine.

## 2. Freshness stamp

Joining across mismatched revisions is the silent-wrong-answer failure mode, so the stamp is
uniform and the orchestrator's staleness guard is generic.

```jsonc
{ "source": "clash-tool", "revisionId": "model-rev-58",
  "asOf": "2026-06-17T09:58:00Z", "confidence": "live" }
```

| Field | Meaning |
|---|---|
| `source` | originating tool id |
| `revisionId` | opaque, comparable token for "same revision or not" |
| `asOf` | ISO-8601 timestamp the datum reflects |
| `confidence` | `live` \| `snapshot` \| `derived` |

`confidence`: **`live`** = read from the authoritative running source now; **`snapshot`** =
exported/cached copy that may lag; **`derived`** = computed (carries the lowest confidence of inputs).

**Per-source `revisionId` (examples)**
- **Live model connector** → connector sync id / `model._version` + `lastSync`; `revit-direct` ⇒ `live`.
- **IFC file snapshot** → `ifc:<name>#<elementCount>@v<version>` ⇒ `snapshot`.
- **Live Revit document** → `Document.GetDocumentVersion` (`VersionGUID` + `NumberOfSaves`); `has_unsaved_changes` flags in-session edits the guid doesn't yet reflect.
- **ERP / CDE** → that system's revision/etag + timestamp.

**Staleness guard (generic):** group joined data by `source`; if two sources differ in
`revisionId` and one is `live` while another is an older `snapshot`, the join is **stale** and
MUST be refused or returned flagged `stale:true` with both stamps — never silently merged.
(Tie-in: `modelInstanceId` mismatch is a hard stop, independent of revision.)

## 3. Provenance event (the ledger)

Accountable history is the moat — it cannot be backfilled, so it starts with the first
write-back. **Append-only and tamper-evident.** One event per proposal and per executed change,
to a single sink (local JSONL/Postgres now; durable store later).

```jsonc
{
  "id":         "uuid",
  "prevHash":   "sha256(previous event)",   // hash chain → tamper-evident
  "ts":         "2026-06-17T10:05:00Z",
  "projectKey": "horizons",
  "actor":      "agent:orchestrator" | "agent:llm" | "human:u_8f3a",  // PSEUDONYMOUS ref
  "proposedBy": "agent:llm",
  "approvedBy": "human:u_8f3a" | null,
  "source":     "revit" | "clash-tool" | "erpnext",   // tool that owns/executes the change
  "action":     "set_clash_status" | "edit_element" | "create_workitem",
  "targetKeys": { "uniqueId": "…", "ifcGuid": "…", "classification": { "system": "NL-SfB", "code": "32.31" } },
  "revision":   { "source": "pdra", "revisionId": "…", "asOf": "…" },
  "before":     { } | null,           // compact summary, NOT full geometry
  "after":      { } | null,
  "result":     "proposed" | "approved" | "executed" | "rejected" | "failed",
  "transport":  "mcp/http" | "mcp/stdio"
}
```

**Rules**
- **Ownership / one writer per domain:** each `action` has exactly one owning `source`
  (the clash tool owns clash status; the model authoring tool owns model edits; the ERP owns finance). No source writes another's domain.
- **Auto-propose → approve → execute:** a write is `proposed` first; it becomes `executed` only
  after an `approved` event from a human. Reuse each tool's existing autonomy gate.
- **Tamper-evident:** each event carries `prevHash` = SHA-256 of the previous event.
- **GDPR (business-case §11):** the log holds **only pseudonymous actor refs**; real
  names/emails live in a *separate, mutable* identity map outside the chain (crypto-erasable).
  No personal data enters the ledger.
- **Portable:** prefer standard carriers — BCF for issues, IFC for model, IDS for requirements.

## 4. Transport

- **Protocol:** MCP everywhere (JSON-RPC: `initialize` / `tools/list` / `tools/call`).
- **Transports:** *stdio* (host spawns the server; single-user Claude Desktop path) and
  *Streamable HTTP* (localhost/network port; the multi-party, authenticated path).
- **Recommendation:** each source exposes an **HTTP-MCP** endpoint for the orchestrator (keep
  stdio for direct single-user use). The orchestrator is the MCP **client** of all sources **and**
  the emitter of provenance events. Tool traffic = MCP; the high-volume provenance/sync stream =
  a separate append-log/event bus.

## 5. Principles (non-negotiable)

- **Open base, private intelligence.** This schema + connectors are open; the orchestrator,
  composite decisions and models are private. No proprietary identity leaks into the open layer.
  *Corollary (from the clash test):* raw detection is open; the semantic triage of which clashes
  matter is the orchestrator's job, not the detector's.
- **Sovereign by construction.** Localhost-first, self-hostable, model-agnostic. No hard
  dependency on a single US SaaS in the base layer.
- **Deterministic orchestrator.** It is the join + arbitration + ledger layer — not a second
  autonomous agent. One brain (the chat LLM), not two.
- **Generalise by adding edges, not rewrites.** New source = new identity keys + a freshness
  stamp + provenance emission. Prove the loop on model+clash, add one non-model source (ERPNext,
  via classification) as the generalisation test, then commit the substrate.
- **The ledger starts now.** Accountable history can't be backfilled.

## 6. Worked example — "risk in Zone B before handover"

```jsonc
// Identity records (note uniqueId + modelInstanceId; ifcGuid derived from uniqueId)
{ "source":"pdra","sourceLocalId":"4071989","projectKey":"horizons","modelInstanceId":"verguid-ae5e3f31",
  "uniqueId":"<revit-uniqueid>","ifcGuid":"2nuynyGAbDmerxyLRW68$W",
  "classification":{"system":"NL-SfB","code":"32.31"},"zone":{"kind":"scopeBox","id":"Horizons_B_Onderbouw"} }  // a door
{ "source":"clash-tool","sourceLocalId":"clash-114","projectKey":"horizons","modelInstanceId":"verguid-ae5e3f31",
  "uniqueId":"<same-revit-uniqueid>","zone":{"kind":"scopeBox","id":"Horizons_B_Onderbouw"} }
{ "source":"erpnext","sourceLocalId":"PO-2041","projectKey":"horizons",
  "classification":{"system":"NL-SfB","code":"32.31"},"workPackage":"WP-DOOR-B" }  // no GUID

// Joins: door↔clash on uniqueId (strong, same modelInstance); door↔PO on classification (weak, set).
// Guard: modelInstanceId must match for the model↔clash join; PO is confidence:snapshot → checked vs live model.
```

## 7. Conformance checklist for a new source

- [ ] Emits an **identity record** with `source`, `sourceLocalId`, `projectKey`, `modelInstanceId`, plus ≥1 shared key (`uniqueId` for model-derived; `classification` if it has it).
- [ ] Uses **`uniqueId` (or derived `ifcGuid`)** as the model-side key — never the stored IFC_GUID param, never raw ElementId.
- [ ] Emits a **freshness stamp** (`source`, `revisionId`, `asOf`, `confidence`).
- [ ] Emits **provenance events** for every proposal/write — append-only, `prevHash`-chained, pseudonymous actors.
- [ ] Declares its **owned domain** (what it, and only it, may write).
- [ ] Exposes tools over **MCP** (HTTP transport for the orchestrator path).
- [ ] Honours **propose → approve → execute** via its own autonomy gate.
- [ ] Surfaces **unjoined** objects explicitly (no silent drops, no inferred links).

## 8. Versioning & evolution

- Versioned (`v0`, `v0.1`, …). Sources declare the spine version they target.
- **Additive only within a major version:** new keys/edge types/event fields/enum values may be
  added; existing ones MUST NOT change meaning. Breaking changes require a major bump + migration note.
- Canonical reference shapes live here; planning docs reference this file rather than re-declaring shapes.

### Changelog
- **v0.1** (13 Jun 2026) — model-side key changed to Revit **`uniqueId`** (derive `ifcGuid` from it);
  the stored `IFC_GUID` parameter and raw `revitId`/ElementId are deprecated as cross-tool keys;
  added **`modelInstanceId`** (join must not cross document copies); made `classification` + `zone/storey`
  required-where-available on model-derived payloads. Driven by the field test above.
- **v0** — initial contract: identity record, join semantics, edge registry, freshness stamp +
  staleness guard, append-only tamper-evident provenance ledger with pseudonymous actors, MCP transport,
  conformance checklist, worked example.
