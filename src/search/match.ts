// The site's search: a small index built with the site (build/search-index.ts)
// and matched in the browser. Plain functions, so the tests can run them.

/** One thing a search can land on: a section of a page. */
export interface Entry {
  /** where it is, with its #anchor */
  u: string
  /** the page it is on: 'Volumetric Sky · Guide' */
  p: string
  /** the section's heading */
  h: string
  /** the section's text, as plain words */
  t: string
}

export interface Hit {
  entry: Entry
  /** the words around the first match in the text: before, the match, after */
  snippet: [string, string, string]
}

const words = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean)

/** How well an entry answers the query; 0 if a word of it appears nowhere. */
function score(e: Entry, qs: string[]): number {
  const h = e.h.toLowerCase()
  const p = e.p.toLowerCase()
  const t = e.t.toLowerCase()
  let total = 0
  for (const q of qs) {
    let s = 0
    if (h === q) s += 12
    else if (h.startsWith(q) || h.includes(` ${q}`)) s += 8
    else if (h.includes(q)) s += 5
    if (p.includes(q)) s += 2
    if (t.includes(q)) s += 1
    if (s === 0) return 0
    total += s
  }
  return total
}

function snippet(e: Entry, qs: string[]): [string, string, string] {
  const lower = e.t.toLowerCase()
  let at = -1
  let len = 0
  for (const q of qs) {
    const i = lower.indexOf(q)
    if (i >= 0 && (at < 0 || i < at)) {
      at = i
      len = q.length
    }
  }
  if (at < 0) return [e.t.slice(0, 120) + (e.t.length > 120 ? '…' : ''), '', '']
  const from = Math.max(0, at - 50)
  const to = Math.min(e.t.length, at + len + 80)
  return [
    (from > 0 ? '…' : '') + e.t.slice(from, at),
    e.t.slice(at, at + len),
    e.t.slice(at + len, to) + (to < e.t.length ? '…' : ''),
  ]
}

/** The best entries for a query, best first. Every word of the query must appear. */
export function search(entries: Entry[], query: string, limit = 10): Hit[] {
  const qs = words(query)
  if (qs.length === 0) return []
  return entries
    .map((entry, i) => ({ entry, i, s: score(entry, qs) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map(({ entry }) => ({ entry, snippet: snippet(entry, qs) }))
}
