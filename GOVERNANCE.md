# Governance

Mycelium is an **open standard**, stewarded in the open so anyone — including commercial vendors
and competitors — can adopt it with confidence.

## Principles
- **Neutral & permissive.** Apache-2.0; no single vendor controls who may implement it.
- **Additive by default.** The spine evolves without breaking conformant connectors (see `CONTRIBUTING.md`).
- **Conformance over allegiance.** A connector belongs in the hub if it conforms to the spec — not
  by whose product it serves.

## How changes are made (v0.x stage)
1. Open an issue/proposal describing the change and the use case it unblocks.
2. **Additive** changes (new optional keys, edge types, examples) → minor version, lightweight review.
3. **Breaking** changes (removing/renaming a MUST key, changing a shape or join semantics) → major
   version + a documented migration; high bar, broad discussion.
4. Maintainers merge once there's rough consensus and the conformance kit still passes.

## Maintainers
Bootstrapped by the founding maintainer (Mycelium contributors). As adoption grows, governance
moves toward a small, multi-party steering group (vendors + implementers) — the goal is a standard
no single party can capture.

## Trademark
The Apache-2.0 license covers the code/spec, **not** the "Mycelium" name or logo. Use of the name
to describe conformance ("a Mycelium connector") is welcome; use that implies endorsement is not.
