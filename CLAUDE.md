# packages

The site for Damyan Hristov's Unity packages, served at
https://damyanlhr.github.io/packages/ (GitHub Pages serves this repository
under /packages/ next to the portfolio, DamyanLHr/damyanlhr.github.io). Every
push to `main` deploys through `.github/workflows/deploy.yml`. GitHub does not
always start it for a push, so `.github/workflows/deploy-watch.yml` checks every
ten minutes and starts it for any commit on main that has no Deploy run yet.

Each package gets three pages:

- **Overview** (`/packages/<id>/`): the package's showcase, a full-width page
  of its own pictures, one section per thing it does. From `src/catalog.ts`.
- **Guide** (`/packages/<id>/guide/`): an in-depth technical article on the
  package's whole technical structure, part by part, with references.
  `src/content/<id>/guide.mdx`.
- **Docs** (`/packages/<id>/docs/`): installing it, setting it up, and its whole
  public API, everything a user needs. `src/content/<id>/docs.mdx`.

Read `docs/AUTHORING.md` before writing either. `/packages/kit/` (source:
`src/content/kit/kit.mdx`) shows every component working.

When a package is created, the layout must be updated too: the home page
mosaic (`src/layout.ts`) and the "More packages" row on each package page are
sized for the packages there are. Follow "Add a package" in
`docs/AUTHORING.md`; a test fails until the mosaic fits.

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
- No AI slop: no puffery, no filler words, no set-piece sentences. See
  "Writing without AI slop" in `docs/AUTHORING.md`; run `/no-ai-slop` in
  detect mode on every page you write. A test fails on the worst words.
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

- The site wears the portfolio's julia look (DamyanLHr/damyanlhr.github.io,
  `src/themes/julia/julia.css`): near-black, one ember accent at measured
  strengths, Space Grotesk, IBM Plex Mono for data, a fine grain, containers
  at one radius (8px) and anything you press as a pill. The tokens are at the
  top of `src/styles.css`; change them there, not per component.
- Every picture on the site is the package's own: renders, captures, clips.
  Where one is still to come, its slot shows a viewfinder placeholder with its
  caption. See "Screenshots and showcases" in `docs/AUTHORING.md`.
- **Deep orange with a dotted line means "you can drag this"** (`--handle`),
  in the text and in figures, and nothing else uses it that way.
- Avoid the generated-page defaults: all-caps eyebrow labels on every heading,
  identical cards with soft shadows, gradient washes as decoration, arrows
  tacked onto links.
- Guides are in-depth technical articles that explain each package's whole
  technical structure, in a fixed order of sections, without quizzes: see
  "The guide" in `docs/AUTHORING.md`.

## Package repositories link back here

Each package's own repository README must link to this site, and to its own
pages here specifically: the overview, the guide and the docs. Use the block in
`docs/AUTHORING.md` ("The package's README"). When a package repository goes
public, set `repo` in `src/catalog.ts` so its Repository tab links to it.
