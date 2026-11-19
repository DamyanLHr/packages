import { catalog } from '../catalog'
import { ShotView } from '../media'
import { Link } from '../router'
import { SPAN } from '../layout'
import { href } from '../routes'

export function Home() {
  const featured = catalog[0]
  return (
    <>
      <Link
        className="band band-show"
        href={href({ kind: 'package', id: featured.id })}
        aria-label={`${featured.name}: ${featured.hero.title}`}
      >
        <ShotView shot={featured.hero} size="band" />
      </Link>
      <section className="page page-wide">
        <header className="page-head">
          <h1>Unity packages</h1>
          <p className="lead">
            Unity packages I am building, starting with my volumetric sky. Each one comes with a
            guide that teaches how it works, with figures you can play with and the sources it
            builds on, and docs for installing it and looking up its API.
          </p>
        </header>
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
    </>
  )
}
