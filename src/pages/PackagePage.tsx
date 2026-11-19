import type { UnityPackage } from '../catalog'
import { Link } from '../router'
import { href } from '../routes'
import { PORTFOLIO } from '../site'
import { statusLine } from '../status'
import { PackageHead } from './PackageHead'

export function PackagePage({ pkg }: { pkg: UnityPackage }) {
  const facts: [string, string][] = [['Status', statusLine(pkg)]]
  if (pkg.pipelines) facts.push(['Render pipelines', pkg.pipelines])
  return (
    <div className="page">
      <PackageHead pkg={pkg} current="package" />
      <p className="lede">{pkg.summary}</p>
      <dl className="facts">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="doors">
        <Link className="door" href={href({ kind: 'guide', id: pkg.id })}>
          <span className="door-title">Guide</span>
          <span className="door-text">
            How it works, from the idea to the shader, with figures you can play with.
          </span>
        </Link>
        <Link className="door" href={href({ kind: 'docs', id: pkg.id })}>
          <span className="door-title">Docs</span>
          <span className="door-text">Install it, set it up, and look up any type or setting.</span>
        </Link>
      </div>
      <p className="aside">
        Also on the portfolio: <a href={`${PORTFOLIO}projects/${pkg.portfolio}`}>{pkg.name}</a>
      </p>
    </div>
  )
}
