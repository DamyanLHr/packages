import { useEffect } from 'react'
import { loadKit } from '../content-index'
import { Article } from './Article'

/** Every component a guide can use, working, for whoever is writing one. Not linked anywhere. */
export function KitPage() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)
    return () => meta.remove()
  }, [])
  return (
    <div className="page page-read">
      <header className="page-head">
        <h1>Writing kit</h1>
        <p className="lead">
          Every component a guide or docs page can use, as it renders. The source is
          src/content/kit/kit.mdx.
        </p>
      </header>
      <Article load={loadKit} numbered />
    </div>
  )
}
