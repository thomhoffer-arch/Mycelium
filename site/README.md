# Mycelium teaser site

A zero-framework static landing page — **Mycelium-forward** (the open standard, with a "build a
connector" CTA) and a **Mycelium Studio teaser** (coming soon, no moat exposed). Two files: `index.html` +
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

## Custom domain (connectivespine.org)

`site/CNAME` already contains `connectivespine.org`, so GitHub Pages will pick
it up automatically once DNS resolves. At the domain registrar, add either set:

**Apex (`connectivespine.org`)** — four A records:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
And the AAAA records for IPv6:
```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**`www.connectivespine.org`** — one CNAME record pointing at
`thomhoffer-arch.github.io.` (trailing dot matters at most registrars).

After DNS resolves (a few minutes to a few hours), go to **Settings → Pages**,
paste `connectivespine.org` in the **Custom domain** box, save, and tick
**Enforce HTTPS** once the cert provisions (a few more minutes).

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

## Why it lives in Mycelium (not the private core)

The site promotes the **open** thing. Keeping it in the **public** Mycelium repo preserves the
public/private split — the proprietary Mycelium Studio repo stays private. (The links point at the
Mycelium spec / conformance / connectors / hub.)

## Editing

- All copy is in `index.html`; theme tokens (colours/spacing) are CSS variables at the top of
  `style.css`.
- The **Mycelium Studio** section is deliberately a **tease** — keep it intriguing, never describe
  the moat.
- Update the GitHub links if the repo path changes.

## Security

The site is static (GitHub Pages), so the threat surface is small. The measures in the repo:

- **Vendored, not CDN-loaded JS.** `marked` and `DOMPurify` live in `site/vendor/` and are
  served same-origin — no third-party CDN at runtime (no supply-chain or availability dependency,
  and it lets us run a strict CSP). To update: `npm pack <pkg>@<ver>`, extract, and replace the
  file in `site/vendor/`.
- **Sanitized Markdown.** `render-md.js` renders `REGISTRY.md` / `CHECKLIST.md` /
  `connective-spine.md` through `marked` **then `DOMPurify.sanitize()`** before touching the DOM.
  Since the registry is community-PR-editable, this stops a malicious markdown row from injecting
  script/event-handler HTML. Never re-introduce raw `innerHTML = marked.parse(...)`.
- **Strict Content-Security-Policy.** Every page carries a `<meta http-equiv>` CSP with
  `script-src 'self'`. That means **no inline scripts** — keep page JS in external `.js` files
  (`typing.js`, `render-md.js`, `init-toc.js`, `toc.js`). The only allowed inline block is the
  non-executable `application/ld+json` SEO data.

Settings that live outside the repo (do these in the GitHub/registrar UI): branch protection on
`main`, account 2FA, GitHub **Verify domain** + **Enforce HTTPS**, and registrar 2FA/lock for
`connectivespine.org`.
