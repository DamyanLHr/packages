import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allShots, catalog } from './catalog'
import { buildIndex, plain, sections } from '../build/search-index'
import { DOCS_PAGES } from './docs-pages'
import { MOSAIC_COLUMNS, SPAN } from './layout'
import { pages } from './pages-list'
import { href, parse } from './routes'
import { search } from './search/match'

// Content checks: what a guide author can get wrong fails here, in CI, instead
// of as a broken page.

const CONTENT = join(import.meta.dirname, 'content')

/** the worst of the words and phrases that mark generated prose */
const SLOP = new RegExp(
  '\\b(' +
    [
      'delve',
      'delves',
      'delving',
      'leverage',
      'leverages',
      'leveraging',
      'utilize',
      'utilizes',
      'utilizing',
      'facilitate',
      'facilitates',
      'seamless',
      'seamlessly',
      'cutting-edge',
      'game[- ]changer',
      'tapestry',
      'realm',
      'beacon',
      'multifaceted',
      'meticulous',
      'meticulously',
      'paramount',
      'transformative',
      'supercharge',
      'ever-evolving',
      "it'?s worth noting",
      "it'?s important to note",
      "let'?s dive in",
      'in this article',
      'in conclusion',
      'a testament to',
      'plays a (?:vital|crucial|key|pivotal) role',
    ].join('|') +
    ')\\b',
  'i',
)

/** every MDX file under src/content, with its text */
function mdxFiles(): [string, string][] {
  const out: [string, string][] = []
  const walk = (dir: string) => {
    for (const f of readdirSync(join(CONTENT, dir), { withFileTypes: true })) {
      const path = join(dir, f.name)
      if (f.isDirectory()) walk(path)
      else if (f.name.endsWith('.mdx')) out.push([path, readFileSync(join(CONTENT, path), 'utf8')])
    }
  }
  walk('')
  return out
}

describe('catalog', () => {
  it('has unique, URL-safe ids', () => {
    const ids = catalog.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
    // 'kit' is the writing kit's address
    expect(ids).not.toContain('kit')
  })

  it('gives every package a guide, and only docs pages the site knows', () => {
    const files = DOCS_PAGES.map((d) => `${d.file}.mdx`)
    for (const p of catalog) {
      expect(existsSync(join(CONTENT, p.id, 'guide.mdx')), `${p.id}/guide.mdx`).toBe(true)
      const dir = join(CONTENT, p.id, 'docs')
      const written = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mdx')) : []
      // a page not in src/docs-pages.ts has no address and would never be shown
      for (const f of written) expect(files, `${p.id}/docs/${f}`).toContain(f)
      // a released package has all of its docs
      if (p.status === 'released') expect(written.sort(), p.id).toEqual([...files].sort())
    }
  })

  it('links only to https pages, and names Unity packages the same way', () => {
    for (const p of catalog) {
      if (p.repo) expect(p.repo, p.id).toMatch(/^https:\/\/github\.com\/DamyanLHr\//)
      if (p.unityName) expect(p.unityName, p.id).toMatch(/^com\.damyanlhr\.[a-z0-9-]+$/)
      expect(p.portfolio, p.id).toMatch(/^[a-z0-9-]+$/)
      expect(p.summary.length, p.id).toBeGreaterThan(20)
    }
  })

  it('has a showcase and sections of pictures, and every media file it names exists', () => {
    const PUBLIC = join(import.meta.dirname, '..', 'public')
    for (const p of catalog) {
      expect(p.hero.title, p.id).toBeTruthy()
      expect(p.features.length, `${p.id} has no sections`).toBeGreaterThan(0)
      const sections = p.features.map((f) => f.title)
      expect(new Set(sections).size, `${p.id}: two sections share a name`).toBe(sections.length)
      for (const f of p.features) {
        expect(
          f.shots.length + (f.compare ? 1 : 0),
          `${p.id}: ${f.title} is empty`,
        ).toBeGreaterThan(0)
        expect(f.text ?? '', `${p.id}: ${f.title}`).not.toMatch(/[–—]/)
      }
      // a picture's caption names it in the viewer, so no two on a page share one
      const pictures = p.features.flatMap((f) => [
        ...(f.compare ? [f.compare.title] : []),
        ...f.shots.map((s) => s.title),
      ])
      expect(new Set(pictures).size, `${p.id}: two pictures share a caption`).toBe(pictures.length)
      for (const shot of allShots(p)) {
        for (const file of [shot.src, shot.poster]) {
          if (!file) continue
          expect(file, p.id).toMatch(
            /^media\/[a-z0-9-]+\/[\w.-]+\.(webp|png|jpg|jpeg|avif|mp4|webm)$/,
          )
          expect(existsSync(join(PUBLIC, file)), `${p.id}: public/${file}`).toBe(true)
        }
        if (shot.src && !/\.(mp4|webm)$/.test(shot.src))
          expect(shot.alt, `${p.id}: ${shot.title} needs alt`).toBeTruthy()
      }
    }
  })

  it('has a place in the home page mosaic for every package, and the rows fill', () => {
    // a new package needs its width in src/layout.ts (see "Add a package" in docs/AUTHORING.md)
    for (const p of catalog)
      expect(SPAN[p.id], `${p.id} has no width in src/layout.ts`).toBeGreaterThan(0)
    for (const id of Object.keys(SPAN))
      expect(
        catalog.map((p) => p.id),
        `src/layout.ts names ${id}`,
      ).toContain(id)
    const total = catalog.reduce((n, p) => n + SPAN[p.id], 0)
    expect(total % MOSAIC_COLUMNS, 'the last row of the mosaic is not full').toBe(0)
  })

  it('states its details in a form the site can print, and guesses nothing', () => {
    for (const p of catalog) {
      if (p.store) expect(p.store, p.id).toMatch(/^https:\/\/assetstore\.unity\.com\//)
      // the same groups and rows for every package, so they can be compared
      expect(
        p.compat.map((g) => g.title),
        p.id,
      ).toEqual(catalog[0].compat.map((g) => g.title))
      for (const g of p.compat)
        for (const r of g.rows)
          expect(['yes', 'planned', 'no', 'unknown'], `${p.id}: ${r.name}`).toContain(r.status)
      const dates = p.releases.map((r) => r.date)
      for (const d of dates) expect(d, `${p.id}: a release date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect([...dates].sort().reverse(), `${p.id}: releases go newest first`).toEqual(dates)
      for (const r of p.releases) {
        expect(r.version, p.id).toMatch(/^\d+\.\d+\.\d+/)
        expect(r.notes.length, `${p.id} ${r.version} says nothing`).toBeGreaterThan(0)
      }
      for (const i of p.integrations)
        if (i.id)
          expect(
            catalog.map((c) => c.id),
            `${p.id} works with ${i.id}`,
          ).toContain(i.id)
      if (p.demo) expect(p.demo.url, p.id).toMatch(/^https:\/\//)
      const prose = [
        ...p.limitations,
        ...p.roadmap,
        ...p.integrations.map((i) => i.text),
        ...p.releases.flatMap((r) => r.notes),
      ].join(' ')
      expect(prose, p.id).not.toMatch(/[–—]/)
      expect(prose.match(SLOP)?.[0], p.id).toBeUndefined()
    }
  })

  it('has everything a buyer needs once a package is released', () => {
    for (const p of catalog.filter((p) => p.status === 'released')) {
      expect(p.store, `${p.id}: where to buy it`).toBeTruthy()
      expect(p.repo, `${p.id}: its issue tracker`).toBeTruthy()
      expect(p.version, p.id).toBe(p.releases[0]?.version)
      expect(p.price, p.id).toBeTruthy()
      expect(p.licence, p.id).toBeTruthy()
      // nothing left "to be confirmed" on a package people are paying for
      for (const g of p.compat)
        for (const r of g.rows) expect(r.status, `${p.id}: ${r.name}`).not.toBe('unknown')
      expect(p.limitations.length, `${p.id}: every package has limits`).toBeGreaterThan(0)
    }
  })

  it('says when an unfinished package is due', () => {
    for (const p of catalog.filter((p) => p.status === 'in-progress')) {
      expect(p.expected, p.id).toBeTruthy()
    }
  })
})

describe('guides and docs', () => {
  it('cite only references they list', () => {
    for (const [path, text] of mdxFiles()) {
      const cited = [...text.matchAll(/<Cite\s+id="([^"]+)"/g)].map((m) => m[1])
      const block = text.match(/export const references = \[([\s\S]*?)\n\]/)?.[1] ?? ''
      const listed = [...block.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
      expect(new Set(listed).size, `${path}: duplicate reference ids`).toBe(listed.length)
      for (const id of cited) expect(listed, `${path} cites ${id}`).toContain(id)
    }
  })

  it('point only at things that exist, and number them once', () => {
    for (const [path, text] of mdxFiles()) {
      const ids = [
        ...text.matchAll(
          /<(?:Equation|Table|Listing|PassTable|Perf|Compare|Figure|Demo)\b[^>]*?\bid="([^"]+)"/g,
        ),
      ].map((m) => m[1])
      expect(new Set(ids).size, `${path}: two numbered things share an id`).toBe(ids.length)
      // a <Ref> may also point at a figure component's own id or at a section, so
      // only refs that look like neither are checked against the page's ids
      const refs = [...text.matchAll(/<Ref\s+to="([^"]+)"/g)].map((m) => m[1])
      const headings = [...text.matchAll(/^#{2,3}\s+(.+?)\s*$/gm)].map((m) =>
        m[1]
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/ /g, '-'),
      )
      const dir = join(CONTENT, path, '..')
      const figures = readdirSync(dir, { recursive: true })
        .map(String)
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => readFileSync(join(dir, f), 'utf8'))
        .flatMap((src) => [...src.matchAll(/<Demo\b[^>]*?\bid="([^"]+)"/g)].map((m) => m[1]))
      for (const to of refs)
        expect(
          [...ids, ...headings, ...figures],
          `${path}: <Ref to="${to}"> points at nothing`,
        ).toContain(to)
    }
  })

  it('give every measurement its conditions, and every listing its file', () => {
    for (const [path, text] of mdxFiles()) {
      for (const m of text.matchAll(/<Perf\b[\s\S]*?\/>/g))
        expect(m[0], `${path}: a <Perf> without conditions`).toMatch(/\bconditions="[^"]{20,}"/)
      for (const m of text.matchAll(/<Listing\b[^>]*>/g))
        expect(m[0], `${path}: a <Listing> without its file`).toMatch(/\bfile="[^"]+"/)
    }
  })

  it('date themselves in a form the site can print', () => {
    for (const [path, text] of mdxFiles()) {
      const meta = text.match(/export const meta = \{([\s\S]*?)\n\}/)?.[1]
      if (!meta) continue
      const dates = [...meta.matchAll(/\b(?:updated|date):\s*'([^']*)'/g)].map((m) => m[1])
      expect(meta, `${path}: meta needs an updated date`).toMatch(/\bupdated:/)
      for (const d of dates) expect(d, path).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('use no quizzes', () => {
    // guides are in-depth articles (docs/AUTHORING.md, "The guide")
    for (const [path, text] of mdxFiles()) expect(text, path).not.toMatch(/<Quiz\b/)
  })

  it('use none of the words that mark AI slop', () => {
    // "Writing without AI slop" in docs/AUTHORING.md; the references are exempt,
    // since a real paper's title is what it is
    for (const [path, text] of mdxFiles()) {
      const prose = text
        .replace(/export const references = \[[\s\S]*?\n\]/, '')
        .replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$|```[\s\S]*?```|`[^`\n]*`/g, '')
      const hit = prose.match(SLOP)
      expect(hit?.[0], `${path} says "${hit?.[0]}"`).toBeUndefined()
    }
    for (const p of catalog) {
      const copy = [p.summary, ...p.features.flatMap((f) => [f.title, f.text ?? ''])].join(' ')
      expect(copy.match(SLOP)?.[0], p.id).toBeUndefined()
    }
  })

  it('follow the structure of an in-depth article once written', () => {
    // a guide still being written has one section, "Being written"
    for (const p of catalog) {
      const text = readFileSync(join(CONTENT, p.id, 'guide.mdx'), 'utf8')
      const h2 = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim())
      if (h2.length === 1 && h2[0] === 'Being written') continue
      expect(h2[0], `${p.id}: the guide opens on its overview`).toMatch(/overview/i)
      expect(
        h2.some((h) => /architecture|structure/i.test(h)),
        `${p.id}: no architecture section`,
      ).toBe(true)
      expect(text, `${p.id}: a guide cites its sources`).toMatch(/<Cite\s/)
      expect(text, `${p.id}: a guide says what version it applies to`).toMatch(
        /export const meta = \{/,
      )
      for (const part of ['integration', 'performance', 'debugging'])
        expect(
          h2.some((h) => h.toLowerCase().includes(part)),
          `${p.id}: no ${part} section`,
        ).toBe(true)
      // the frame's passes are tabled, and its cost is measured
      expect(text, `${p.id}: no <PassTable>`).toMatch(/<PassTable\b/)
      expect(text, `${p.id}: no <Perf>`).toMatch(/<Perf\b/)
    }
  })

  it('use no em or en dashes in their text', () => {
    for (const [path, text] of mdxFiles()) {
      // maths is exempt: a minus in LaTeX is not a dash in prose
      const prose = text.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$|```[\s\S]*?```/g, '')
      expect(prose, path).not.toMatch(/[–—]/)
    }
  })
})

describe('routes', () => {
  it('round-trips every page', () => {
    for (const p of catalog) {
      for (const kind of ['package', 'guide'] as const) {
        expect(parse(href({ kind, id: p.id }))).toEqual({ kind, id: p.id })
      }
      for (const d of DOCS_PAGES) {
        const route = { kind: 'docs', id: p.id, page: d.slug } as const
        expect(parse(href(route))).toEqual(route)
      }
    }
    expect(parse('/packages/sky/docs/no-such-page/').kind).toBe('not-found')
    expect(parse('/packages/')).toEqual({ kind: 'home' })
    expect(parse('/packages/kit/')).toEqual({ kind: 'kit' })
    expect(parse('/packages/sky/guide/extra/').kind).toBe('not-found')
  })

  it('writes an HTML file for every page a package has', () => {
    const paths = pages().map((p) => p.path)
    expect(paths).toContain('')
    for (const p of catalog) {
      expect(paths).toContain(`${p.id}/`)
      expect(paths).toContain(`${p.id}/guide/`)
      expect(paths).toContain(`${p.id}/docs/`)
      for (const d of DOCS_PAGES.filter((d) => d.slug))
        expect(paths).toContain(`${p.id}/docs/${d.slug}/`)
    }
    expect(new Set(paths).size, 'two pages share an address').toBe(paths.length)
    // what a link to each page shows: run `node scripts/og.mjs` after adding a package
    for (const p of pages())
      expect(existsSync(join(import.meta.dirname, '..', 'public', p.image)), p.image).toBe(true)
  })
})

describe('search', () => {
  it('reads a page as plain words', () => {
    const mdx = [
      "import { Fog } from './Fog'",
      'export const references = [',
      "  { id: 'a', title: 'A secret title' },",
      ']',
      '## Clouds',
      'The **clouds** are marched at $\\sigma$ per <Cite id="a" /> step.',
      '```hlsl',
      'float hidden = 1;',
      '```',
      '<ApiType name="SkySettings" kind="class">',
      '  <ApiMember signature="public float density">How dense.</ApiMember>',
      '</ApiType>',
    ].join('\n')
    const text = plain(mdx)
    expect(text).toContain('The clouds are marched at')
    expect(text).not.toMatch(/secret|hidden|import|Cite/)
    const found = sections(mdx, '/packages/sky/guide/', 'Sky · Guide')
    expect(found.map((e) => e.u)).toEqual([
      '/packages/sky/guide/#clouds',
      '/packages/sky/guide/#api-skysettings',
    ])
    expect(found[1].t).toContain('public float density')
  })

  it('finds every package, and ranks a heading above a mention', () => {
    const index = buildIndex(join(import.meta.dirname, '..'))
    for (const p of catalog) {
      const top = search(index, p.name)[0]
      expect(top?.entry.u, p.name).toBe(`/packages/${p.id}/`)
    }
    expect(search(index, 'zzzz no such thing')).toEqual([])
    const hits = search(
      [
        { u: '/a', p: 'A', h: 'Other', t: 'mentions weather once' },
        { u: '/b', p: 'B', h: 'Weather', t: 'the section itself' },
      ],
      'weather',
    )
    expect(hits.map((h) => h.entry.u)).toEqual(['/b', '/a'])
    expect(hits[1].snippet[1]).toBe('weather')
  })
})
