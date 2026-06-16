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

## Deploy (GitHub Pages, free)

A workflow at `.github/workflows/pages.yml` publishes `site/` on every push to
`main`. To enable it: **Settings → Pages → Source: GitHub Actions**. The site
will then be live at `https://thomhoffer-arch.github.io/Mycelium/`. No build
step, no card.

## Deploy (Codeberg Pages, EU-sovereign, free)

Codeberg is a non-profit, Berlin-based Git host. Codeberg Pages serves any
repo's `pages` branch as a static site under `*.codeberg.page`.

1. Sign up at <https://codeberg.org>.
2. Mirror this repo to Codeberg (Codeberg → New Migration → paste the GitHub
   URL). Or push it as a new repo named `mycelium`.
3. Push the contents of **`site/`** to a branch called `pages` in that repo:
   ```bash
   git checkout --orphan pages
   git rm -rf .
   cp -R ../Mycelium/site/. .
   git add . && git commit -m "pages" && git push origin pages
   ```
4. The site is then live at `https://mycelium.<your-user>.codeberg.page`.

Optional mirror automation: enable Codeberg's pull-mirror to track the GitHub
`main`, then a Codeberg Action / cron can copy `site/` → `pages` branch on
update. Codeberg's free tier covers a teaser comfortably.

## Why it lives in Mycelium (not Loam)

The site promotes the **open** thing. Keeping it in the **public** Mycelium repo preserves the
public/private split — the proprietary Loam repo stays private. (The links point at the Mycelium
spec / conformance / connectors / hub.)

## Editing

- All copy is in `index.html`; theme tokens (colours/spacing) are CSS variables at the top of
  `style.css`.
- The Loam section is deliberately a **tease** — keep it intriguing, never describe the moat.
- Update the GitHub links if the repo path changes.
