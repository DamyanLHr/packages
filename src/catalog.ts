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
  /** the wide showcase at the top of its page (and the home page, for the first package) */
  hero: Shot
  /** what its card on the home page shows; the hero if left out */
  cover?: Shot
  /** the gallery on its page, one slot per thing worth seeing */
  shots: Shot[]
}

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
    shots: [
      { title: 'Atmosphere' },
      { title: 'Volumetric clouds' },
      { title: 'Weather' },
      { title: 'Quality tiers, side by side' },
      { title: 'Diagnostics' },
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
    shots: [{ title: 'DLSS' }, { title: 'FSR 2' }, { title: 'The reactive mask' }],
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
    shots: [{ title: 'Up close' }, { title: 'From far away' }],
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
    shots: [{ title: 'Vegetation' }, { title: 'Rocks' }, { title: 'Ground detail' }],
  },
  {
    id: 'water',
    name: 'Water',
    summary: 'Water for Unity, in the same family as the sky and terrain packages.',
    status: 'in-progress',
    expected: 'Q2 2027',
    portfolio: 'water-package',
    hero: { title: 'Water in a scene' },
    shots: [{ title: 'Up close' }, { title: 'From far away' }],
  },
]

export const findPackage = (id: string) => catalog.find((p) => p.id === id)
