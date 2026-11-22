import type { ComponentType } from 'react'
import type { Reference } from './mdx/references'

/**
 * What a page says about itself, in `export const meta = { ... }`: which
 * version of the package the text applies to, and when it last changed.
 */
export interface PageMeta {
  /** the package version the text describes: '0.4.0' */
  version?: string
  /** the Unity and pipeline versions it was written against: 'Unity 6.0, URP 17' */
  unity?: string
  /** the day the text last changed, as YYYY-MM-DD */
  updated: string
  /** what changed and when, newest first */
  revisions?: { date: string; note: string }[]
}

/** What a guide or docs page compiles to. */
export interface MdxModule {
  default: ComponentType<{ components?: Record<string, ComponentType<never>> }>
  /** the page's references, in the order they are numbered */
  references?: Reference[]
  /** where the page's shared numbers start: what <Scrub>, <Live> and its figures read */
  params?: Record<string, number>
  meta?: PageMeta
}

// Each page is its own chunk, fetched when it is opened.
const guides = import.meta.glob<MdxModule>('./content/*/guide.mdx')
const docs = import.meta.glob<MdxModule>('./content/*/docs/*.mdx')

export function loadGuide(id: string) {
  const load = guides[`./content/${id}/guide.mdx`]
  return load ? load() : Promise.reject(new Error(`no guide for ${id}`))
}

/** Whether a docs page has been written yet (see src/docs-pages.ts). */
export const hasDocs = (id: string, file: string) => `./content/${id}/docs/${file}.mdx` in docs

export function loadDocs(id: string, file: string) {
  const load = docs[`./content/${id}/docs/${file}.mdx`]
  return load ? load() : Promise.reject(new Error(`no docs page ${file} for ${id}`))
}

export const loadKit = () => import('./content/kit/kit.mdx') as Promise<MdxModule>
