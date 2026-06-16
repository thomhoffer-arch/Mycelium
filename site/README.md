# Mycelium teaser site

A zero-framework static landing page — **Mycelium-forward** (the open standard, with a "build a
connector" CTA) and a **Loam teaser** (coming soon, no moat exposed). Two files: `index.html` +
`style.css`. No build step.

## Deploy (Vercel)

It's plain static HTML, so any host works. On Vercel:

1. Put this `site/` at the repo root of **Mycelium** (public) — e.g. `Mycelium/site/`.
2. New Vercel project → import the Mycelium repo → set **Root Directory = `site`** → Framework
   preset **Other** (no build command, output = the directory). Deploy.

Or locally: `npx serve site` (or open `index.html`).

## Why it lives in Mycelium (not Loam)

The site promotes the **open** thing. Keeping it in the **public** Mycelium repo preserves the
public/private split — the proprietary Loam repo stays private. (The links point at the Mycelium
spec / conformance / connectors / hub.)

## Editing

- All copy is in `index.html`; theme tokens (colours/spacing) are CSS variables at the top of
  `style.css`.
- The Loam section is deliberately a **tease** — keep it intriguing, never describe the moat.
- Update the GitHub links if the repo path changes.
