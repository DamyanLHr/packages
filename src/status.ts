import type { Support, UnityPackage } from './catalog'

/** In progress and when it is due, or released: the same words everywhere. */
export function statusLine(pkg: UnityPackage): string {
  if (pkg.status === 'released')
    return pkg.version ? `Released, version ${pkg.version}` : 'Released'
  return pkg.expected ? `In progress, expected in ${pkg.expected}` : 'In progress'
}

/** What a compatibility status reads as. Never a colour alone. */
export const SUPPORT_WORDS: Record<Support, string> = {
  yes: 'Supported',
  planned: 'Planned',
  no: 'Not supported',
  unknown: 'To be confirmed',
}

/**
 * The render pipelines in a line, from the compatibility table, or nothing if
 * none is settled: 'URP · HDRP planned'.
 */
export function pipelineLine(pkg: UnityPackage): string | undefined {
  const rows = pkg.compat.find((g) => g.title === 'Render pipelines')?.rows ?? []
  const yes = rows.filter((r) => r.status === 'yes').map((r) => r.name)
  const planned = rows.filter((r) => r.status === 'planned').map((r) => r.name)
  if (yes.length === 0 && planned.length === 0) return undefined
  if (yes.length === 0) return `${planned.join(' and ')}, planned`
  return [...yes, ...planned.map((n) => `${n} planned`)].join(' · ')
}

/** A date from the catalog (YYYY-MM-DD) as people write it: 22 November 2026. */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return `${d} ${months[m - 1]} ${y}`
}
