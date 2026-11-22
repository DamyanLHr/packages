import { useEffect } from 'react'
import { findPackage } from './catalog'
import { pages } from './pages-list'
import { useRoute } from './nav'
import { Link } from './router'
import { href, type Route } from './routes'
import { BASE, PORTFOLIO, SITE_NAME } from './site'
import { Home } from './pages/Home'
import { PackagePage } from './pages/PackagePage'
import { ArticlePage } from './pages/ArticlePage'
import { KitPage } from './pages/KitPage'
import { NotFound } from './pages/NotFound'

export function App() {
  const route = useRoute()

  // the same titles the build writes into each page's HTML
  useEffect(() => {
    const path = location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length) : ''
    document.title = pages().find((p) => p.path === path)?.title ?? SITE_NAME
  }, [route])

  return (
    <div className="site">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="nav">
        <a className="mark" href={PORTFOLIO} aria-label="Damyan Hristov, portfolio">
          DH
        </a>
        <nav aria-label="Site">
          <Link
            className={`nav-link${route.kind === 'kit' || route.kind === 'not-found' ? '' : ' nav-on'}`}
            href={href({ kind: 'home' })}
          >
            Packages
          </Link>
          <a className="nav-link" href={PORTFOLIO}>
            Portfolio
          </a>
        </nav>
      </header>
      <main id="main">
        <Page route={route} />
      </main>
      <footer className="foot">
        <span>Damyan Hristov</span>
        <a href={PORTFOLIO}>damyanlhr.github.io</a>
      </footer>
    </div>
  )
}

function Page({ route }: { route: Route }) {
  if (route.kind === 'home') return <Home />
  if (route.kind === 'kit') return <KitPage />
  if (route.kind === 'not-found') return <NotFound />
  const pkg = findPackage(route.id)
  if (!pkg) return <NotFound />
  if (route.kind === 'package') return <PackagePage key={pkg.id} pkg={pkg} />
  return <ArticlePage key={`${pkg.id}/${route.kind}`} pkg={pkg} kind={route.kind} />
}
