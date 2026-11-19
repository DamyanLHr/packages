import { useEffect, useState } from 'react'
import { parse, type Route } from './routes'

const EVENT = 'packages:navigate'

/** Goes to an address inside the site without reloading it. */
export function navigate(to: string) {
  if (to === location.pathname + location.hash) return
  history.pushState(null, '', to)
  window.dispatchEvent(new Event(EVENT))
}

/** The current route, kept in step with the address bar. */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.pathname))
  useEffect(() => {
    const update = () => setRoute(parse(location.pathname))
    window.addEventListener('popstate', update)
    window.addEventListener(EVENT, update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener(EVENT, update)
    }
  }, [])
  return route
}
