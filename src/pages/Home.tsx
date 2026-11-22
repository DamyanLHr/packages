import { catalog } from '../catalog'
import { ShotView } from '../media'
import { Link } from '../router'
import { SPAN } from '../layout'
import { href } from '../routes'

export function Home() {
  const featured = catalog[0]
  return (
    <div className="enter">
      <header className="pkg-hero home-hero">
        <ShotView shot={featured.hero} size="hero" />
        <span className="pkg-hero-scrim" aria-hidden="true" />
        <div className="pkg-hero-body">
          <h1 className="pkg-title">Unity packages</h1>
          <p className="pkg-summary">
            Unity packages I am building, starting with my volumetric sky. Each one comes with a
            guide, an in-depth article on how it is built and the sources it builds on, and docs for
            installing it and looking up its API.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href={href({ kind: 'package', id: featured.id })}>
              See {featured.name}
            </Link>
            <a className="btn" href="#all">
              All {catalog.length} packages
            </a>
          </div>
        </div>
        {/* whose picture the hero is */}
        <Link className="home-shown" href={href({ kind: 'package', id: featured.id })}>
          Shown
          <strong>{featured.hero.title}</strong>
        </Link>
      </header>
      <section className="page page-wide" id="all" aria-label="All packages">
        <div className="mosaic">
          {catalog.map((p) => (
            <Link
              key={p.id}
              className={`card span-${SPAN[p.id] ?? 1}`}
              href={href({ kind: 'package', id: p.id })}
            >
              <ShotView shot={p.cover ?? p.hero} size="card" />
              <span className="card-scrim" aria-hidden="true" />
              <span className="card-body">
                <span className="chips">
                  {p.status !== 'released' && <span className="chip chip-soon">in progress</span>}
                </span>
                <span className="card-title">{p.name}</span>
                <span className="meta">
                  {[p.unityName, p.expected && `expected ${p.expected}`]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className="card-summary">{p.summary}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
