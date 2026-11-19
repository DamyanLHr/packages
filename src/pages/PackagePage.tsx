import type { UnityPackage } from '../catalog'
import { Gallery, ShotView } from '../media'
import { Link } from '../router'
import { href } from '../routes'
import { PORTFOLIO } from '../site'
import { statusLine } from '../status'

export function PackagePage({ pkg }: { pkg: UnityPackage }) {
  const facts: [string, string][] = [['Status', statusLine(pkg)]]
  if (pkg.pipelines) facts.push(['Render pipelines', pkg.pipelines])
  if (pkg.unityName) facts.push(['Package', pkg.unityName])
  return (
    <>
      <div className="band band-tall">
        <ShotView shot={pkg.hero} size="band" />
      </div>
      <section className="project">
        <div className="rail">
          <Link className="back" href={href({ kind: 'home' })}>
            &larr; all packages
          </Link>
          <h1 className="project-title">{pkg.name}</h1>
          {pkg.status !== 'released' && (
            <span className="chips">
              <span className="chip chip-soon">in progress</span>
            </span>
          )}
          <div className="actions">
            <Link className="btn btn-primary" href={href({ kind: 'guide', id: pkg.id })}>
              Read the guide
            </Link>
            <Link className="btn" href={href({ kind: 'docs', id: pkg.id })}>
              Docs
            </Link>
            {pkg.repo ? (
              <a className="btn" href={pkg.repo}>
                Repository
              </a>
            ) : (
              <span className="btn btn-off">Repository soon</span>
            )}
          </div>
          <dl className="facts">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <a className="back" href={`${PORTFOLIO}projects/${pkg.portfolio}`}>
            {pkg.name} on the portfolio
          </a>
        </div>
        <div className="story">
          <p className="lead">{pkg.summary}</p>
          <h2 className="h2">Screenshots</h2>
          <Gallery shots={pkg.shots} />
        </div>
      </section>
    </>
  )
}
