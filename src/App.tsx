import { useEffect } from 'react'
import { findPackage } from './catalog'
import { pages } from './pages-list'
import { useRoute } from './nav'
import { Link } from './router'
import { href, type Route } from './routes'
import { BASE, PORTFOLIO, SITE_ISSUES, SITE_NAME } from './site'
import { SocialIcon } from './icons'
import { Search } from './search/Search'
import { Home } from './pages/Home'
import { PackagePage } from './pages/PackagePage'
import { GuidePage } from './pages/GuidePage'
import { DocsPage } from './pages/DocsPage'
import { findDocsPage } from './docs-pages'
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
          <Search />
        </nav>
      </header>
      <main id="main">
        <Page route={route} />
      </main>
      <footer className="foot">
        <div className="foot-who">
          <span>Damyan Hristov</span>
          <span className="foot-links">
            <SocialIcon brand="github" href="https://github.com/DamyanLHr" label="GitHub" />
            <SocialIcon brand="itch" href="https://damyanhr.itch.io/" label="itch.io" />
          </span>
        </div>
        <nav className="foot-nav" aria-label="Elsewhere">
          <a href={PORTFOLIO}>Portfolio</a>
          <a href={`${PORTFOLIO}cv`}>CV</a>
          <a href={SITE_ISSUES}>Report a problem with this site</a>
        </nav>
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
  if (route.kind === 'guide') return <GuidePage key={pkg.id} pkg={pkg} />
  const page = findDocsPage(route.page)
  if (!page) return <NotFound />
  return <DocsPage key={`${pkg.id}/${page.slug}`} pkg={pkg} page={page} />
}
