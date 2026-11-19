import type { UnityPackage } from '../catalog'
import { Link } from '../router'
import { href } from '../routes'

/**
 * A package's name and the way between its pages: overview, guide, docs, and
 * its repository once it is public. The current page is marked for screen
 * readers as well as by eye.
 */
export function PackageHead({
  pkg,
  current,
}: {
  pkg: UnityPackage
  current: 'package' | 'guide' | 'docs'
}) {
  const tabs = [
    { kind: 'package', label: 'Overview' },
    { kind: 'guide', label: 'Guide' },
    { kind: 'docs', label: 'Docs' },
  ] as const
  return (
    <header className="pkg-head">
      <p className="crumbs">
        <Link href={href({ kind: 'home' })}>Packages</Link>
        <span aria-hidden="true"> / </span>
        <span>{pkg.name}</span>
      </p>
      <h1>{current === 'package' ? pkg.name : `${pkg.name} ${current}`}</h1>
      {pkg.unityName && (
        <p className="pkg-id">
          <code>{pkg.unityName}</code>
        </p>
      )}
      <nav className="tabs" aria-label={`${pkg.name} pages`}>
        {tabs.map((t) => (
          <Link
            key={t.kind}
            className="tab"
            href={href({ kind: t.kind, id: pkg.id })}
            aria-current={t.kind === current ? 'page' : undefined}
          >
            {t.label}
          </Link>
        ))}
        {pkg.repo ? (
          <a className="tab" href={pkg.repo}>
            Repository <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="tab tab-off">Repository (not public yet)</span>
        )}
      </nav>
    </header>
  )
}
