// Builds the site's search index from the catalog and the MDX pages. It runs
// in Node, with the site's build (see vite.config.ts), and the result is
// fetched only when someone opens the search.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import GithubSlugger from 'github-slugger'
import { anchor } from '../src/anchor'
import { catalog } from '../src/catalog'
import { DOCS_PAGES } from '../src/docs-pages'
import type { Entry } from '../src/search/match'
import { BASE } from '../src/site'
import { SUPPORT_WORDS } from '../src/status'

/** An MDX page's prose as plain words: no imports, code, maths or tags. */
export function plain(mdx: string): string {
  return (
    mdx
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
      .replace(/^import .*$/gm, ' ')
      // `export const x = [ ... ]` and `{ ... }`, to the bracket that closes it at column 0
      .replace(/^export const \w+ = [[{][\s\S]*?^[\]}]\s*$/gm, ' ')
      .replace(/^export const .*$/gm, ' ')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/\$[^$\n]+\$/g, ' ')
      // a tag leaves behind the words a reader would see in it
      .replace(/<[A-Za-z][^>]*>/g, (tag) =>
        [...tag.matchAll(/\b(?:title|caption|name|signature|question)="([^"]*)"/g)]
          .map((m) => m[1])
          .join(' '),
      )
      .replace(/<\/[A-Za-z]+>/g, ' ')
      .replace(/\{[^{}]*\}/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`|>#]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/** One entry per section of an MDX page, anchored the way the page anchors its headings. */
export function sections(mdx: string, url: string, page: string): Entry[] {
  const slugger = new GithubSlugger()
  const out: Entry[] = []
  let heading = ''
  let id = ''
  let lines: string[] = []
  const flush = () => {
    const t = plain(lines.join('\n'))
    if (heading && heading !== 'Being written' && (t || id))
      out.push({ u: id ? `${url}#${id}` : url, p: page, h: heading, t: t.slice(0, 1500) })
    lines = []
  }
  let fenced = false
  for (const line of mdx.split('\n')) {
    if (line.startsWith('```')) fenced = !fenced
    const h = !fenced && /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    const api = !fenced && /^<ApiType\s[^>]*\bname="([^"]+)"/.exec(line)
    if (h) {
      flush()
      heading = plain(h[2])
      id = slugger.slug(heading)
    } else if (api) {
      flush()
      heading = api[1]
      id = `api-${api[1].toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      lines.push(line)
    } else lines.push(line)
  }
  flush()
  return out
}

/** Everything the search can find, in the order the site presents it. */
export function buildIndex(root: string): Entry[] {
  const out: Entry[] = []
  const content = join(root, 'src', 'content')
  const read = (path: string) => (existsSync(path) ? readFileSync(path, 'utf8') : undefined)
  for (const p of catalog) {
    const home = `${BASE}${p.id}/`
    out.push({ u: home, p: p.name, h: p.name, t: p.summary })
    for (const f of p.features)
      out.push({
        u: `${home}#${anchor(f.title)}`,
        p: p.name,
        h: f.title,
        t: [f.text ?? '', ...(f.compare ? [f.compare.title] : []), ...f.shots.map((s) => s.title)]
          .filter(Boolean)
          .join('. '),
      })
    const settled = p.compat.flatMap((g) =>
      g.rows
        .filter((r) => r.status !== 'unknown')
        .map((r) => `${r.name}: ${SUPPORT_WORDS[r.status]}${r.note ? `, ${r.note}` : ''}`),
    )
    out.push({
      u: `${home}#compatibility`,
      p: p.name,
      h: 'Compatibility',
      t: settled.join('. ') || 'To be confirmed.',
    })
    if (p.limitations.length)
      out.push({
        u: `${home}#limitations`,
        p: p.name,
        h: 'Limitations',
        t: p.limitations.join(' '),
      })
    if (p.releases.length || p.roadmap.length)
      out.push({
        u: `${home}#releases`,
        p: p.name,
        h: 'Releases',
        t: [...p.releases.flatMap((r) => [r.version, ...r.notes]), ...p.roadmap].join(' '),
      })

    const guide = read(join(content, p.id, 'guide.mdx'))
    if (guide) out.push(...sections(guide, `${home}guide/`, `${p.name} · Guide`))
    for (const d of DOCS_PAGES) {
      const text = read(join(content, p.id, 'docs', `${d.file}.mdx`))
      if (!text) continue
      const url = `${home}docs/${d.slug ? `${d.slug}/` : ''}`
      out.push({ u: url, p: `${p.name} · Docs`, h: d.title, t: d.about })
      out.push(...sections(text, url, `${p.name} · Docs · ${d.title}`))
    }
  }
  return out
}
