# Devang Padhiyar Portfolio

Jekyll site on GitHub Pages. **No theme** — all layouts, includes, CSS and JS are hand-written.

## Tech
- Jekyll 3.10 via the `github-pages` gem (no `remote_theme`)
- One stylesheet (`assets/css/style.scss`), one script (`assets/js/site.js`, zero dependencies)
- Homepage is a "film": one idea per full-screen scene (`[data-scene]`, content from `scenes:` in
  `_data/metrics.yml`). `site.js initFilm()` pins/cross-fades scenes (`--vis`), runs the horizontal work
  reel, and publishes `window.devFilm.t`. `.film-on` is set in the head script (prevents CLS).
  `assets/js/scene.js` is the 3D clapperboard (three@0.170.0 via the import map in `head.html`), lazy-loaded
  after `load` + idle, only with WebGL2, no reduced motion, no Save-Data. Lenis smooth scroll on fine
  pointers only. Without JS / with reduced motion everything is plain stacked, fully visible blocks.
- `assets/Devang_Padhiyar_Resume.pdf` (and legacy `resume.pdf`) is generated: `_resume/build.py` writes a public cut (no phone, no Simplified user
  count). Don't hand-replace it.
- Palette: **Ayu Dark** (gold `#e6b450`) with an Ayu-Light variant. Type: **JetBrains Mono**, single family.

## Development
```bash
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"   # system ruby 2.6 is too old
bundle exec jekyll serve                          # builds in <1s
```

## Hard constraints — read before editing
- **libsass 1.5.2.** No `@use` / `@forward` / `math.div`. Any `clamp()` containing arithmetic
  must be written `#{"clamp(...)"}` inside a declaration; inside a custom property it is raw text
  and needs no escaping. Getting this wrong fails the build with "Incompatible units".
- **GitHub Pages plugin whitelist.** Only `jemoji`, `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-feed`.
  Build-time diagram generators (kroki, mermaid-prebuild) cannot run — diagrams are hand-authored
  inline SVG in `_includes/diagrams/`.
- **`_includes/head.html` strips seo-tag's JSON-LD** and keeps its meta tags. Our `_includes/schema.html`
  is authoritative (`SoftwareSourceCode` / `CreativeWork` / `BlogPosting` per layout). Don't re-add
  a second `og:type`, `twitter:card` or `og:image` — seo-tag already emits them.
- **Reduced motion is three-layered.** Reveal-hidden state requires *both* `.js` (set by the inline
  head script) *and* `prefers-reduced-motion: no-preference`. Never write a rule that hides content
  without both gates — no JS must mean fully visible.
- **Diagram colours come from `--diag-*` tokens or `currentColor`.** A literal hex breaks one theme
  silently. The theme switch is `data-theme`, not `prefers-color-scheme`.

## Content rules
- **Every metric needs a `source` in `_data/metrics.yml`.** A figure with no source does not render.
  Never invent performance numbers.
- **Title is "Founding Engineer"** for Scenes AI — never "co-founder"/"founder" (not decided).
- Client work is labelled `Client project · via <agency>`: Monica + Andy → Aubergine;
  LocalCoinSwap + Progressay → Nividata. Simplified and Scenes AI are not client work.
- Progressay: cert was renewed 2026-08-23 and the site is live — linking is fine. Re-check if it lapses again.
- Don't cite Simplified user counts (circulating figures contradict each other and aren't sourced).

## Structure
```
_data/         nav, skills (tiered), timeline, opensource, metrics
_includes/     head, schema, navbar, footer, social, hero, skills, timeline,
               sections/*, diagrams/*  (hand-authored SVG)
_layouts/      default, page, post, project
_projects/     keep the "(N) " filename prefix — it is baked into live URLs
pages/         index, about, projects, blog, tags, 404
```

## Deploy
Push to `main`; GitHub Pages builds automatically.
