import { useCallback } from 'react'
import type { UnityPackage } from '../catalog'
import { loadArticle } from '../content-index'
import { Article } from './Article'
import { PackageHead } from './PackageHead'

export function ArticlePage({ pkg, kind }: { pkg: UnityPackage; kind: 'guide' | 'docs' }) {
  const load = useCallback(() => loadArticle(pkg.id, kind), [pkg.id, kind])
  return (
    <div className="page page-wide">
      <PackageHead pkg={pkg} current={kind} />
      <Article load={load} />
    </div>
  )
}
