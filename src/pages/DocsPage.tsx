import { useCallback } from 'react'
import type { UnityPackage } from '../catalog'
import { hasDocs, loadDocs } from '../content-index'
import { DOCS_PAGES, type DocsPageInfo } from '../docs-pages'
import { Link } from '../router'
import { href } from '../routes'
import { Article } from './Article'
import { Stanza } from './Matter'
import { PackageHead } from './PackageHead'

/** The docs' pages, and the facts that live on the package's own page. */
function DocsNav({ pkg, current }: { pkg: UnityPackage; current: DocsPageInfo }) {
  const overview = href({ kind: 'package', id: pkg.id })
  return (
    <nav className="docs-nav" aria-label={`${pkg.name} docs`}>
      <p className="toc-title">Docs</p>
      <ol>
        {DOCS_PAGES.map((d) => (
          <li key={d.slug}>
            <Link
              href={href({ kind: 'docs', id: pkg.id, page: d.slug })}
              aria-current={d.slug === current.slug ? 'page' : undefined}
            >
              {d.title}
              {!hasDocs(pkg.id, d.file) && <span className="docs-soon">soon</span>}
            </Link>
          </li>
        ))}
      </ol>
      <p className="toc-title">Reference</p>
      <ol>
        <li>
          <Link href={`${overview}#compatibility`}>Compatibility</Link>
        </li>
        <li>
          <Link href={`${overview}#limitations`}>Limitations</Link>
        </li>
        <li>
          <Link href={`${overview}#releases`}>Changelog</Link>
        </li>
        <li>
          <Link href={`${overview}#support`}>Support</Link>
        </li>
      </ol>
    </nav>
  )
}

/** The page before and the page after, at the foot of each docs page. */
function Pager({ pkg, current }: { pkg: UnityPackage; current: DocsPageInfo }) {
  const i = DOCS_PAGES.indexOf(current)
  const prev = DOCS_PAGES[i - 1]
  const next = DOCS_PAGES[i + 1]
  return (
    <nav className="pager" aria-label="Docs pages">
      {prev ? (
        <Link className="pager-link" href={href({ kind: 'docs', id: pkg.id, page: prev.slug })}>
          <span className="meta">Previous</span>
          <span>{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          className="pager-link pager-next"
          href={href({ kind: 'docs', id: pkg.id, page: next.slug })}
        >
          <span className="meta">Next</span>
          <span>{next.title}</span>
        </Link>
      )}
    </nav>
  )
}

/** One page of a package's docs, with the docs' pages beside it. */
export function DocsPage({ pkg, page }: { pkg: UnityPackage; page: DocsPageInfo }) {
  const load = useCallback(() => loadDocs(pkg.id, page.file), [pkg.id, page.file])
  const nav = <DocsNav pkg={pkg} current={page} />
  const written = hasDocs(pkg.id, page.file)
  return (
    <div className="page page-read enter">
      <PackageHead pkg={pkg} current="docs" title={page.title} />
      {written ? (
        <Article
          load={load}
          nav={nav}
          before={(mod) => <Stanza name={pkg.name} meta={mod.meta} />}
          after={() => <Pager pkg={pkg} current={page} />}
        />
      ) : (
        <div className="article-grid has-side">
          <aside className="sidebar">{nav}</aside>
          <article className="article">
            <h2>Being written</h2>
            <p>
              This page of the {pkg.name} docs is being written. It will cover:{' '}
              {page.about.charAt(0).toLowerCase() + page.about.slice(1)}
            </p>
            <Pager pkg={pkg} current={page} />
          </article>
        </div>
      )}
    </div>
  )
}
