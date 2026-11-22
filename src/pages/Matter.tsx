import type { PageMeta } from '../content-index'
import { AUTHOR, ORIGIN, SITE_ISSUES } from '../site'
import { longDate } from '../status'

// What goes around a guide or docs page's text: above it, which version it
// applies to and when it last changed; after a guide, its revisions, where to
// report a mistake, and how to cite it.

/** Which version the text applies to, and when it last changed. */
export function Stanza({ name, meta }: { name: string; meta?: PageMeta }) {
  if (!meta) return null
  return (
    <p className="stanza">
      <span>
        Applies to {name} {meta.version ?? 'in development'}
      </span>
      {meta.unity && <span>{meta.unity}</span>}
      <span>
        Last updated <time dateTime={meta.updated}>{longDate(meta.updated)}</time>
      </span>
    </p>
  )
}

export function GuideEnd({ title, meta, url }: { title: string; meta?: PageMeta; url: string }) {
  const year = (meta?.updated ?? '').slice(0, 4)
  return (
    <section className="article-end" aria-label="About this guide">
      {meta?.revisions && meta.revisions.length > 0 && (
        <>
          <h2 id="revisions">Revisions</h2>
          <ol className="revisions">
            {meta.revisions.map((r) => (
              <li key={r.date + r.note}>
                <time className="meta" dateTime={r.date}>
                  {longDate(r.date)}
                </time>
                <span>{r.note}</span>
              </li>
            ))}
          </ol>
        </>
      )}
      <h2 id="corrections">Corrections</h2>
      <p>
        If something here is wrong or unclear, <a href={SITE_ISSUES}>report it</a> and I will fix
        the text and note it under the revisions.
      </p>
      {meta && (
        <>
          <h2 id="cite">Cite this guide</h2>
          <p className="cite-this">
            {AUTHOR}. &ldquo;{title}.&rdquo;{meta.version ? ` Version ${meta.version}.` : ''} {year}
            . {ORIGIN}
            {url}
          </p>
        </>
      )}
    </section>
  )
}
