import type { ComponentType } from 'react'
import type { Reference } from './mdx/references'

/** What a guide or docs page compiles to. */
export interface MdxModule {
  default: ComponentType<{ components?: Record<string, ComponentType<never>> }>
  /** the page's references, in the order they are numbered */
  references?: Reference[]
}

// Each page is its own chunk, fetched when it is opened.
const guides = import.meta.glob<MdxModule>('./content/*/guide.mdx')
const docs = import.meta.glob<MdxModule>('./content/*/docs.mdx')

export function loadArticle(id: string, kind: 'guide' | 'docs') {
  const load = (kind === 'guide' ? guides : docs)[`./content/${id}/${kind}.mdx`]
  return load ? load() : Promise.reject(new Error(`no ${kind} for ${id}`))
}

export const loadKit = () => import('./content/kit/kit.mdx') as Promise<MdxModule>
