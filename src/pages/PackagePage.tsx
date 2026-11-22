import { useEffect } from 'react'
import { anchor } from '../anchor'
import { allShots, catalog, type Feature, type Shot, type UnityPackage } from '../catalog'
import { CompareView, ShotView, Tile, Viewer } from '../media'
import { Link } from '../router'
import { href } from '../routes'
import { PORTFOLIO } from '../site'
import { pipelineLine, statusLine } from '../status'
import { Details } from './Details'

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

/** What a section can show now, and what it is still waiting for. */
function sort(f: Feature) {
  const compare = f.compare && f.compare.a.src && f.compare.b.src ? f.compare : undefined
  const ready = f.shots.filter((s) => s.src)
  const waiting = [
    ...(f.compare && !compare ? [f.compare.title] : []),
    ...f.shots.filter((s) => !s.src).map((s) => s.title),
  ]
  return { compare, ready, waiting, count: ready.length + (compare ? 1 : 0) }
}

/** the split sections take turns putting their large picture left and right */
function flipsFor(features: Feature[]) {
  let splits = 0
  return features.map((f) => shape(sort(f).count) === 'split' && splits++ % 2 === 1)
}

/**
 * A section with none of its pictures yet: one frame for the whole section,
 * naming what will go in it. A frame per missing picture made the page a wall
 * of empty boxes.
 */
function Waiting({ titles }: { titles: string[] }) {
  return (
    <div className="waiting">
      <span className="slot-corners" aria-hidden="true" />
      <p className="waiting-note">
        {titles.length === 1 ? 'Picture to come' : `${titles.length} pictures to come`}
      </p>
      <ul className="waiting-list">
        {titles.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  )
}

function FeatureSection({ f, flip }: { f: Feature; flip: boolean }) {
  const { compare, ready, waiting, count } = sort(f)
  const lead: Shot | undefined = compare ? undefined : ready[0]
  const rest = compare ? ready : ready.slice(1)
  const kind = shape(count)
  return (
    <section className="feature" id={anchor(f.title)} aria-labelledby={`${anchor(f.title)}-h`}>
      <header className="feature-head">
        <h2 id={`${anchor(f.title)}-h`}>{f.title}</h2>
        {f.text && <p>{f.text}</p>}
      </header>
      {count === 0 ? (
        <Waiting titles={waiting} />
      ) : (
        <>
          <div className={`shots shots-${kind}${flip ? ' shots-flip' : ''}`}>
            {compare && <CompareView compare={compare} className="tile-lead" />}
            {lead && <Tile shot={lead} className="tile-lead" />}
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
          {waiting.length > 0 && (
            <p className="waiting-line">Still to come: {waiting.join(', ')}.</p>
          )}
        </>
      )}
    </section>
  )
}

export function PackagePage({ pkg }: { pkg: UnityPackage }) {
  const facts: [string, string][] = [['Status', statusLine(pkg)]]
  const pipelines = pipelineLine(pkg)
  if (pipelines) facts.push(['Render pipelines', pipelines])
  if (pkg.unityName) facts.push(['Package', pkg.unityName])
  const others = catalog.filter((p) => p.id !== pkg.id)
  const flips = flipsFor(pkg.features)
  const trailer = pkg.trailer?.src ? pkg.trailer : undefined
  // the page is drawn after load, so a link to one of its sections lands here, not at the top
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [pkg.id])
  return (
    <Viewer shots={allShots(pkg)}>
      <article className="pkg enter">
        <header className="pkg-hero">
          <ShotView shot={pkg.hero} size="hero" />
          <span className="pkg-hero-scrim" aria-hidden="true" />
          <div className="pkg-hero-body">
            <Link className="back" href={href({ kind: 'home' })}>
              &larr; all packages
            </Link>
            <h1 className="pkg-title">{pkg.name}</h1>
            <span className="chips">
              {pkg.status !== 'released' && <span className="chip chip-soon">in progress</span>}
              <span className="chip">Unity package</span>
              {pkg.version && <span className="chip">version {pkg.version}</span>}
            </span>
            <p className="pkg-summary">{pkg.summary}</p>
            <div className="actions">
              {/* once it is on sale, buying it is the first thing the page offers */}
              {pkg.store && (
                <a className="btn btn-primary" href={pkg.store}>
                  Get it on the Asset Store
                </a>
              )}
              <Link
                className={`btn${pkg.store ? '' : ' btn-primary'}`}
                href={href({ kind: 'guide', id: pkg.id })}
              >
                Read the guide
              </Link>
              <Link className="btn" href={href({ kind: 'docs', id: pkg.id, page: '' })}>
                Docs
              </Link>
              {!pkg.store && <span className="btn btn-off">Asset Store soon</span>}
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
            {trailer && <a href="#trailer">Trailer</a>}
            {pkg.features.map((f) => (
              <a key={f.title} href={`#${anchor(f.title)}`}>
                {f.title}
              </a>
            ))}
            <a href="#details">Details</a>
          </nav>
        </div>

        {trailer && (
          <section className="feature" id="trailer" aria-labelledby="trailer-h">
            <header className="feature-head">
              <h2 id="trailer-h">Trailer</h2>
            </header>
            <div className="shots shots-one">
              <Tile shot={trailer} className="tile-lead tile-watch" watch />
            </div>
          </section>
        )}

        {pkg.features.map((f, i) => (
          <FeatureSection key={f.title} f={f} flip={flips[i]} />
        ))}

        <Details pkg={pkg} />

        <section className="learn" aria-labelledby="learn-h">
          <h2 id="learn-h" className="section-title">
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
            <Link className="way" href={href({ kind: 'docs', id: pkg.id, page: '' })}>
              <span className="way-name">The docs</span>
              <span className="way-text">
                Installing it, setting it up, and its whole API, for when you are using it.
              </span>
              <span className="way-go">Open the docs</span>
            </Link>
          </div>
        </section>

        <section className="more" aria-labelledby="more-h">
          <h2 id="more-h" className="section-title">
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
