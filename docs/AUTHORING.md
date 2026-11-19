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

## The guide

The guide teaches how the package works, deeply enough that a reader could
build it themselves, and covers everything in it. It is the place for the
ideas, the maths, the implementation and the trade-offs, with interactive
figures wherever moving a slider explains more than a paragraph.

A shape that works:

1. What the package does and what you will understand by the end.
2. Each part in turn: the idea, the maths, how the package implements it, what
   its settings change, and what it costs.
3. How the parts fit together.
4. Where to read further: the references.

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

A demo is a React component of the package's own, in
`src/content/<id>/demos/`, built from `Demo`, `Slider` and `Toggle` (import
them from `../../mdx/components`). `src/content/kit/Transmittance.tsx` is the
example to copy: state, controls, and a drawing that redraws when the state
changes, coloured from the page's CSS variables so it works in light and dark.
Import it at the top of the MDX file and place it:

```mdx
import { Phase } from './demos/Phase'

<Phase />
```

Keep demos light: they run in the reader's browser. Give each canvas a `role="img"`
and an `aria-label` that says what it shows.

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
