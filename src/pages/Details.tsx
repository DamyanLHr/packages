import { findPackage, type CompatGroup, type UnityPackage } from '../catalog'
import { Link } from '../router'
import { href } from '../routes'
import { longDate, SUPPORT_WORDS } from '../status'

// The package's sheet: what it runs on, what it cannot do, what it works
// with, its releases, how to get it and where to ask. It prints only what the
// catalog states; anything not settled yet reads "to be confirmed".

const TBC = <span className="tbc">To be confirmed</span>

function Compat({ groups }: { groups: CompatGroup[] }) {
  return (
    <div className="compat">
      {groups.map((g) => {
        const settled = g.rows.filter((r) => r.status !== 'unknown')
        return (
          <div className="compat-group" key={g.title}>
            <h4>{g.title}</h4>
            {settled.length === 0 ? (
              TBC
            ) : (
              <ul>
                {g.rows.map((r) => (
                  <li key={r.name} className={`compat-row compat-${r.status}`}>
                    <span className="compat-mark" aria-hidden="true" />
                    {/* a group of one (the Unity version) is named by its heading */}
                    {g.rows.length > 1 && <span className="compat-name">{r.name}</span>}
                    <span className="compat-status">
                      {r.status === 'yes' && r.note ? r.note : SUPPORT_WORDS[r.status]}
                      {r.status !== 'yes' && r.note ? `, ${r.note}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Details({ pkg }: { pkg: UnityPackage }) {
  const issues = pkg.repo ? `${pkg.repo.replace(/\/$/, '')}/issues` : undefined
  return (
    <section className="sheet" id="details" aria-labelledby="details-h">
      <h2 id="details-h" className="section-title">
        Details
      </h2>

      <div className="sheet-row" id="compatibility">
        <h3>Compatibility</h3>
        <Compat groups={pkg.compat} />
      </div>

      <div className="sheet-row" id="limitations">
        <h3>Limitations</h3>
        {pkg.limitations.length === 0 ? (
          <p>{TBC}</p>
        ) : (
          <ul className="sheet-list">
            {pkg.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
      </div>

      {pkg.integrations.length > 0 && (
        <div className="sheet-row" id="works-with">
          <h3>Works with</h3>
          <ul className="sheet-list sheet-list-plain">
            {pkg.integrations.map((i) => (
              <li key={i.with}>
                {i.id && findPackage(i.id) ? (
                  <Link className="sheet-strong" href={href({ kind: 'package', id: i.id })}>
                    {i.with}
                  </Link>
                ) : (
                  <span className="sheet-strong">{i.with}</span>
                )}
                <span>{i.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sheet-row" id="releases">
        <h3>Releases</h3>
        <div className="sheet-cols">
          <div>
            <h4>Changelog</h4>
            {pkg.releases.length === 0 ? (
              <p>
                No release yet{pkg.expected ? `. The first is expected in ${pkg.expected}` : ''}.
              </p>
            ) : (
              <ol className="releases">
                {pkg.releases.map((r) => (
                  <li key={r.version}>
                    <p className="release-head">
                      <span className="sheet-strong">{r.version}</span>
                      <time className="meta" dateTime={r.date}>
                        {longDate(r.date)}
                      </time>
                    </p>
                    <ul className="sheet-list">
                      {r.notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div>
            <h4>Planned</h4>
            {pkg.roadmap.length === 0 ? (
              <p>{TBC}</p>
            ) : (
              <ul className="sheet-list">
                {pkg.roadmap.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="sheet-row" id="get-it">
        <h3>Price and licence</h3>
        <div className="sheet-cols">
          <dl className="sheet-facts">
            <div>
              <dt>Price</dt>
              <dd>{pkg.price ?? TBC}</dd>
            </div>
            <div>
              <dt>Licence</dt>
              <dd>{pkg.licence ?? TBC}</dd>
            </div>
          </dl>
          <div className="sheet-action">
            <p>{pkg.store ? 'Sold' : 'It will be sold'} on the Unity Asset Store.</p>
            {pkg.store ? (
              <a className="btn" href={pkg.store}>
                Asset Store
              </a>
            ) : (
              <span className="btn btn-off">Asset Store soon</span>
            )}
          </div>
        </div>
      </div>

      <div className="sheet-row" id="demo">
        <h3>Trailer and demo</h3>
        <div className="sheet-cols">
          <div>
            <h4>Trailer</h4>
            <p>{pkg.trailer?.src ? <a href="#trailer">Watch it above</a> : 'To come.'}</p>
          </div>
          <div>
            <h4>Demo build</h4>
            {pkg.demo ? (
              <div className="sheet-action">
                <p>
                  {pkg.demo.platform}
                  {pkg.demo.note ? `. ${pkg.demo.note}` : ''}
                </p>
                <a className="btn" href={pkg.demo.url}>
                  Download the demo
                </a>
              </div>
            ) : (
              <p>To come: a build to run on your own hardware.</p>
            )}
          </div>
        </div>
      </div>

      <div className="sheet-row" id="support">
        <h3>Support</h3>
        <div className="sheet-action">
          <p>Bug reports and questions go to the package&rsquo;s issue tracker on GitHub.</p>
          {issues ? (
            <a className="btn" href={issues}>
              Open the issue tracker
            </a>
          ) : (
            <span className="btn btn-off">Issue tracker soon</span>
          )}
        </div>
      </div>
    </section>
  )
}
