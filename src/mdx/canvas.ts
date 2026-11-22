import { useEffect, useRef, useState, type RefObject } from 'react'

/** The page's colours, read from CSS so a figure matches light and dark. */
export interface Palette {
  ink: string
  soft: string
  rule: string
  paper: string
  link: string
  handle: string
  /** a second data colour, for the thing being compared against */
  data2: string
}

function palette(el: Element): Palette {
  const css = getComputedStyle(el)
  const v = (n: string) => css.getPropertyValue(n).trim()
  return {
    ink: v('--ink'),
    soft: v('--ink-soft'),
    rule: v('--rule'),
    paper: v('--figure'),
    link: v('--link'),
    handle: v('--handle'),
    data2: v('--data-2'),
  }
}

/**
 * A crisp canvas that redraws itself: on its own resize, when the colour
 * scheme flips, and whenever `deps` change. `draw` gets a context already
 * scaled to CSS pixels, the size in CSS pixels, and the page's colours.
 */
export function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, c: Palette) => void,
  deps: unknown[],
) {
  const ref = useRef<HTMLCanvasElement>(null)
  const latest = useRef(draw)
  latest.current = draw
  const paint = useRef(() => {})

  // set up once: size to the box, and repaint on resize or a scheme flip
  useEffect(() => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    let colours = palette(c)
    paint.current = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = c.clientWidth
      const h = c.clientHeight
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr)
        c.height = Math.round(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      latest.current(ctx, w, h, colours)
    }
    const recolour = () => {
      colours = palette(c)
      paint.current()
    }
    paint.current()
    const ro = new ResizeObserver(() => paint.current())
    ro.observe(c)
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', recolour)
    return () => {
      ro.disconnect()
      scheme.removeEventListener('change', recolour)
    }
  }, [])

  // and paint again whenever what it shows changes
  useEffect(() => {
    paint.current()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

/** Whether the reader has asked for less motion. */
export const prefersStill = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Whether an element is on screen, or close to it. A figure that moves checks
 * this and stops its loop while nobody can see it.
 */
export function useOnScreen(ref: RefObject<Element | null>) {
  const [seen, setSeen] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), {
      rootMargin: '200px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return seen
}
