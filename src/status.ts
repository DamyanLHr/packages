import type { UnityPackage } from './catalog'

/** In progress and when it is due, or released: the same words everywhere. */
export function statusLine(pkg: UnityPackage): string {
  if (pkg.status === 'released') return 'Released'
  return pkg.expected ? `In progress · expected ${pkg.expected}` : 'In progress'
}
