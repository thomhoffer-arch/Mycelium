# Mycelium hub — connector registry

The index of conformant connectors. The hub **links** connectors; each lives in **its own repo**
(independent stack/cadence/license). To add one: implement a contract, pass the conformance kit,
open a PR adding a row here.

**Maturity:** 🧪 experimental · 🟡 community (works, unverified) · ✅ verified (conformance kit +
tested against a real model/project).

## Model sources (implement [`spec/model-source-contract.md`](../spec/model-source-contract.md))

| Connector | Tool | Contract | Status | Repo |
|---|---|---|---|---|
| **mycelium-for-revit** | Autodesk Revit | model-source v0.1 | 🧪 | [`thomhoffer-arch/mycelium-for-revit`](https://github.com/thomhoffer-arch/mycelium-for-revit) |
| mycelium-for-archicad | Graphisoft ArchiCAD | model-source v0.2 *(wanted)* | — | *unclaimed — build it* |
| mycelium-for-rhino | McNeel Rhino | model-source v0.2 *(wanted)* | — | *unclaimed — build it* |

## Other sources (implement [`spec/connective-spine.md`](../spec/connective-spine.md) via the spine adapter)

| Connector | Source | Join key | Status | Repo |
|---|---|---|---|---|
| mycelium-for-reference | (in-repo example) | n/a | 🧪 | [`/connectors/reference-connector`](https://github.com/thomhoffer-arch/Mycelium/tree/main/connectors/reference-connector) |
| mycelium-for-email | Outlook/IMAP | `po` / `nlsfb` / `bcf` / `zone` | 🧪 | [`/connectors/example-email`](https://github.com/thomhoffer-arch/Mycelium/tree/main/connectors/example-email) |
| mycelium-for-erpnext | ERPNext | `classification` / `workPackage` | 🧪 | [`/connectors/example-erpnext`](https://github.com/thomhoffer-arch/Mycelium/tree/main/connectors/example-erpnext) |
| mycelium-for-bcf | BCF (exported `.bcfzip` files) | `ifcGuid` / `zone` | 🧪 | [`/connectors/example-bcf`](https://github.com/thomhoffer-arch/Mycelium/tree/main/connectors/example-bcf) |
| mycelium-for-solibri | Solibri issues (`/bcfxml`) + checking/QA results (local REST) | `ifcGuid` / `zone` | 🧪 | [`thomhoffer-arch/Mycelium-for-Solibri`](https://github.com/thomhoffer-arch/Mycelium-for-Solibri) |
| mycelium-for-navisworks | Navisworks Clash Detective (.NET add-in) | `ifcGuid` / `classification` / `zone` | 🧪 | [`thomhoffer-arch/Mycelium-for-Navisworks`](https://github.com/thomhoffer-arch/Mycelium-for-Navisworks) |
| mycelium-for-openaec | OpenAEC Studio (IFCX/BCF) | `ifcGuid` | 🧪 | [`thomhoffer-arch/Mycelium-for-OpenAEC`](https://github.com/thomhoffer-arch/Mycelium-for-OpenAEC) |
| mycelium-for-dalux | Dalux Field/Build issues (live BCF-API/REST) | `ifcGuid` | 🧪 | [`thomhoffer-arch/Mycelium-for-Dalux`](https://github.com/thomhoffer-arch/Mycelium-for-Dalux) |
| mycelium-for-forma | Autodesk Forma (early design) | `zone` / `classification` | 🧪 | [`thomhoffer-arch/Mycelium-for-Forma`](https://github.com/thomhoffer-arch/Mycelium-for-Forma) |
| mycelium-for-qonic | Qonic | `ifcGuid` / `classification` | 🧪 | [`thomhoffer-arch/Mycelium-for-Qonic`](https://github.com/thomhoffer-arch/Mycelium-for-Qonic) |
| mycelium-for-bim2rdt | BIM2RDT (robot-ready site digital twins) | `ifcGuid` / `zone` / `workPackage` | 🧪 | [`thomhoffer-arch/Mycelium-for-BIM2RDT`](https://github.com/thomhoffer-arch/Mycelium-for-BIM2RDT) |

> Connectors touch live models and project data — the **verified** badge (conformance kit + real
> project) is the trust signal. Prefer verified for production.

> **BCF-speaking connectors** (Dalux, Solibri, BIMcollab) are each a complete,
> standalone package — install only the one you use. They share no library;
> instead they **vendor** the canonical BCF topic→spine mapping
> ([`packages/bcf-api`](../packages/bcf-api/bcf-api.mjs)), the same way every
> connector vendors `mycelium-sdk.mjs`. There is intentionally no generic
> "BCF-API" connector.
