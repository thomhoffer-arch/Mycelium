# Security Policy

Mycelium is a **spec + connectors**; it carries no secrets and stores no data itself. Still:

- **Connectors must never commit credentials.** Read tokens/keys from the environment or a local
  secrets store; never hardcode them. The reference connector follows this.
- **The spine carries pseudonymous actors** (`human:…` / `agent:…`) by design — never raw PII in a
  provenance event.

## Reporting a vulnerability
Please use **GitHub private security advisories** to report a vulnerability — open one at
<https://github.com/thomhoffer-arch/Mycelium/security/advisories/new> rather than filing a public issue.
We aim to acknowledge within a few working days and coordinate a fix + disclosure.
