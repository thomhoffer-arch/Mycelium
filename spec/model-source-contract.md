# Model-source contract (v0.1)

> The interface a **BIM/CAD model source** exposes over MCP so any orchestrator can drive it. One
> contract, many implementations: `mycelium-revit-connector` today; `mycelium-archicad-connector` /
> `mycelium-rhino-connector` next. The orchestrator binds *this*, never a vendor.

## Role boundary

A model source **exposes raw model data over MCP tools — nothing more.** It does **NOT** build spine
records (identity/freshness/provenance) or run a provenance ledger — the **orchestrator** does that
from the raw fields. It only translates the authoring tool ↔ the tool shapes below.

## Transport

MCP over **Streamable HTTP**, JSON-RPC (`initialize` → `tools/call`); tool output is a JSON string in
`result.content[0].text`. Optional bearer auth. Local-first (the connector runs on the same machine
as the authoring tool).

## Identity (the join keys)

| Key | Role | Source examples |
|---|---|---|
| **`ifcGuid`** | **the universal cross-tool join key** — every BIM tool can emit IFC GlobalIds | Revit IfcGUID · ArchiCAD IFC ID · Rhino/IFC export |
| `native_id` | the tool's own stable id (volatile across tools) | Revit `uniqueId` · ArchiCAD GUID · Rhino object id |
| `id` (numeric) | volatile element id, needed by element-level calls | Revit ElementId |

`ifcGuid` is primary for joining **across** tools; `native_id` is the in-tool stable id. (v0.1 names
the Revit fields; see *Generalisation* below.)

## The five tools (wire names exact, snake_case)

1. `get_model_revision` → `{ version_guid, number_of_saves, has_unsaved_changes }`
2. `filter_elements_by_region` → `{ count_in, elements:[{ ifc_guid, native_id, id, category, in_region, level_name, … }] }`
3. `get_element_by_ifcguid` → `{ elements:[{ ifc_guid, found, classification:{assembly_code,…}, … }] }`
4. `get_element_by_native_id` → same element shape, keyed on the tool's native id
5. `get_door_rooms` → `{ doors:[{ ifc_guid, native_id, type_name, <width_param>, from_room:{function,name}, to_room }] }`

Field semantics, classification (`classification.assembly_code`), the width/room conventions and the
full request/response shapes are the same as the reference implementation —
see `mycelium-revit-connector`'s `docs/CONTRACT.md`.

## v0.1 → v0.2 (the generalisation roadmap)

**v0.1 is Revit-shaped** for the first implementation: `filter_elements_by_scope_box` (Revit Scope
Box), `OST_*` categories, `uniqueId`. v0.2 generalises to any BIM/CAD source:

- **scope box → `region`** — a neutral selection/region concept (scope box · saved selection · layer
  · IFC spatial zone).
- **`OST_*` → IFC categories** (`IfcDoor`, `IfcWall`, …) as the portable category vocabulary.
- **`uniqueId` → `native_id`** with **`ifcGuid` as the primary cross-tool key** (already above).

The orchestrator and the reference connector move to v0.2 together (additive → minor bump); v0.1
connectors keep working.

## Conformance

A connector is conformant when it (1) exposes the five tools with the exact wire names + response
shapes, (2) emits `ifcGuid` on every element, (3) carries no orchestrator logic. Register it in
`hub/REGISTRY.md`.
