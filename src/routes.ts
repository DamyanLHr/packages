import { findDocsPage } from './docs-pages'
import { BASE } from './site'

export type Route =
  | { kind: 'home' }
  | { kind: 'package'; id: string }
  | { kind: 'guide'; id: string }
  /** a page of a package's docs; `page` is its slug, '' for the first */
  | { kind: 'docs'; id: string; page: string }
  /** every MDX component in one place, for whoever writes a guide; not linked */
  | { kind: 'kit' }
  | { kind: 'not-found'; path: string }

/** The route for a pathname. Unknown package ids are the page's problem, not the router's. */
export function parse(pathname: string): Route {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '')
  const parts = rest.split('/').filter(Boolean)
  if (parts.length === 0) return { kind: 'home' }
  if (parts.length === 1 && parts[0] === 'kit') return { kind: 'kit' }
  if (parts.length === 1) return { kind: 'package', id: parts[0] }
  if (parts.length === 2 && parts[1] === 'guide') return { kind: 'guide', id: parts[0] }
  if (parts.length === 2 && parts[1] === 'docs') return { kind: 'docs', id: parts[0], page: '' }
  if (parts.length === 3 && parts[1] === 'docs' && parts[2] && findDocsPage(parts[2]))
    return { kind: 'docs', id: parts[0], page: parts[2] }
  return { kind: 'not-found', path: pathname }
}

/** The address of a route, always with a trailing slash (what GitHub Pages serves). */
export function href(route: Exclude<Route, { kind: 'not-found' }>): string {
  switch (route.kind) {
    case 'home':
      return BASE
    case 'kit':
      return `${BASE}kit/`
    case 'package':
      return `${BASE}${route.id}/`
    case 'guide':
      return `${BASE}${route.id}/guide/`
    case 'docs':
      return `${BASE}${route.id}/docs/${route.page ? `${route.page}/` : ''}`
  }
}
