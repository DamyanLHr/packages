// The packages this site documents. Plain data only (no React, no MDX): the
// build reads it too, to write a page per package. Each package's guide lives
// in src/content/<id>/guide.mdx and its docs in src/content/<id>/docs/. See
// docs/AUTHORING.md.
//
// State only what is true of the package. Where a fact is not settled yet,
// leave it out or mark it 'unknown': the site then says "to be confirmed"
// instead of guessing.

/**
 * One picture or clip of the package itself: a render, a capture, a
 * comparison. Until `src` is set it shows as a placeholder that says what is
 * coming, so the page has its shape before the media exists.
 */
export interface Shot {
  /** what it shows, as a short caption: 'Volumetric clouds' */
  title: string
  /** under public/: 'media/sky/clouds.webp' (or .mp4 / .webm for a clip) */
  src?: string
  /** for an image, what it shows, for screen readers */
  alt?: string
  /** for a clip, the still shown before it plays (also under public/) */
  poster?: string
}

/**
 * Two captures of the same view, one over the other, with a line between them
 * the reader drags: a setting off and on, a low tier and a high one.
 */
export interface Compare {
  /** what the comparison shows: 'Native and DLSS' */
  title: string
  /** the left side, as its label: { title: 'Native' } */
  a: Shot
  /** the right side, as its label: { title: 'DLSS, Quality' } */
  b: Shot
}

/**
 * One thing the package does, as a section of its page: a heading, a line on
 * what the pictures show, and the pictures. The first shot leads, wide.
 */
export interface Feature {
  title: string
  /** one plain sentence on what the pictures show (optional) */
  text?: string
  /** a drag-to-compare pair, shown before the shots */
  compare?: Compare
  shots: Shot[]
}

/** Whether something is supported: yes, planned, no, or not settled yet. */
export type Support = 'yes' | 'planned' | 'no' | 'unknown'

/** One line of the compatibility table: a pipeline, a platform, a graphics API. */
export interface CompatRow {
  name: string
  status: Support
  /** a condition or a version, in a few words: 'Unity 6.0 and later', 'Windows only' */
  note?: string
}

export interface CompatGroup {
  title: string
  rows: CompatRow[]
}

/** One released version, for the changelog. */
export interface Release {
  /** '1.2.0' */
  version: string
  /** the day it was released, as YYYY-MM-DD */
  date: string
  /** what changed, one plain sentence each */
  notes: string[]
}

/** Something the package works with: another of these packages, or someone else's asset. */
export interface Integration {
  /** its name: 'Upscalers' */
  with: string
  /** the id of the package here, when it is one of these */
  id?: string
  /** what the two do together, in a sentence or two */
  text: string
}

/** A build of a demo scene people can download and run on their own hardware. */
export interface DemoBuild {
  url: string
  /** 'Windows, 64-bit' */
  platform: string
  /** its size, and anything to know before running it */
  note?: string
}

export interface UnityPackage {
  /** URL segment: /packages/<id>/ */
  id: string
  name: string
  /** the Unity package name, once it has one: com.damyanlhr.<…> */
  unityName?: string
  /** one or two plain sentences, shown on the list and the package page */
  summary: string
  status: 'in-progress' | 'released'
  /** when an in-progress package is due, as you would say it: 'Q2 2027' */
  expected?: string
  /** its listing on the Unity Asset Store, once it is on sale */
  store?: string
  /**
   * its public repository, once there is one: the README, the changelog and
   * the issue tracker (the source is sold on the Asset Store, not kept here)
   */
  repo?: string
  /** the version on sale now: '1.0.0' */
  version?: string
  /** the price as the store shows it: '€45' */
  price?: string
  /** the licence it is sold under, in a few words */
  licence?: string
  /** what it runs on, group by group; see `compat()` */
  compat: CompatGroup[]
  /** what it cannot do, or does badly, one plain sentence each */
  limitations: string[]
  /** what it works with */
  integrations: Integration[]
  /** every released version, newest first */
  releases: Release[]
  /** what is planned next, one plain sentence each */
  roadmap: string[]
  /** a trailer clip; shown above the sections once it has a `src` */
  trailer?: Shot
  /** a demo build to download */
  demo?: DemoBuild
  /** its slug on the portfolio: https://damyanlhr.github.io/projects/<slug> */
  portfolio: string
  /** the full-width showcase at the top of its page (and the home page, for the first package) */
  hero: Shot
  /** what its card on the home page shows; the hero if left out */
  cover?: Shot
  /** its page, section by section: one per thing worth seeing */
  features: Feature[]
}

/**
 * The compatibility table every package has, with the same rows in the same
 * order so packages can be compared. Pass what is settled; everything else
 * stays 'unknown' and shows as "to be confirmed".
 *
 *   compat({ 'URP': 'yes', 'HDRP': 'planned', 'Unity version': ['yes', 'Unity 6.0 and later'] })
 */
function compat(known: Record<string, Support | [Support, string]> = {}): CompatGroup[] {
  const row = (name: string): CompatRow => {
    const k = known[name]
    if (!k) return { name, status: 'unknown' }
    return Array.isArray(k) ? { name, status: k[0], note: k[1] } : { name, status: k }
  }
  const group = (title: string, names: string[]): CompatGroup => ({ title, rows: names.map(row) })
  const groups = [
    group('Unity', ['Unity version']),
    group('Render pipelines', ['URP', 'HDRP', 'Built-in']),
    group('Platforms', ['Windows', 'macOS', 'Linux', 'Consoles', 'Mobile', 'VR', 'Web']),
    group('Graphics APIs', ['DirectX 11', 'DirectX 12', 'Vulkan', 'Metal']),
  ]
  const names = groups.flatMap((g) => g.rows.map((r) => r.name))
  for (const name of Object.keys(known))
    if (!names.includes(name)) throw new Error(`compat(): no row called "${name}"`)
  return groups
}

/** The editor section every package ends on: how it looks to the person using it. */
const inTheEditor = (what: string): Feature => ({
  title: 'In the editor',
  text: `What setting up ${what} looks like in Unity.`,
  shots: [{ title: 'The settings in the inspector' }, { title: 'Set up in a scene' }],
})

export const catalog: UnityPackage[] = [
  {
    id: 'sky',
    name: 'Volumetric Sky',
    unityName: 'com.damyanlhr.sky',
    summary:
      'The atmosphere, volumetric clouds, weather, quality tiers and diagnostics of my Unity volumetric sky, as a package of its own.',
    status: 'in-progress',
    expected: 'Q2 2027',
    portfolio: 'sky-package',
    compat: compat({ URP: 'yes', HDRP: 'planned' }),
    limitations: [],
    integrations: [
      {
        with: 'Upscalers',
        id: 'upscalers',
        text: 'The sky fills the reactive mask that the upscalers package asks for.',
      },
    ],
    releases: [],
    roadmap: ['HDRP support.'],
    hero: { title: 'Volumetric Sky in a scene' },
    features: [
      {
        title: 'Atmosphere',
        text: 'The same sky through a day, as the sun moves.',
        shots: [
          { title: 'Through a day' },
          { title: 'Morning' },
          { title: 'Noon' },
          { title: 'Sunset' },
        ],
      },
      {
        title: 'Volumetric clouds',
        text: 'Clouds you can look at from below, from the side and against the light.',
        shots: [
          { title: 'From the ground' },
          { title: 'Against the sun' },
          { title: 'Towards the horizon' },
        ],
      },
      {
        title: 'Weather',
        text: 'One scene under different weather.',
        shots: [{ title: 'The weather changing' }, { title: 'Clear' }, { title: 'Overcast' }],
      },
      {
        title: 'Quality tiers',
        text: 'The same view at each tier, so you can see what each one gives up.',
        compare: {
          title: 'The lowest tier and the highest',
          a: { title: 'Lowest tier' },
          b: { title: 'Highest tier' },
        },
        shots: [{ title: 'Every tier, side by side' }],
      },
      {
        title: 'Diagnostics',
        text: 'What the package shows you while you tune it.',
        shots: [{ title: 'The diagnostics' }, { title: 'Diagnostics over a scene' }],
      },
      inTheEditor('the sky'),
    ],
  },
  {
    id: 'upscalers',
    name: 'Upscalers',
    unityName: 'com.damyanlhr.upscalers',
    summary:
      "DLSS and FSR 2 through Unity's own NVIDIA and AMD engine modules, with a reactive-mask hook that the sky package fills.",
    status: 'in-progress',
    expected: 'Q2 2027',
    portfolio: 'upscalers-package',
    compat: compat(),
    limitations: [],
    integrations: [
      {
        with: 'Volumetric Sky',
        id: 'sky',
        text: 'The upscalers package has a reactive-mask hook, and the sky package fills it.',
      },
    ],
    releases: [],
    roadmap: [],
    hero: { title: 'Upscalers in a scene' },
    features: [
      {
        title: 'DLSS',
        text: "DLSS through Unity's NVIDIA module, next to the scene rendered at full size.",
        compare: { title: 'Native and DLSS', a: { title: 'Native' }, b: { title: 'DLSS' } },
        shots: [{ title: 'DLSS, up close' }, { title: 'DLSS in motion' }],
      },
      {
        title: 'FSR 2',
        text: "FSR 2 through Unity's AMD module, next to the scene rendered at full size.",
        compare: { title: 'Native and FSR 2', a: { title: 'Native' }, b: { title: 'FSR 2' } },
        shots: [{ title: 'FSR 2, up close' }, { title: 'FSR 2 in motion' }],
      },
      {
        title: 'The reactive mask',
        text: 'The hook the sky package fills, and what it changes on moving clouds.',
        compare: {
          title: 'Without the mask and with it',
          a: { title: 'Without the mask' },
          b: { title: 'With the mask' },
        },
        shots: [{ title: 'The mask itself' }],
      },
      inTheEditor('the upscalers'),
    ],
  },
  {
    id: 'terrain-rendering',
    name: 'Terrain Rendering',
    summary: 'Rendering terrain in Unity, in the same family as the sky and upscaler packages.',
    status: 'in-progress',
    expected: 'Q2 2027',
    portfolio: 'terrain-rendering',
    compat: compat({ URP: 'planned', HDRP: 'planned' }),
    limitations: [],
    integrations: [],
    releases: [],
    roadmap: [],
    hero: { title: 'Terrain Rendering in a scene' },
    features: [
      {
        title: 'Up close',
        text: 'The ground at your feet.',
        shots: [{ title: 'At ground level' }, { title: 'Up close' }, { title: 'A slope' }],
      },
      {
        title: 'From far away',
        text: 'The same terrain out to the horizon.',
        shots: [
          { title: 'To the horizon' },
          { title: 'From the air' },
          { title: 'A flight over it' },
        ],
      },
      inTheEditor('the terrain'),
    ],
  },
  {
    id: 'terrain-dressing',
    name: 'Terrain Dressing',
    summary: 'Vegetation, rocks and ground detail placed over a terrain.',
    status: 'in-progress',
    expected: 'Q2 2027',
    portfolio: 'terrain-dressing',
    compat: compat({ URP: 'planned', HDRP: 'planned' }),
    limitations: [],
    integrations: [],
    releases: [],
    roadmap: [],
    hero: { title: 'Terrain Dressing in a scene' },
    features: [
      {
        title: 'Vegetation',
        shots: [{ title: 'A field of it' }, { title: 'Vegetation up close' }],
      },
      {
        title: 'Rocks',
        shots: [{ title: 'Rocks across a slope' }, { title: 'Rocks up close' }],
      },
      {
        title: 'Ground detail',
        shots: [{ title: 'Ground detail at your feet' }, { title: 'Ground detail at a distance' }],
      },
      {
        title: 'All of it together',
        text: 'The same terrain, bare and dressed.',
        compare: { title: 'Bare and dressed', a: { title: 'Bare' }, b: { title: 'Dressed' } },
        shots: [{ title: 'A dressed terrain, from the air' }],
      },
      inTheEditor('the dressing'),
    ],
  },
  {
    id: 'water',
    name: 'Water',
    summary: 'Water for Unity, in the same family as the sky and terrain packages.',
    status: 'in-progress',
    expected: 'Q2 2027',
    portfolio: 'water-package',
    compat: compat(),
    limitations: [],
    integrations: [],
    releases: [],
    roadmap: [],
    hero: { title: 'Water in a scene' },
    features: [
      {
        title: 'Up close',
        shots: [{ title: 'Water in motion' }, { title: 'The surface' }, { title: 'At the shore' }],
      },
      {
        title: 'From far away',
        shots: [{ title: 'Out to the horizon' }, { title: 'From the air' }],
      },
      inTheEditor('the water'),
    ],
  },
]

export const findPackage = (id: string) => catalog.find((p) => p.id === id)

/** every picture a package names, in page order: hero, cover, then each section's */
export function allShots(pkg: UnityPackage): Shot[] {
  return [
    pkg.hero,
    ...(pkg.cover ? [pkg.cover] : []),
    ...(pkg.trailer ? [pkg.trailer] : []),
    ...pkg.features.flatMap((f) => [...(f.compare ? [f.compare.a, f.compare.b] : []), ...f.shots]),
  ]
}
