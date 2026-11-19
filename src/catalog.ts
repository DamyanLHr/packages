// The packages this site documents. Plain data only (no React, no MDX): the
// build reads it too, to write a page per package. Each package's guide and
// docs live in src/content/<id>/guide.mdx and docs.mdx (a test checks both
// exist for every entry). See docs/AUTHORING.md.

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
  },
  {
    id: 'terrain-rendering',
    name: 'Terrain Rendering',
    summary: 'Rendering terrain in Unity, in the same family as the sky and upscaler packages.',
    status: 'in-progress',
    expected: 'Q2 2027',
    pipelines: 'URP and HDRP',
    portfolio: 'terrain-rendering',
  },
  {
    id: 'terrain-dressing',
    name: 'Terrain Dressing',
    summary: 'Vegetation, rocks and ground detail placed over a terrain.',
    status: 'in-progress',
    expected: 'Q2 2027',
    pipelines: 'URP and HDRP',
    portfolio: 'terrain-dressing',
  },
  {
    id: 'water',
    name: 'Water',
    summary: 'Water for Unity, in the same family as the sky and terrain packages.',
    status: 'in-progress',
    expected: 'Q2 2027',
    portfolio: 'water-package',
  },
]

export const findPackage = (id: string) => catalog.find((p) => p.id === id)
