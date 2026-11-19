import { Link } from '../router'
import { href } from '../routes'

export function NotFound() {
  return (
    <div className="page">
      <h1>Nothing here</h1>
      <p className="lede">
        This page does not exist, or not yet.{' '}
        <Link href={href({ kind: 'home' })}>All packages</Link>
      </p>
    </div>
  )
}
