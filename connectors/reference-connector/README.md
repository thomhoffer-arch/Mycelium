# reference-connector — `mycelium-connector-reference`

The smallest **working** Mycelium connector: it maps a dummy source's rows to **spine records**
(identity + freshness), self-certifies them with `conformance/validate.mjs`, and prints them.

```bash
node connectors/reference-connector/connector.mjs
```

**To build your own:** copy this folder, swap `fetchSource()` for your real MCP/REST call, keep the
`toIdentity()` / `freshness()` shapes, and add a provenance event on any write. Declare the spine
version you target (`v0.1`) and register in `hub/REGISTRY.md`. Never hardcode credentials — read
them from the environment.

**Targets:** Connective Spine `v0.1`.
