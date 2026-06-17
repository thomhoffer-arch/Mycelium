# mycelium-sdk

The Connective Spine v0.1 SDK — zero runtime deps, Node ≥ 18.

Implements the spine contract: identity, freshness, provenance, IFC GUID derivation, and the model-source tool list. Any connector that imports this package and passes `checkConformance()` is wire-compatible with any orchestrator that speaks the spine.

## Install

```sh
npm install mycelium-sdk
```

## Naming your connector

External connector packages follow the `mycelium-for-<tool>` convention:

| Tool | Package name |
|---|---|
| Revit | `mycelium-for-revit` |
| ArchiCAD | `mycelium-for-archicad` |
| Rhino | `mycelium-for-rhino` |
| ERPNext | `mycelium-for-erpnext` |
| Outlook | `mycelium-for-outlook` |

Register your connector in [hub/REGISTRY.md](https://github.com/thomhoffer-arch/Mycelium/blob/main/hub/REGISTRY.md).

## Spine-source connector

Emit `{ identity, freshness }` records that any orchestrator can join.

```js
import { runAdapter, checkConformance } from 'mycelium-sdk';

const config = {
  source: 'erpnext',
  identity: {
    uniqueId: 'erpnext:{name}',
    projectKey: '{project}',
    localIdField: 'name',
  },
  freshness: { revisionId: '{modified}', asOf: '{modified}', confidence: 'snapshot' },
};

const result = await runAdapter(config, { fetchSource });
// result.conformant === true → your records are spine-compatible
```

### Identity fields

| Field | Role |
|---|---|
| `source` | tool slug — required |
| `sourceLocalId` | stable id within the tool |
| `projectKey` | project scope |
| `ifcGuid` | cross-tool join key (IFC GlobalId) |
| `uniqueId` | in-tool stable id |
| `classification` | NL-SfB / Uniclass / OmniClass |
| `workPackage` | WBS reference |
| `costCode` | finance join key |
| `zone` | spatial region |

### Freshness stamp

```js
import { stamp } from 'mycelium-sdk';

const freshness = stamp({
  source: 'erpnext',
  revisionId: 'r/58',
  confidence: 'live', // 'live' | 'snapshot' | 'derived'
});
```

### Provenance ledger

```js
import { append, verifyChain } from 'mycelium-sdk';

append('ledger.jsonl', {
  source: 'erpnext',
  action: 'cost-update',
  result: 'proposed',   // 'proposed'|'approved'|'executed'|'rejected'|'failed'|'triaged'
  actor: 'human:alice',
  projectKey: 'horizons',
  targetKeys: ['PO-2042'],
});

const { ok, count, errors } = verifyChain('ledger.jsonl');
```

The ledger is append-only JSONL, hash-chained with SHA-256 over canonical key order. On-disk format is identical to `orchestrator/src/core/ledger.js` in the private Loam repo — they verify against each other.

### Revit UniqueId → IFC GlobalId

```js
import { deriveIfcGuid } from 'mycelium-sdk';

const ifcGuid = deriveIfcGuid('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee-00000042');
// '2S0$N3Qg5FPvBV...' (22-char IFC base64)
```

## Model-source connector

A model source exposes raw BIM data over MCP. The orchestrator builds spine records from those; your connector just translates the authoring tool.

```js
import { checkModelSourceConformance, MODEL_SOURCE_TOOLS } from 'mycelium-sdk/model-source';

// Verify your MCP server exposes all five required tools:
const toolNames = await mcpServer.listTools();
const { conformant, missing } = checkModelSourceConformance(toolNames);
```

Required tools (exact wire names): `get_model_revision`, `filter_elements_by_region`, `get_element_by_ifcguid`, `get_element_by_native_id`, `get_door_rooms`.

See [spec/model-source-contract.md](https://github.com/thomhoffer-arch/Mycelium/blob/main/spec/model-source-contract.md) for full request/response shapes.

## License

Apache-2.0 · [connectivespine.org](https://connectivespine.org)
