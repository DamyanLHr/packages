# packages

The site for Damyan Hristov's Unity packages, served at
https://damyanlhr.github.io/packages/ (GitHub Pages serves this repository
under /packages/ next to the portfolio, DamyanLHr/damyanlhr.github.io). Every
push to `main` deploys through `.github/workflows/deploy.yml`.

Each package gets three pages:

- **Overview** (`/packages/<id>/`): from `src/catalog.ts`.
- **Guide** (`/packages/<id>/guide/`): an interactive, in-depth learning guide
  to how the package works and everything in it, with references.
  `src/content/<id>/guide.mdx`.
- **Docs** (`/packages/<id>/docs/`): installing it, setting it up, and its whole
  public API, everything a user needs. `src/content/<id>/docs.mdx`.

Read `docs/AUTHORING.md` before writing either. `/packages/kit/` (source:
`src/content/kit/kit.mdx`) shows every component working.

## Commands

```sh
npm ci            # .npmrc sets legacy-peer-deps; keep it
npm run dev       # then open http://localhost:5173/packages/
npm run lint
npm run test      # content checks: guides and docs exist, citations resolve, no dashes
npm run build     # tsc, then a build that writes an index.html per page
```

Run all three of lint, test and build before pushing; CI runs the same.

## Rules for everything on the site

- Write in Damyan's voice: first person, plain full sentences, no hype.
- No em or en dashes in prose (a test fails on them). Commas, periods, or `·`.
- Describe only what the package really does. No invented features, numbers or
  dates.
- Every claim taken from the literature gets a `<Cite>`, and every reference is
  real and checkable: authors, title, where, year, and a URL wherever one
  exists. Never invent or guess a reference.
- No NVIDIA or AMD logos or marks. Name DLSS and FSR 2 in plain text ("DLSS
  through Unity's NVIDIA module"), and never present NVIDIA or AMD as partners
  or suppliers.
- Images are the package's own renders, captures and diagrams. No screenshots
  of other products, no photos, no vendor logos.
- Look at what you change: run the dev server and check the page in light and
  dark, at phone width and desktop. The design skills in `.claude/skills/`
  (impeccable, frontend-design, web-design-guidelines, archify for diagrams)
  are there for this.

## The look, and keeping it

- The home page opens on a live sky (`src/sky/`): a real single-scattering
  atmosphere with a sun you drag. It is the one loud thing on the site;
  everything else stays quiet.
- Colours live as tokens at the top of `src/styles.css`: high-altitude paper
  by day, the night sky by night, links in the zenith's blue. **Pink
  (`--handle`) means "you can drag this"** and is used for nothing else.
- Type: Recursive (casual axis) for headings and code, Atkinson Hyperlegible
  for reading.
- Avoid the generated-page defaults: cream paper with a terracotta accent,
  all-caps eyebrow labels, middle-dot meta strings, arrows tacked onto links,
  identical cards everywhere.
- Guides should be fun to learn from: see "Making it fun to learn from" in
  `docs/AUTHORING.md`.

## Package repositories link back here

Each package's own repository README must link to this site, and to its own
pages here specifically: the overview, the guide and the docs. Use the block in
`docs/AUTHORING.md` ("The package's README"). When a package repository goes
public, set `repo` in `src/catalog.ts` so its Repository tab links to it.
