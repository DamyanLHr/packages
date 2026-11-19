// The packages this site documents. Plain data only (no React, no MDX): the
// build reads it too, to write a page per package. Each package's guide and
// docs live in src/content/<id>/guide.mdx and docs.mdx (a test checks both
// exist for every entry). See docs/AUTHORING.md.

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
  /** the render pipelines, as you would say it: 'URP today, HDRP planned' */
  pipelines?: string
  /** the package's own repository, once it is public */
  repo?: string
  /** its slug on the portfolio: https://damyanlhr.github.io/projects/<slug> */
  portfolio: string
  /** the full-width showcase at the top of its page (and the home page, for the first package) */
  hero: Shot
  /** what its card on the home page shows; the hero if left out */
  cover?: Shot
  /** its page, section by section: one per thing worth seeing */
  features: Feature[]
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
    pipelines: 'URP today, HDRP planned',
    portfolio: 'sky-package',
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
    pipelines: 'URP and HDRP',
    portfolio: 'terrain-rendering',
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
    pipelines: 'URP and HDRP',
    portfolio: 'terrain-dressing',
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
    ...pkg.features.flatMap((f) => [...(f.compare ? [f.compare.a, f.compare.b] : []), ...f.shots]),
  ]
}
