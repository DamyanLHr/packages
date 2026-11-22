import { useCallback } from 'react'
import type { UnityPackage } from '../catalog'
import { loadGuide } from '../content-index'
import { Article } from './Article'
import { href } from '../routes'
import { GuideEnd, Stanza } from './Matter'
import { PackageHead } from './PackageHead'

/** A package's guide: one long article. */
export function GuidePage({ pkg }: { pkg: UnityPackage }) {
  const load = useCallback(() => loadGuide(pkg.id), [pkg.id])
  return (
    <div className="page page-read enter">
      <PackageHead pkg={pkg} current="guide" />
      <Article
        load={load}
        numbered
        before={(mod) => <Stanza name={pkg.name} meta={mod.meta} />}
        after={(mod) =>
          // a guide still being written has nothing to revise or cite yet
          mod.meta && (
            <GuideEnd
              title={`How ${pkg.name} works`}
              meta={mod.meta}
              url={href({ kind: 'guide', id: pkg.id })}
            />
          )
        }
      />
    </div>
  )
}
