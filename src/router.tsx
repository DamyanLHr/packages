import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from './nav'

/**
 * A link inside the site: a real <a href>, so it can be opened in a new tab,
 * copied or middle-clicked, that navigates in place on a plain click.
 */
export function Link({
  href,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const click = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return
    e.preventDefault()
    navigate(href)
    window.scrollTo(0, 0)
  }
  return <a href={href} onClick={click} {...rest} />
}
