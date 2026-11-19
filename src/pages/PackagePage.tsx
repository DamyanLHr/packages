import { useEffect } from 'react'
import { allShots, catalog, type Feature, type UnityPackage } from '../catalog'
import { CompareView, ShotView, Tile, Viewer } from '../media'
import { Link } from '../router'
import { href } from '../routes'
import { PORTFOLIO } from '../site'
import { statusLine } from '../status'

const anchor = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * How a section lays out its pictures, from how many it has: one wide; a pair,
 * one larger; three as one large beside two stacked; four or more as one wide
 * over a row.
 */
function shape(n: number) {
  if (n <= 1) return 'one'
  if (n === 2) return 'pair'
  if (n === 3) return 'split'
  return 'wide'
}

const isSplitAt = (f: Feature) => shape((f.compare ? 1 : 0) + f.shots.length) === 'split'

/** the split sections take turns putting their large picture left and right */
function flipsFor(features: Feature[]) {
  let splits = 0
  return features.map((f) => isSplitAt(f) && splits++ % 2 === 1)
}

function FeatureSection({ f, flip }: { f: Feature; flip: boolean }) {
  const lead = f.compare ? (
    <CompareView compare={f.compare} className="tile-lead" />
  ) : (
    <Tile shot={f.shots[0]} className="tile-lead" />
  )
  const rest = f.compare ? f.shots : f.shots.slice(1)
  const kind = shape(rest.length + 1)
  return (
    <section className="feature" id={anchor(f.title)} aria-labelledby={`${anchor(f.title)}-h`}>
      <header className="feature-head">
        <h2 id={`${anchor(f.title)}-h`}>{f.title}</h2>
        {f.text && <p>{f.text}</p>}
      </header>
      <div className={`shots shots-${kind}${flip ? ' shots-flip' : ''}`}>
        {lead}
        {kind === 'wide' ? (
          <div
            className={`shots-row shots-row-${rest.length % 3 === 0 ? 3 : rest.length % 2 === 0 ? 2 : 3}`}
          >
            {rest.map((s) => (
              <Tile key={s.title} shot={s} />
            ))}
          </div>
        ) : (
          rest.map((s) => <Tile key={s.title} shot={s} />)
        )}
      </div>
    </section>
  )
}

export function PackagePage({ pkg }: { pkg: UnityPackage }) {
  const facts: [string, string][] = [['Status', statusLine(pkg)]]
  if (pkg.pipelines) facts.push(['Render pipelines', pkg.pipelines])
  if (pkg.unityName) facts.push(['Package', pkg.unityName])
  const others = catalog.filter((p) => p.id !== pkg.id)
  const flips = flipsFor(pkg.features)
  // the page is drawn after load, so a link to one of its sections lands here, not at the top
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [pkg.id])
  return (
    <Viewer shots={allShots(pkg)}>
      <article className="pkg">
        <header className="pkg-hero">
          <ShotView shot={pkg.hero} size="hero" />
          <span className="pkg-hero-scrim" aria-hidden="true" />
          <div className="pkg-hero-body">
            <Link className="back" href={href({ kind: 'home' })}>
              &larr; all packages
            </Link>
            <h1 className="pkg-title">{pkg.name}</h1>
            <p className="pkg-summary">{pkg.summary}</p>
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
          </div>
        </header>

        <div className="pkg-strip">
          <dl className="facts">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div>
              <dt>Portfolio</dt>
              <dd>
                <a href={`${PORTFOLIO}projects/${pkg.portfolio}`}>{pkg.name} on the portfolio</a>
              </dd>
            </div>
          </dl>
          <nav className="jump" aria-label="On this page">
            {pkg.features.map((f) => (
              <a key={f.title} href={`#${anchor(f.title)}`}>
                {f.title}
              </a>
            ))}
          </nav>
        </div>

        {pkg.features.map((f, i) => (
          <FeatureSection key={f.title} f={f} flip={flips[i]} />
        ))}

        <section className="learn" aria-labelledby="learn-h">
          <h2 id="learn-h" className="learn-title">
            Learn it
          </h2>
          <div className="learn-ways">
            <Link className="way way-guide" href={href({ kind: 'guide', id: pkg.id })}>
              <span className="way-name">The guide</span>
              <span className="way-text">
                How {pkg.name} is built, part by part: its architecture, every subsystem in depth,
                what each costs, and the sources it builds on.
              </span>
              <span className="way-go">Read the guide</span>
            </Link>
            <Link className="way" href={href({ kind: 'docs', id: pkg.id })}>
              <span className="way-name">The docs</span>
              <span className="way-text">
                Installing it, setting it up, and its whole API, for when you are using it.
              </span>
              <span className="way-go">Open the docs</span>
            </Link>
          </div>
        </section>

        <section className="more" aria-labelledby="more-h">
          <h2 id="more-h" className="learn-title">
            More packages
          </h2>
          <div className="more-row">
            {others.map((p) => (
              <Link
                key={p.id}
                className="card card-small"
                href={href({ kind: 'package', id: p.id })}
              >
                <ShotView shot={p.cover ?? p.hero} size="card" />
                <span className="card-scrim" aria-hidden="true" />
                <span className="card-body">
                  <span className="card-title">{p.name}</span>
                  {p.expected && <span className="meta">expected {p.expected}</span>}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </Viewer>
  )
}
