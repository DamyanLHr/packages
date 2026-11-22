import { useCallback } from 'react'
import type { UnityPackage } from '../catalog'
import { loadGuide } from '../content-index'
import { Article } from './Article'
import { PackageHead } from './PackageHead'

/** A package's guide: one long article. */
export function GuidePage({ pkg }: { pkg: UnityPackage }) {
  const load = useCallback(() => loadGuide(pkg.id), [pkg.id])
  return (
    <div className="page page-read enter">
      <PackageHead pkg={pkg} current="guide" />
      <Article load={load} numbered />
    </div>
  )
}
