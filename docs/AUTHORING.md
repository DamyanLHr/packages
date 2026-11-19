# Writing a package's pages

Every package has an overview, a guide and docs. This is how to add a package
and write its pages. `/packages/kit/` (run `npm run dev`, then open
http://localhost:5173/packages/kit/) shows every component below, working; its
source is `src/content/kit/kit.mdx`.

## Add a package

1. Add an entry to `src/catalog.ts`: `id` (its address, `/packages/<id>/`),
   `name`, `unityName` once it has one (`com.damyanlhr.<…>`), a one or two
   sentence `summary`, `status`, `expected` while it is in progress, `pipelines`,
   and `portfolio` (its slug on the portfolio).
2. Create `src/content/<id>/guide.mdx` and `src/content/<id>/docs.mdx`.
3. `npm run test` checks both exist and that the entry is complete.

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

The guide teaches how the package works, deeply enough that a reader could
build it themselves, and covers everything in it: the ideas, the maths, the
implementation and the trade-offs. It should be fun. People learn a thing by
poking it, so the guide gives them something to poke in every section.

A shape that works:

1. What the package does, shown first: a figure the reader can play with
   before any explanation.
2. Each part in turn: the idea, the maths, how the package implements it, what
   its settings change, and what it costs.
3. How the parts fit together.
4. Where to read further: the references, printed at the end by themselves.

### Making it fun to learn from

- **Show, then explain.** Open each idea with something to drag, then say why
  it behaves that way.
- **Ask before telling.** A `<Quiz>` just before an answer makes the reader
  guess, and a guess makes the answer stick. Say why in the `why`, not only
  what.
- **Put the numbers in the sentences.** A `<Scrub>` in the text that drives the
  figure beside it beats a slider under the figure: the reader changes the
  claim and watches it hold.
- **One idea per figure.** A figure that shows everything teaches nothing.
  Build the full picture across several figures that share their numbers.
- **Simulate, do not only plot.** The photons in the kit's first figure teach
  what the curve in its second only states. Where a process is random or
  step by step, let the reader watch it happen.
- **Fold the heavy maths.** Keep the main line readable and put derivations in
  `<Reveal>`, for the readers who want them.
- **Asides go in the margin.** `<Side>` keeps the main line moving.

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

### Questions, margin notes and folded maths

```mdx
<Quiz
  question="A fog 2 m thick lets 20% of the light through. How much gets through 4 m?"
  options={['10%', '4%', 'None', '40%']}
  answer={1}
  why="The second 2 m keeps 20% of what the first let through: 20% of 20% is 4%."
/>

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

Fenced code is highlighted at build time; say the language:

````mdx
```csharp
public float density = 0.5f;
```
````

`csharp`, `hlsl`, `shaderlab`, `json` and `sh` all work.

## The docs

Everything a user needs, in the order they need it:

1. **Installing.** Unity's Package Manager, from the package repository's git URL
   once it is public, and the Unity version and render pipelines it supports.
2. **Setting it up** in a project, step by step.
3. **Using it**: the common tasks.
4. **The API**: every public type and member, with `ApiType` and `ApiMember`:

```mdx
<ApiType name="SkySettings" kind="class" namespace="Damyanlhr.Sky">
  What the type is for.

  <ApiMember signature="public float Density { get; set; }">
    What it does, its range, and what changing it costs.
  </ApiMember>
</ApiType>
```

5. **Troubleshooting**, and a link to the repository's issues.

## The package's README

Each package repository's README links back here, to its own pages
specifically. Put this near the top, with the package's id in place of `sky`:

```md
## Guide and docs

- [Guide](https://damyanlhr.github.io/packages/sky/guide/): how the package works, step by step, with references.
- [Docs](https://damyanlhr.github.io/packages/sky/docs/): installing it, setting it up, and its whole API.
- [Overview](https://damyanlhr.github.io/packages/sky/)

Part of [Damyan Hristov's Unity packages](https://damyanlhr.github.io/packages/).
```

When the repository is public, set `repo` in `src/catalog.ts`; the package's
Repository tab then links to it. Give the portfolio's project entry the same
links too (`src/content/projects.ts` in DamyanLHr/damyanlhr.github.io).

## Before pushing

`npm run lint`, `npm run test` and `npm run build` must pass. Then look at the
page with `npm run dev`, in light and dark, at phone width and on a desktop.
