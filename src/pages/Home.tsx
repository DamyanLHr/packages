import { catalog } from '../catalog'
import { Link } from '../router'
import { href } from '../routes'
import { statusLine } from '../status'

export function Home() {
  return (
    <div className="page">
      <header className="home-head">
        <h1>Unity packages</h1>
        <p className="lede">
          A family of Unity packages I am building, starting with my volumetric sky. Each one has a
          guide that walks through how it works, with references, and docs that list its API and
          everything you need to use it.
        </p>
      </header>
      <ol className="pkg-list">
        {catalog.map((p) => (
          <li key={p.id}>
            <Link className="pkg-row" href={href({ kind: 'package', id: p.id })}>
              <span className="pkg-row-name">{p.name}</span>
              {p.unityName && <span className="pkg-row-id">{p.unityName}</span>}
              <span className="pkg-row-sum">{p.summary}</span>
              <span className="pkg-row-status">{statusLine(p)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
