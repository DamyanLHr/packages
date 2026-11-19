import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { catalog } from './catalog'
import { pages } from './pages-list'
import { href, parse } from './routes'

// Content checks: what a guide author can get wrong fails here, in CI, instead
// of as a broken page.

const CONTENT = join(import.meta.dirname, 'content')

/** every MDX file under src/content, with its text */
function mdxFiles(): [string, string][] {
  const out: [string, string][] = []
  for (const dir of readdirSync(CONTENT, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    for (const f of readdirSync(join(CONTENT, dir.name))) {
      if (f.endsWith('.mdx')) {
        const path = join(dir.name, f)
        out.push([path, readFileSync(join(CONTENT, path), 'utf8')])
      }
    }
  }
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

  it('gives every package a guide and docs', () => {
    for (const p of catalog) {
      expect(existsSync(join(CONTENT, p.id, 'guide.mdx')), `${p.id}/guide.mdx`).toBe(true)
      expect(existsSync(join(CONTENT, p.id, 'docs.mdx')), `${p.id}/docs.mdx`).toBe(true)
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
      for (const kind of ['package', 'guide', 'docs'] as const) {
        expect(parse(href({ kind, id: p.id }))).toEqual({ kind, id: p.id })
      }
    }
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
    }
  })
})
