# Mycelium hub — connector registry

The index of conformant connectors. The hub **links** connectors; each lives in **its own repo**
(independent stack/cadence/license). To add one: implement a contract, pass the conformance kit,
open a PR adding a row here.

**Maturity:** 🧪 experimental · 🟡 community (works, unverified) · ✅ verified (conformance kit +
tested against a real model/project).

## Model sources (implement [`spec/model-source-contract.md`](../spec/model-source-contract.md))

| Connector | Tool | Contract | Status | Repo |
|---|---|---|---|---|
| **mycelium-connector-revit** | Autodesk Revit | model-source v0.1 | 🧪 | [`thomhoffer-arch/mycelium-connector-revit`](https://github.com/thomhoffer-arch/mycelium-connector-revit) |
| mycelium-archicad-connector | Graphisoft ArchiCAD | model-source v0.2 *(wanted)* | — | *unclaimed — build it* |
| mycelium-rhino-connector | McNeel Rhino | model-source v0.2 *(wanted)* | — | *unclaimed — build it* |
| pdra | Revit (commercial superset) | model-source v0.1 | commercial | `thomhoffer-arch/PDRA` |

## Other sources (implement [`spec/connective-spine.md`](../spec/connective-spine.md) via the spine adapter)

| Connector | Source | Join key | Status | Repo |
|---|---|---|---|---|
| mycelium-connector-clashcontrol | ClashControl (clash detection) | `ifcGuid` / `uniqueId` / `zone` | 🧪 | [`thomhoffer-arch/clashcontrol`](https://github.com/thomhoffer-arch/clashcontrol) |
| mycelium-connector-reference | (in-repo example) | n/a | 🧪 | [`/connectors/reference-connector`](https://github.com/thomhoffer-arch/Mycelium/tree/main/connectors/reference-connector) |
| mycelium-connector-email | Outlook/IMAP | `po` / `nlsfb` / `bcf` / `zone` | 🧪 | [`/connectors/example-email`](https://github.com/thomhoffer-arch/Mycelium/tree/main/connectors/example-email) |
| mycelium-connector-erpnext | ERPNext | `classification` / `workPackage` | 🧪 | [`/connectors/example-erpnext`](https://github.com/thomhoffer-arch/Mycelium/tree/main/connectors/example-erpnext) |
| mycelium-connector-bcf | BCF | `ifcGuid` / `zone` | 🧪 | [`/connectors/example-bcf`](https://github.com/thomhoffer-arch/Mycelium/tree/main/connectors/example-bcf) |
| openaec | OpenAEC Studio (IFCX/BCF) | `ifcGuid` | 🧪 | *draft* |
| dalux | Dalux Field/Build issues | `ifcGuid` | 🧪 | *draft* |
| forma | Autodesk Forma (early design) | `zone` / `classification` | 🧪 | *draft (US SaaS — onramp only)* |

> Connectors touch live models and project data — the **verified** badge (conformance kit + real
> project) is the trust signal. Prefer verified for production.
