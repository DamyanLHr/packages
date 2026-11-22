# Writing a package's pages

Every package has an overview, a guide and docs. This is how to add a package
and write its pages. `/packages/kit/` (run `npm run dev`, then open
http://localhost:5173/packages/kit/) shows every component below, working; its
source is `src/content/kit/kit.mdx`.

## Add a package

1. Add an entry to `src/catalog.ts`: `id` (its address, `/packages/<id>/`),
   `name`, `unityName` once it has one (`com.damyanlhr.<…>`), a one or two
   sentence `summary`, `status`, `expected` while it is in progress, and
   `portfolio` (its slug on the portfolio).
2. Give it its details: `compat`, `limitations`, `integrations`, `releases`
   and `roadmap`. See "The details sheet" below.
3. Give it its pictures: a `hero`, and `features`, one section per thing it
   does, each with its shots. See "Screenshots and showcases" below.
4. Create `src/content/<id>/guide.mdx`. Its docs go in
   `src/content/<id>/docs/`, a page at a time; see "The docs".
5. **Update the layout.** The layouts are sized for the packages there are, so
   a new one changes them:
   - the home page mosaic: give the package its width in `src/layout.ts`
     (one or two of the four columns) and adjust the others so every row is
     full. Look at the home page at desktop, tablet and phone width.
   - the "More packages" row at the end of each package page
     (`.more-row` in `src/styles.css`): it shows every other package in one
     row of four, so with one more package it needs five columns, or two rows
     that fill.
   - the home page's showcase is the first package in the catalog; decide
     whether the new one goes first.
   - its portfolio project page links here, and the portfolio's own package
     list may need the same care.
6. `npm run test` checks the guide exists, the entry is complete, every
   package has a width in the mosaic and the mosaic's rows are full.

## The details sheet

Every package page ends on a sheet of facts, printed from `src/catalog.ts`.
The packages are sold on the Unity Asset Store, and people decide from this
sheet, so it holds only what is true of the package today. **Never guess.**
A fact that is not settled is left out or marked `'unknown'`, and the site
prints "to be confirmed".

```ts
store: 'https://assetstore.unity.com/packages/...', // once it is on sale
repo: 'https://github.com/DamyanLHr/sky',           // public: README, changelog, issue tracker
version: '1.0.0',
price: '€45',
licence: 'Unity Asset Store EULA, one seat per user',
compat: compat({
  'Unity version': ['yes', 'Unity 6.0 and later'],
  URP: 'yes',
  HDRP: 'planned',
  'Built-in': 'no',
  Windows: 'yes',
  Web: ['no', 'needs compute shaders'],
}),
limitations: ['Clouds do not render into reflection probes.'],
integrations: [{ with: 'Upscalers', id: 'upscalers', text: 'The sky fills the reactive mask.' }],
releases: [{ version: '1.0.0', date: '2027-05-12', notes: ['First release.'] }],
roadmap: ['HDRP support.'],
trailer: { title: 'Trailer', src: 'media/sky/trailer.mp4', poster: 'media/sky/trailer.webp' },
demo: { url: 'https://...', platform: 'Windows, 64-bit', note: '310 MB.' },
```

- **Compatibility** has the same rows for every package (`compat()` in the
  catalog lists them), so packages can be compared. Each row is `'yes'`,
  `'planned'`, `'no'` or left out, with an optional note for a version or a
  condition. Say `'no'` where it is no: what a package does not support is
  the most useful line on the sheet.
- **Limitations** are what the package cannot do or does badly, one plain
  sentence each. Every package has some. Write them before someone finds
  them.
- **Releases** go newest first, with the date as `YYYY-MM-DD`. `version` is
  the newest release's.
- **Support** is the issue tracker of the package's public repository
  (`repo`). The source itself is sold on the Asset Store and is not in that
  repository.
- A **released** package must have all of it: store link, repository,
  version, price, licence, every compatibility row settled and at least one
  limitation. A test fails otherwise.

## Screenshots and showcases

A package's overview page is its showcase: a full-width hero with its name
over it, then one section per thing the package does, each with its own
pictures, then the ways in to the guide and docs. Its card on the home page
shows a cover. They are all the package's own renders, captures and clips, set
in `src/catalog.ts`:

```ts
hero: { title: 'Volumetric Sky in a scene', src: 'media/sky/hero.mp4', poster: 'media/sky/hero.webp' },
cover: { title: 'Clouds at dusk', src: 'media/sky/cover.webp', alt: 'Clouds lit from below at dusk' },
features: [
  {
    title: 'Volumetric clouds',
    text: 'Clouds you can look at from below, from the side and against the light.',
    shots: [
      { title: 'From the ground', src: 'media/sky/clouds-ground.webp', alt: 'Cumulus seen from below at noon' },
      { title: 'Against the sun' },
    ],
  },
  {
    title: 'Quality tiers',
    compare: {
      title: 'The lowest tier and the highest',
      a: { title: 'Lowest tier', src: 'media/sky/tier-low.webp', alt: 'The view at the lowest tier' },
      b: { title: 'Highest tier', src: 'media/sky/tier-high.webp', alt: 'The same view at the highest tier' },
    },
    shots: [{ title: 'Every tier, side by side' }],
  },
],
```

- Files go in `public/media/<id>/`. Images as `.webp` (or `.png`, `.jpg`,
  `.avif`), clips as `.mp4` or `.webm`, muted, short and looping, with a
  `poster` still. A clip plays by itself unless the reader asked for less
  motion.
- A shot without `src` is a slot: it shows a viewfinder frame with its caption
  and "to come" until the file exists, so the page keeps its shape. Name each
  slot after what it will show, from what the package really has, and rename
  or remove slots freely once you know what you have.
- A section lays out its pictures by how many it has: one shows wide; two
  side by side, the first larger; three as one large beside two stacked (the
  large one swaps sides from one such section to the next); four or more as one
  wide over a row. The first picture leads, so put the best one first.
- A `compare` is two captures of the exact same view, shown one over the
  other with a line the reader drags between them: a setting off and on, a low
  tier and a high one, native and upscaled. It leads its section. Capture both
  from the same camera at the same size.
- Every finished image opens full size, and the viewer steps through all of
  the page's images with the arrow keys.
- Images need `alt`; the tests check that, that every file named exists, and
  that no two pictures on a page share a caption.
- Sizes: the hero fills the screen and is cropped to it, so keep the subject
  in the middle and right of the frame (the name sits over the lower left), and
  export it at least 2560 px wide. Section pictures are cropped to 21:9 or
  16:9 depending on where they fall; export them at 1920 by 1080 or larger and
  keep the subject away from the lower left edge, where the caption sits.
- The first package in the catalog is the home page's showcase.
- Every package ends on an "In the editor" section (the `inTheEditor` helper
  in the catalog): the inspector, and the package set up in a scene.

## The guide

The guide is an in-depth technical article on the package. Whoever reads it
to the end should understand the package's whole technical structure, every
part and how the parts connect, well enough to build it, extend it or debug
it. Write it like a chapter of a graphics programming book or a long article
in a technical journal: structured, precise and sourced. No quizzes, no games,
no "fun" framing, no hand-holding.

### Structure

Every guide has these sections, in this order. Rename a heading to fit the
package, but keep the order and leave none out.

1. **Overview.** What the package does, in one or two paragraphs, with the
   result as a render of the package's own. The problem it solves and the
   constraints it was built under: render pipelines, frame budget, platforms,
   Unity versions. What the reader needs to know already. Then a notation
   `<Table>`: every symbol the guide uses, its meaning and its unit.
2. **Architecture.** The whole structure before any detail. The components
   (runtime classes, renderer features and passes, compute and shader stages,
   assets and settings), what each one owns, and how data moves between them
   over a frame. Draw two diagrams with archify: the components and how they
   depend on each other, and the frame, showing which passes run in what
   order and what each one reads and writes (render targets and buffers, with
   their formats and resolutions).
3. **One section per subsystem**, in the order data flows through the frame.
   Each one covers, where they apply, in this order:
   - **The model**: what it computes and the theory behind it, with the maths
     in numbered `<Equation>`s.
   - **The algorithm**: step by step. A long derivation goes in a `<Reveal>`.
   - **The implementation**: the real classes, passes, shaders and data
     layouts, with short excerpts of the package's own code as `<Listing>`s,
     and a `<PassTable>` for each render pass.
   - **Parameters**: every setting in a `<Table>` with the fixed columns
     Setting, Type, Range, Default, On screen, Cost.
   - **Cost**: GPU time and memory, measured, in a `<Perf>` table.
   - **Validation**: how I know it is right. A comparison against a reference
     (the cited paper's result, a path-traced or brute-force version, a
     higher tier) as a `<Compare>` or an error plot, with what differs and why.
   - **Limitations**: the trade-offs taken, what it gets wrong, and what was
     tried and dropped, with the reason.
4. **Integration.** How the subsystems connect to each other and to the other
   packages (the sky filling the upscalers' reactive mask, for example), the
   execution order inside the render pipeline, and the extension points.
5. **Performance.** The budget for the whole frame as a `<Perf>` matrix (GPU
   by resolution by quality tier), memory split into what persists and what
   is transient, and how to profile the package yourself.
6. **Debugging.** The diagnostics, what each view shows, and the usual
   failures by symptom, with their causes and fixes.
7. **References.** Printed at the end by themselves, followed by the guide's
   revisions, where to report a mistake, and how to cite it (the page adds
   those from `meta`).

A test holds a written guide to this: it opens on its overview, has
architecture, integration, performance and debugging sections, cites its
sources, says what version it applies to, and has at least one `<PassTable>`
and one `<Perf>`.

### Version, date and revisions

Every guide and docs page says what it applies to, at the top of its MDX file:

```mdx
export const meta = {
  version: '1.0.0', // the package version the text describes
  unity: 'Unity 6.0, URP 17', // what it was written against
  updated: '2027-05-12', // the day the text last changed
  revisions: [{ date: '2027-05-12', note: 'Rewrote the cloud lighting section for 1.0.' }],
}
```

The page prints the first three under its title, and a guide prints the
revisions at its end. Add a revision whenever the text changes in substance,
newest first. When the package changes, update the text and the `version`
together: a guide that describes an old version is worse than none.

### Numbers and cross-references

Sections, figures, equations, tables and listings are numbered by the page.
Give one an `id` and refer to it with `<Ref to="id" />`, which prints "Figure
2", "Equation 5", "Table 1", "Listing 3" or "Section 4.2" and links there.
Refer by `<Ref>`, never by "the figure above": the text gets rearranged and
"above" stops being true.

```mdx
<Equation id="beer-lambert">

$$
T(d) = e^{-\sigma d}
$$

</Equation>

By <Ref to="beer-lambert" />, doubling the distance squares the transmittance.
See <Ref to="clouds" /> for how the clouds use it.
```

A section's id is its heading in lower case with hyphens (`## Volumetric
clouds` is `volumetric-clouds`). Leave a blank line inside `<Equation>`,
`<Table>` and `<Listing>` around the Markdown they wrap.

### Tables

```mdx
<Table id="notation" caption="Notation. Every symbol the guide uses, with its unit.">

| Symbol   | Meaning                              | Unit |
| -------- | ------------------------------------ | ---- |
| $\sigma$ | Extinction coefficient of the medium | m⁻¹  |

</Table>
```

Add `wide` for a table with many columns. Three tables have fixed columns,
the same in every guide, so a reader learns them once:

- **Notation**: Symbol, Meaning, Unit.
- **Settings**: Setting, Type, Range, Default, On screen, Cost.
- **A render pass**, with `<PassTable>`: what the pass reads and what it
  writes, each with its resolution and format.

```mdx
<PassTable
  id="pass-clouds"
  name="cloud raymarch"
  reads={[
    {
      name: '_CameraDepthTexture',
      resolution: 'Full',
      format: 'R32_SFloat',
      notes: 'Where each ray stops.',
    },
  ]}
  writes={[
    {
      name: '_CloudScattering',
      resolution: 'Quarter',
      format: 'RGBA16F',
      notes: 'Light in RGB, transmittance in A.',
    },
  ]}
/>
```

### Measurements

```mdx
<Perf
  id="perf-clouds"
  caption="Cost of the cloud raymarch per frame, by quality tier."
  conditions="RTX 3070, 2560 x 1440, DirectX 12, Unity 6.0, the Meadow sample scene, measured with the Frame Debugger's GPU timings over 300 frames."
  columns={['Low', 'Medium', 'High']}
  rows={[
    { name: 'Raymarch', values: [0.41, 0.83, 1.62] },
    { name: 'Reprojection', values: [0.12, 0.12, 0.12] },
  ]}
/>
```

`conditions` is required and a test checks it: the GPU, the resolution, the
graphics API, the Unity version, the scene and how it was measured. Use
`unit="MB"` for memory, and `null` for a cell that was not measured. Never
put a number in a guide that was not measured.

### Comparisons

```mdx
import reference from './img/clouds-reference.webp'
import package from './img/clouds-package.webp'

<Compare
  id="clouds-validation"
  caption="The package at the High tier against a 1024-step reference. The difference is in the thin edges."
  a={{ src: reference, label: 'Reference', alt: 'Clouds marched with 1024 steps' }}
  b={{ src: package, label: 'High tier', alt: 'The same clouds at the High tier' }}
/>
```

Both images are captures of the same view at the same size. Write the
caption so it states what the comparison shows, not only what the two sides
are.

### Depth and precision

- **Cover everything.** If the package has it, the guide explains it. A
  subsystem, pass or setting the guide does not mention is a gap to fill.
- **Be specific.** Name the class, the pass, the texture format, the
  resolution, the number of steps, the measured milliseconds. "The clouds are
  raymarched efficiently" says nothing; "the clouds are raymarched at quarter
  resolution with 64 steps, then reprojected" says how.
- **Measure, never estimate.** Every number is measured or derived, with the
  conditions it holds under. Never invent or round up a figure.
- **Cite the literature.** Every idea taken from a paper, talk or book gets a
  `<Cite>`, and the guide says where the package departs from it.
- **One term per thing.** Define a term where it first appears, then keep using
  that word. Do not rotate synonyms for variety.
- **Real code only.** Excerpts come from the package, are short, and the text
  around them says what they do.

### Figures

A figure earns its place by making a mechanism visible that the text alone
cannot: how transmittance falls with distance, how a phase function changes
with its asymmetry, what a temporal filter does over several frames. Use:

- **diagrams** (archify) for structure: components, passes, data flow;
- **plots** for relationships between quantities;
- **interactive figures** where changing one input and watching the result is
  the clearest way to show the relationship. Give each one a caption that says
  what it shows, and make it read correctly as a still image too;
- **the package's own renders** for results, with the settings that made them.

A `<Scrub>` in a sentence is for a sentence that states a relationship, so the
reader can test it. Do not scatter them for decoration.

### Writing without AI slop

This applies to every page on the site: guides, docs and the catalog's copy.
Run `/no-ai-slop` in detect mode on every guide and docs page before pushing,
and fix what it names. The test fails on the worst words.

- **State the fact.** No puffery ("plays a vital role", "a testament to"), no
  telling the reader what to think ("this is the key point", "as you can
  see"), no "it is worth noting". If something matters, the facts around it
  show why.
- **Plain verbs.** "Uses", not "leverages" or "utilizes"; "is", not "serves
  as".
- **No set pieces.** No "not X, but Y" contrasts, no rhetorical questions
  answered in the next line, no colon reveals, no dramatic one-line
  fragments, no closing paragraph that restates the section.
- **No empty words.** Cut delve, leverage, utilize, facilitate, robust,
  seamless, cutting-edge, powerful, intricate, meticulous, crucial, paramount,
  harness, elevate, tapestry, realm, and "in this article", "let's dive in",
  "in conclusion".
- **Formatting follows content.** Prose for reasoning; lists only for things
  that really are lists; bold for terms where they are defined, not for
  emphasis mid-sentence.
- **First person, plainly.** "I march the clouds at quarter resolution
  because..." Say why each decision was made.

### Text

Plain Markdown: `##` and `###` headings (each gets an anchor and an entry in
"On this page"), links, lists, tables, **bold**, _italic_, `code`.

### Maths

Inline between single dollars, `$T = e^{-\sigma d}$`; a line of its own between
double dollars:

```mdx
$$
T(d) = \exp\left(-\int_0^d \sigma(s)\,ds\right)
$$
```

### References and citations

List the page's references at the top of the MDX file. They are numbered in
this order and printed at the end of the page automatically:

```mdx
export const references = [
  {
    id: 'pbrt4',
    authors: 'Matt Pharr, Wenzel Jakob and Greg Humphreys',
    title: 'Physically Based Rendering: From Theory to Implementation',
    where: 'fourth edition',
    year: 2023,
    url: 'https://pbr-book.org/',
  },
]
```

Cite with `<Cite id="pbrt4" />`. A citation of an id that is not listed fails
the tests. Every reference must be real; never write one from memory without
checking it.

### Notes

```mdx
<Note>Worth knowing alongside the text.</Note>
<Note kind="tip">A better way to do it.</Note>
<Note kind="warning" title="Careful with this">
  What goes wrong if it is missed.
</Note>
```

### Interactive figures

Deep orange with a dotted line means one thing on this site: **you can drag
this**. Every scrubbable number, every handle in a figure and every slider is
drawn in `--handle` (`c.handle` in a figure), and nothing else is. Links are the
lighter orange with a solid line. Keep it that way, so readers only learn it
once.

A page's shared numbers start in one export at the top of its MDX file. Every
`<Scrub>`, `<Live>` and figure that names one reads and sets the same value, so
dragging a number in a sentence moves the figures, and dragging a figure
changes the sentence:

```mdx
export const params = { sigma: 0.8, d: 2 }

Light that crosses <Scrub name="d" min={0.1} max={5} step={0.1} unit=" m" label="thickness of the fog" />
of fog keeps <Live f={(p) => `${Math.round(100 * Math.exp(-p.sigma * p.d))}%`} /> of its energy.
```

`label` is what a screen reader hears; Tab and the arrow keys work on every
`<Scrub>`.

A figure is a React component of the package's own, in
`src/content/<id>/demos/`. Copy `src/content/kit/FogSlab.tsx` (a simulation
that runs, with Play, Pause and Reset) or `TransmittancePlot.tsx` (a plot with
a point you drag). The pieces:

- `useParam('sigma', 0.8)` from `src/mdx/params` gives a shared number and its
  setter.
- `useCanvas(draw, deps)` from `src/mdx/canvas` gives a crisp canvas that
  repaints when `deps` change, on resize, and when the colour scheme flips.
  `draw` gets the page's colours (`c.ink`, `c.soft`, `c.rule`, `c.link`,
  `c.handle`, `c.data2`), so the figure works in light and dark.
- `Demo` from `src/mdx/components` is the frame: title, caption, controls,
  and `onReset`, `playing` and `onPlay` for figures that move. Figures number
  themselves.
- `prefersStill()` says the reader asked for less motion: start paused, and
  draw a still version that teaches on its own (the fog figure draws twelve
  rays instead of moving photons).

Every handle in a canvas needs a keyboard way in: give the canvas
`role="slider"`, `tabIndex={0}`, an `aria-valuetext` that says what it shows
in words, and arrow keys. Use `touch-action: pan-y` (the default for
`.demo-canvas`) so a phone still scrolls past it. Keep figures light: they run
in the reader's browser, often on a phone.

Import a figure at the top of the MDX file and place it:

```mdx
import { Phase } from './demos/Phase'

<Phase />
```

### Margin notes and folded maths

```mdx
A sentence with an aside.<Side>The aside, in the margin beside it.</Side>

<Reveal title="Show the maths">The derivation, folded until it is wanted.</Reveal>
```

### Images

Put them in `src/content/<id>/img/`, import them, and place them with `Figure`:

```mdx
import clouds from './img/clouds.png'

<Figure
  src={clouds}
  alt="Clouds at sunset, rendered by the package"
  caption="What the caption says."
/>
```

Only the package's own renders, captures and diagrams (archify in
`.claude/skills/` draws good ones). No screenshots of other products, no
photos, no vendor logos.

### Code

An excerpt of the package's code goes in a `<Listing>`, which numbers it and
names the file and line it is from:

````mdx
<Listing id="march" file="Runtime/Clouds/CloudMarch.hlsl" line={120} caption="The inner loop of the cloud march.">

```hlsl
float Transmittance(float sigma, float distance) { return exp(-sigma * distance); }
```

</Listing>
````

Keep excerpts short and real: copy them from the package, and update them
when it changes. Every code block gets a Copy button.

Fenced code is highlighted at build time; say the language:

````mdx
```csharp
public float density = 0.5f;
```
````

`csharp`, `hlsl`, `shaderlab`, `json` and `sh` all work.

## The docs

The docs are for someone using the package. They are six pages, the same six
for every package, in this order (`src/docs-pages.ts`):

| Page            | File                       | What goes in it                                                         |
| --------------- | -------------------------- | ----------------------------------------------------------------------- |
| Quick start     | `docs/quick-start.mdx`     | Installing it and getting a first result, in as few steps as it takes.  |
| Setup           | `docs/setup.mdx`           | Every step of setting it up: pipeline, project settings, sample scenes. |
| Components      | `docs/components.mdx`      | Each component and asset, and a settings table for each.                |
| Scripting API   | `docs/api.mdx`             | Every public type and member, with `ApiType` and `ApiMember`.           |
| Integrations    | `docs/integrations.mdx`    | Using it with my other packages and with other assets.                  |
| Troubleshooting | `docs/troubleshooting.mdx` | Problems by symptom, each with its cause and its fix.                   |

Files go in `src/content/<id>/docs/`. A page with no file yet keeps its
address and its place in the sidebar, marked "soon", and says what it will
cover, so write them one at a time. A released package has all six (a test
checks). Do not add other pages: a file that is not in `src/docs-pages.ts`
has no address.

Compatibility, limitations, the changelog and support are not docs pages.
They live in the catalog and print on the package's own page (see "The
details sheet"); the docs sidebar links to them.

- **Quick start** is short enough to follow in five minutes: import it from
  the Asset Store through the Package Manager, add one component, press Play.
  Number the steps. Leave explanations to Setup and the guide.
- **Components** has one `##` per component, each with a settings `<Table>`
  (Setting, Type, Range, Default, On screen, Cost).
- **Scripting API** documents every public type:

```mdx
<ApiType name="SkySettings" kind="class" namespace="Damyanlhr.Sky">
  What the type is for.

  <ApiMember signature="public float Density { get; set; }">
    What it does, its range, and what changing it costs.
  </ApiMember>
</ApiType>
```

- **Troubleshooting** has one `###` per symptom, worded as the reader sees
  it ("The clouds flicker when the camera moves"), then the cause, then the
  fix. End the page with a link to the issue tracker.
- Give each page a `meta` (see "Version, date and revisions"), so it says
  which version it applies to.

Everything the guide can use works in the docs too.

## Search

The search covers every package, its sections and details, the guide and the
docs. Its index is built with the site from the catalog and the MDX files
(`build/search-index.ts`), so there is nothing to maintain: write clear
headings, since a heading is what a search lands on.

## The package's README

Each package has a public repository on GitHub that holds its README, its
changelog and its issue tracker (the source is sold on the Asset Store). Its
README links back here, to its own pages specifically. Put this near the
top, with the package's id in place of `sky`:

```md
## Guide and docs

- [Guide](https://damyanlhr.github.io/packages/sky/guide/): how the package is built, in depth, with references.
- [Docs](https://damyanlhr.github.io/packages/sky/docs/): installing it, setting it up, and its whole API.
- [Overview](https://damyanlhr.github.io/packages/sky/): what it runs on, its limitations and its changelog.

Part of [Damyan Hristov's Unity packages](https://damyanlhr.github.io/packages/).
```

When that repository exists, set `repo` in `src/catalog.ts`: the package's
Support section then links to its issue tracker. When the package is on
sale, set `store`. Give the portfolio's project entry the same links too
(`src/content/projects.ts` in DamyanLHr/damyanlhr.github.io).

## Before pushing

`npm run lint`, `npm run test` and `npm run build` must pass. Then look at the
page with `npm run dev`, in light and dark, at phone width and on a desktop.
