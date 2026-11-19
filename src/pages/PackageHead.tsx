import type { UnityPackage } from '../catalog'
import { Link } from '../router'
import { href } from '../routes'

/** The head of a guide or docs page: the way back, the name, and a switch between its pages. */
export function PackageHead({ pkg, current }: { pkg: UnityPackage; current: 'guide' | 'docs' }) {
  const tabs = [
    { kind: 'package', label: 'Overview' },
    { kind: 'guide', label: 'Guide' },
    { kind: 'docs', label: 'Docs' },
  ] as const
  return (
    <header className="page-head page-head-tabs">
      <div className="page-head-name">
        <Link className="back" href={href({ kind: 'package', id: pkg.id })}>
          &larr; {pkg.name}
        </Link>
        <h1>{current === 'guide' ? `How ${pkg.name} works` : `${pkg.name} docs`}</h1>
      </div>
      <nav className="tabs" aria-label={`${pkg.name} pages`}>
        {tabs.map((t) => (
          <Link
            key={t.kind}
            className={`tab${t.kind === current ? ' tab-on' : ''}`}
            href={href({ kind: t.kind, id: pkg.id })}
            aria-current={t.kind === current ? 'page' : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
