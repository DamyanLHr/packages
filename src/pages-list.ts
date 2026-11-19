import { catalog } from './catalog'
import { SITE_NAME } from './site'

/** Every page the site has, with what its HTML says before the app runs. */
export interface PageInfo {
  /** relative to the site's base, with a trailing slash; '' is the home page */
  path: string
  title: string
  description: string
}

export function pages(): PageInfo[] {
  const out: PageInfo[] = [
    {
      path: '',
      title: SITE_NAME,
      description:
        'Unity packages by Damyan Hristov, each with a guide to how it works and docs for its API.',
    },
  ]
  for (const p of catalog) {
    out.push(
      { path: `${p.id}/`, title: `${p.name} · ${SITE_NAME}`, description: p.summary },
      {
        path: `${p.id}/guide/`,
        title: `${p.name} guide · ${SITE_NAME}`,
        description: `How the ${p.name} package works, step by step, with references.`,
      },
      {
        path: `${p.id}/docs/`,
        title: `${p.name} docs · ${SITE_NAME}`,
        description: `Installing the ${p.name} package, setting it up, and its API.`,
      },
    )
  }
  return out
}
