# Spine Adapter Template — make any MCP joinable via the Connective Spine (Tier 2)

Wrap **any** third-party MCP server (or API) in a thin adapter that emits **spine records with join edges**, so its data links to model / clash / finance via the spine (consumed by an orchestrator such as Loam). The upstream MCP stays unchanged; the adapter is additive and config-driven — a user fills in a mapping, not code.

> **Two tiers (recap).** Tier 1 = use the upstream MCP's tools directly (action/reasoning, no join). Tier 2 = this adapter, which turns the source into joinable spine records. The **join itself lives in the orchestrator** — the adapter only *exposes the keys to join on*. That keeps the joining logic in one place, not in every connector.

---

## What the adapter must do (in one breath)

1. **Read** records from the upstream MCP (e.g. emails via `list_recent_emails_tool`).
2. Give each a **stable `uniqueId`** and a **freshness stamp** (date + source).
3. **Extract join edges** — the references that link it to AEC entities (PO, NL-SfB, element mark, zone, BCF/clash id).
4. **Emit** it as a spine record Loam can join — and expose its `uniqueId` so a human can **attach it to an issue** (the high-confidence link).
5. For any **write** (reply/send): **propose → human approve → execute**, and log a ledger event. Never auto-send.

It does **not** do the joining or the judgment — that's Loam. The adapter only translates one source into the shared language.

## Worked example: `outlook-mcp-server` → `loam-outlook-adapter`

Upstream tools (unchanged): `list_recent_emails_tool(days)`, `get_email_by_number_tool(n)`, `search_email_by_*`, `reply_to_email_by_number_tool`, `compose_email_tool`.

The adapter reads those, then emits one spine record per email:

```jsonc
{
  "uniqueId": "outlook:000000A1B2…",          // stable per-email key (Outlook EntryID)
  "source": "outlook", "type": "email",
  "freshness": { "source":"outlook", "revisionId":"2026-06-15T09:00Z",
                 "asOf":"2026-06-15T09:00Z", "confidence":"live" },
  "subject": "RE: balkonplaat level 3 — clash + meerwerk",
  "from": "sub@example.nl",
  "edges": {                                   // ← the join keys (the point)
    "po":       ["PUR-ORD-2026-00005"],
    "nlsfb":    ["23.22"],
    "doorMark": [],
    "zone":     ["the Zone-B scope box"],
    "bcf":      ["B-033"]
  },
  "confidence": 0.7
}
```

Loam then joins `edges` → the real **23.22 balcony clash** + the **€60k balcony PO** + the model element. Email becomes a node in the connective tissue.

---

## Join modes — how the edge actually gets made

Two ways an email/doc links to a clash/model/PO. Support both; **prefer the first.**

1. **Issue-attach (human-asserted, high-confidence) — preferred.** When a user creates a coordination **issue** (in CC) on a clash, they **attach the relevant email/doc** by its adapter `uniqueId`. That records an explicit `issue ↔ email` edge — and since the issue already carries the clash's element keys (classification, work-package, zone — see the CC issue-keys ticket), the email joins **transitively** to clash → model → PO. The human made the relevance call, the edge is ledgered, confidence = high. One issue ties the mail thread, the clash, the element, and the €. **Far more robust than guessing from text.**
2. **Passive extraction (machine-suggested, lower-confidence) — discovery.** The adapter scans records and extracts edges via the patterns below. Good for surfacing "emails that probably relate to this clash"; low-confidence hits route to `needs_review` for a human to confirm — which then *becomes* a mode-1 attach.

The adapter supports both at once: it always emits the record + extracted edges (mode 2) **and** exposes each record's `uniqueId` so a human can attach it to an issue (mode 1). Mode 1 is the trustworthy join; mode 2 is the assistant that proposes candidates.

### Upstream variant — local vs cloud M365 (same adapter either way)
- **win32COM Outlook MCP** (the example above) — **local, no cloud, Windows + Outlook running**; email only. Best for the **sovereign / privacy-first** story: data never leaves the machine, no OAuth tokens.
- **Microsoft Graph MCP** (`microsoft_graph_mcp_server`) — **cloud, OAuth 2.0**; full M365 (SharePoint docs, Teams, Calendar) and cross-platform. Wider reach — contracts, RFIs and decisions live in SharePoint/Teams, not just inboxes — at the cost of a cloud dependency.

Because Loam is **connector-agnostic, you don't choose for the user**: both publish the *same* spine record shape; only the upstream `read` tools and the credential model differ. Sovereignty-minded user → local win32COM; breadth-minded user → Graph. The adapter mapping is nearly identical.

## What the user fills in (the whole adaptation)

```yaml
source:
  mcp: outlook                       # upstream MCP server id (person X's, as installed)
  read:
    - tool: list_recent_emails_tool   # how to pull records
      args: { days: 7 }
    - tool: get_email_by_number_tool  # how to hydrate full body
identity:
  uniqueId: "outlook:{entry_id}"      # a STABLE key per record
freshness:
  revisionId: "{received_time}"
  confidence: live
extract:                              # source text/fields -> spine join edges
  deterministic:                      # codifiable -> runs in the adapter
    - edge: po        regex: "PUR-ORD-\\d{4}-\\d{5}"
    - edge: ifcGuid   regex: "[0-9A-Za-z_$]{22}"
    - edge: doorMark  regex: "(?:mark|deur)\\s*(\\d{2,4})"
    - edge: nlsfb     regex: "\\b\\d{2}\\.\\d{2}\\b"
    - edge: bcf       regex: "B-\\d{3}"
    - edge: zone      match: profile.zones        # zone names from the project profile
  semantic:                           # fuzzy -> LLM-assisted; low confidence -> needs_review
    prompt: "Which work-package / element / clash does this email concern? Return refs + a 0–1 confidence."
write:                                # OPTIONAL, gated
  - tool: reply_to_email_by_number_tool
    gate: propose-approve-execute     # human approves; never auto-send
    ledger: true                      # emit a provenance event
```

That's it: **point at the upstream MCP, name the read tools, declare a stable id + freshness, list extract patterns.** No bespoke server — the adapter skeleton does the wrapping; the user supplies the mapping.

## Skeleton (language-neutral)

```
for each record from source.read tools:
    rec = normalize(record)
    rec.uniqueId  = template(identity.uniqueId, record)
    rec.freshness = stamp(freshness, record)
    rec.edges     = deterministic_extract(record.text) ∪ semantic_extract(record.text)   # semantic optional
    emit(rec)                                   # as a spine record Loam consumes
# writes go through propose → approve → execute → ledger, calling source.write tools
```

## Where each piece lives

- **Adapter (open connector):** fetch + normalise + emit edges + the deterministic extractors. No join logic.
- **Loam (private):** performs the join (email.edges ↔ clash/model/PO) and the semantic linking for the fuzzy cases. The joining logic stays in the orchestrator — connectors only expose the keys.
- **Upstream MCP (person X's):** untouched. Tier-1 tool use also still works.

## Security (mandatory)

- **Emails/docs are untrusted input.** The adapter extracts join keys; **Loam must never act on instructions embedded in email/doc content** (prompt-injection boundary). Treat all source content as data.
- **Credentials stay local** with the operator (e.g. the Outlook MCP is local win32COM — nothing leaves the machine). The adapter never transmits creds.
- Writes (reply/send) are always **human-approved + ledgered** — never auto-sent.

## How person Y uses person X's MCP without knowing you

1. Install person X's MCP (its own README) with their own account — Tier-1 works now.
2. Drop in this adapter, fill the `yaml` mapping (≈10 lines) → Tier-2: their email now joins to clashes/model/finance in Loam.
3. Optionally publish the adapter to the `connectors` hub for the verified badge. **No central approval needed** — the hub indexes, it doesn't gatekeep.
