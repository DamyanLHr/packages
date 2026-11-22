import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { MdxModule } from '../content-index'
import { References } from '../mdx/components'
import { mdxComponents } from '../mdx'
import { ReferencesContext } from '../mdx/references'
import { ParamsProvider } from '../mdx/explorable'
import { collectLabels, LabelsContext, type Labels } from '../mdx/numbering'

interface Heading {
  id: string
  text: string
  level: 2 | 3
  /** its number in a numbered article: '2', '2.1' */
  n?: string
}

/**
 * A guide or docs page: the MDX, its references at the end, and beside it an
 * "On this page" list of its headings that marks the section being read.
 * `nav` goes above that list (the docs put their pages there); `before` and
 * `after` go around the text, inside the reading column.
 */
export function Article({
  load,
  nav,
  before,
  after,
  numbered = false,
}: {
  load: () => Promise<MdxModule>
  nav?: ReactNode
  before?: (mod: MdxModule) => ReactNode
  after?: (mod: MdxModule) => ReactNode
  /** number the sections, as a long article does: 2, 2.1, 2.2 */
  numbered?: boolean
}) {
  const [mod, setMod] = useState<MdxModule | null>(null)
  const [failed, setFailed] = useState(false)
  const body = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [labels, setLabels] = useState<Labels>({})

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
    let major = 0
    let minor = 0
    const found = [...el.querySelectorAll<HTMLElement>('h2[id], h3[id]')].map((h): Heading => {
      const level = h.tagName === 'H2' ? 2 : 3
      // the sections of the text are numbered; what the page adds after it is not
      let n: string | undefined
      if (numbered && !h.closest('.refs, .article-end') && h.id !== 'being-written') {
        if (level === 2) {
          major += 1
          minor = 0
          n = String(major)
        } else if (major > 0) {
          minor += 1
          n = `${major}.${minor}`
        }
        if (n) h.dataset.n = n
      }
      return {
        id: h.id,
        // the heading's own words, without the link mark beside it
        text: [...h.childNodes]
          .filter((c) => !(c instanceof HTMLElement && c.classList.contains('anchor')))
          .map((c) => c.textContent)
          .join(''),
        level,
        n,
      }
    })
    setHeadings(found)
    setLabels(collectLabels(el))
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
  }, [mod, numbered])

  const toc = headings.length > 1 && (
    <nav className="toc" aria-label="On this page">
      <p className="toc-title">On this page</p>
      <ol>
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'toc-sub' : undefined}>
            <a href={`#${h.id}`} aria-current={active === h.id ? 'location' : undefined}>
              {h.n && <span className="toc-n">{h.n}</span>}
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
  const side = (nav || toc) && (
    <aside className="sidebar">
      {nav}
      {toc}
    </aside>
  )

  let text: ReactNode
  if (failed) text = <p className="lead">This page could not be loaded. Try reloading.</p>
  else if (!mod)
    text = (
      <p className="loading" aria-live="polite">
        Loading…
      </p>
    )
  else {
    const Content = mod.default
    const refs = mod.references ?? []
    text = (
      <>
        {before?.(mod)}
        <ParamsProvider initial={mod.params}>
          <ReferencesContext.Provider value={refs}>
            <LabelsContext.Provider value={labels}>
              <Content components={mdxComponents as never} />
            </LabelsContext.Provider>
          </ReferencesContext.Provider>
        </ParamsProvider>
        {refs.length > 0 && <References items={refs} />}
        {after?.(mod)}
      </>
    )
  }

  return (
    <div className={`article-grid${side ? ' has-side' : ''}`}>
      {side}
      <article className={`article${numbered ? ' article-numbered' : ''}`} ref={body}>
        {text}
      </article>
    </div>
  )
}
