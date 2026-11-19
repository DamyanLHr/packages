import { catalog } from '../catalog'
import { Link } from '../router'
import { href } from '../routes'
import { SkyHero } from '../sky/SkyHero'
import { statusLine } from '../status'

export function Home() {
  return (
    <>
      <SkyHero>
        <h1>Unity packages</h1>
      </SkyHero>
      <div className="home-body">
        <p className="lede">
          Unity packages I am building, starting with my volumetric sky. Each one comes with a guide
          that teaches how it works, with figures you can drag and play with and the sources it
          builds on, and docs for installing it and looking up its API.
        </p>
        <ol className="pkg-list">
          {catalog.map((p) => (
            <li key={p.id}>
              <Link className="pkg-row" href={href({ kind: 'package', id: p.id })}>
                <span className="pkg-row-name">{p.name}</span>
                {p.unityName && <code className="pkg-row-id">{p.unityName}</code>}
                <span className="pkg-row-sum">{p.summary}</span>
                <span className="pkg-row-status">{statusLine(p)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}
