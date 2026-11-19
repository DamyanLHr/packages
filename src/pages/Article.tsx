import { useEffect, useRef, useState } from 'react'
import type { MdxModule } from '../content-index'
import { References } from '../mdx/components'
import { mdxComponents } from '../mdx'
import { ReferencesContext } from '../mdx/references'
import { ParamsProvider } from '../mdx/explorable'

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

/**
 * A guide or docs page: the MDX, its references at the end, and an "On this
 * page" list of its headings that marks the section being read.
 */
export function Article({ load }: { load: () => Promise<MdxModule> }) {
  const [mod, setMod] = useState<MdxModule | null>(null)
  const [failed, setFailed] = useState(false)
  const body = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    load().then(
      (m) => live && setMod(m),
      () => live && setFailed(true),
    )
    return () => {
      live = false
    }
  }, [load])

  // the headings, once the page is on screen, and a jump to #anchor if the
  // address carries one (the browser tried before the page existed)
  useEffect(() => {
    const el = body.current
    if (!mod || !el) return
    const found = [...el.querySelectorAll<HTMLElement>('h2[id], h3[id]')].map((h) => ({
      id: h.id,
      text: h.textContent ?? '',
      level: h.tagName === 'H2' ? 2 : 3,
    })) as Heading[]
    setHeadings(found)
    if (location.hash)
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()

    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActive(top.target.id)
      },
      { rootMargin: '0px 0px -70% 0px' },
    )
    found.forEach((h) => {
      const node = document.getElementById(h.id)
      if (node) io.observe(node)
    })
    return () => io.disconnect()
  }, [mod])

  if (failed) return <p className="lede">This page could not be loaded. Try reloading.</p>
  if (!mod)
    return (
      <p className="loading" aria-live="polite">
        Loading…
      </p>
    )

  const Content = mod.default
  const refs = mod.references ?? []
  return (
    <div className="article-grid">
      <article className="article" ref={body}>
        <ParamsProvider initial={mod.params}>
          <ReferencesContext.Provider value={refs}>
            <Content components={mdxComponents as never} />
          </ReferencesContext.Provider>
        </ParamsProvider>
        {refs.length > 0 && <References items={refs} />}
      </article>
      {headings.length > 1 && (
        <nav className="toc" aria-label="On this page">
          <p className="toc-title">On this page</p>
          <ol>
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'toc-sub' : undefined}>
                <a href={`#${h.id}`} aria-current={active === h.id ? 'location' : undefined}>
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  )
}
