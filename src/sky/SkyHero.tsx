import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { direction, skyRadiance, toDisplay } from './scatter'

// The home page's sky: a real single-scattering atmosphere you can drag the sun
// across. It is the first thing the site teaches, before a word is read.

const DEG = Math.PI / 180
/** the widest the view gets across */
const HFOV = 110 * DEG
/** how far down the picture the horizon sits */
const HORIZON = 0.66
/** the sun's resting place, low enough for colour */
const REST = { az: 10 * DEG, el: 5 * DEG }

/** Soft hills along the horizon, as an elevation per azimuth. */
function hill(az: number) {
  return (
    (1.6 +
      1.1 * Math.sin(az * 3.1 + 0.6) +
      0.7 * Math.sin(az * 7.3 + 2.1) +
      0.3 * Math.sin(az * 17.0)) *
    DEG
  )
}

/** A fixed scatter of stars: position (0..1) and brightness. */
const STARS = Array.from({ length: 140 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453
    return x - Math.floor(x)
  }
  return { x: r(1), y: r(2) * 0.8, b: 0.35 + 0.65 * r(3) }
})

interface Sun {
  az: number
  el: number
}

export function SkyHero({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [sun, setSun] = useState<Sun>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? REST
      : { az: REST.az, el: -4 * DEG },
  )
  const [touched, setTouched] = useState(false)
  const frame = useRef(0)
  const sharpen = useRef(0)

  // the box's size, kept in state so the picture's angular frame follows it
  const [box, setBox] = useState({ w: 1280, h: 600 })
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth || 1, h: el.clientHeight || 1 }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const frameFor = useCallback(() => {
    // wide boxes see 110 degrees across; tall ones (a phone) keep a sane
    // vertical angle and see less across instead
    const vfov = Math.min(62 * DEG, Math.max(28 * DEG, (HFOV * box.h) / box.w))
    const hfov = Math.min(HFOV, (vfov * box.w) / box.h)
    return { w: box.w, h: box.h, vfov, hfov, top: HORIZON * vfov }
  }, [box])

  const draw = useCallback(
    (s: Sun, columns: number) => {
      const c = canvas.current
      const ctx = c?.getContext('2d')
      if (!c || !ctx) return
      const { w, h, vfov, hfov, top } = frameFor()
      const W = columns
      const H = Math.max(8, Math.round((columns * h) / w))
      if (c.width !== W || c.height !== H) {
        c.width = W
        c.height = H
      }
      const img = ctx.createImageData(W, H)
      const sunDir = direction(s.az, s.el)
      const night = Math.min(1, Math.max(0, (-s.el - 2 * DEG) / (8 * DEG)))
      for (let y = 0; y < H; y++) {
        const el = top - ((y + 0.5) / H) * vfov
        for (let x = 0; x < W; x++) {
          const az = ((x + 0.5) / W - 0.5) * hfov
          // the sky, the land, and a pixel's worth of blend between them
          const sky = skyRadiance(direction(az, Math.max(el, 0.5 * DEG)), sunDir)
          const k = 0.05 + 0.1 * Math.max(0, Math.sin(s.el))
          const land = [sky[0] * k + 0.004, sky[1] * k + 0.006, sky[2] * k + 0.01]
          const a = Math.min(1, Math.max(0, (el - hill(az)) / (vfov / H) + 0.5))
          const air = el >= 0.5 * DEG ? sky : skyRadiance(direction(az, el), sunDir)
          // the night sky's own faint glow, so dusk ends in navy, not black
          const glow = 0.012 * night
          const [r, g, b] = toDisplay([
            land[0] * (1 - a) + (air[0] + glow * 0.25) * a,
            land[1] * (1 - a) + (air[1] + glow * 0.45) * a,
            land[2] * (1 - a) + (air[2] + glow) * a,
          ])
          const i = (y * W + x) * 4
          img.data[i] = r
          img.data[i + 1] = g
          img.data[i + 2] = b
          img.data[i + 3] = 255
        }
      }
      // after dusk the stars come out, over the sky but not the hills
      if (night > 0) {
        for (const st of STARS) {
          const x = Math.floor(st.x * W)
          const y = Math.floor(st.y * H)
          const el = top - ((y + 0.5) / H) * vfov
          const az = ((x + 0.5) / W - 0.5) * hfov
          if (el < hill(az) + 2 * DEG) continue
          const i = (y * W + x) * 4
          const add = 255 * st.b * night
          img.data[i] = Math.min(255, img.data[i] + add)
          img.data[i + 1] = Math.min(255, img.data[i + 1] + add)
          img.data[i + 2] = Math.min(255, img.data[i + 2] + add)
        }
      }
      ctx.putImageData(img, 0, 0)
    },
    [frameFor],
  )

  // draw coarse while the sun moves, then once more sharply when it rests
  useEffect(() => {
    cancelAnimationFrame(frame.current)
    window.clearTimeout(sharpen.current)
    frame.current = requestAnimationFrame(() => draw(sun, 120))
    sharpen.current = window.setTimeout(() => draw(sun, 240), 140)
  }, [sun, draw])

  // one sunrise when the page opens, unless motion is unwelcome
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 2400)
      const ease = 1 - Math.pow(1 - k, 3)
      setSun((s) => (k < 1 ? { az: s.az, el: -4 * DEG + ease * (REST.el + 4 * DEG) } : REST))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const stop = () => cancelAnimationFrame(raf)
    window.addEventListener('pointerdown', stop, { once: true })
    window.addEventListener('keydown', stop, { once: true })
    return () => {
      stop()
      window.removeEventListener('pointerdown', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [])

  const place = (e: PointerEvent) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const { vfov, hfov, top } = frameFor()
    const az = ((e.clientX - r.left) / r.width - 0.5) * hfov
    const elev = top - ((e.clientY - r.top) / r.height) * vfov
    setSun({
      az: Math.max(-hfov / 2, Math.min(hfov / 2, az)),
      el: Math.max(-14 * DEG, Math.min(top - 2 * DEG, elev)),
    })
    setTouched(true)
  }

  const key = (e: KeyboardEvent) => {
    const step = (e.shiftKey ? 5 : 1) * DEG
    const moves: Record<string, Partial<Sun>> = {
      ArrowUp: { el: sun.el + step },
      ArrowDown: { el: sun.el - step },
      ArrowRight: { az: sun.az + step * 2 },
      ArrowLeft: { az: sun.az - step * 2 },
      Home: { el: 45 * DEG },
      End: { el: -12 * DEG },
    }
    const m = moves[e.key]
    if (!m) return
    e.preventDefault()
    const { top, hfov } = frameFor()
    setSun((s) => ({
      az: Math.max(-hfov / 2, Math.min(hfov / 2, m.az ?? s.az)),
      el: Math.max(-14 * DEG, Math.min(top - 2 * DEG, m.el ?? s.el)),
    }))
    setTouched(true)
  }

  // where the sun sits on screen, as fractions of the box
  const { vfov, hfov, top } = frameFor()
  const sx = sun.az / hfov + 0.5
  const sy = (top - sun.el) / vfov
  const degrees = sun.el / DEG
  const said =
    degrees > 0.5
      ? `The sun is ${degrees.toFixed(0)}° above the horizon.`
      : degrees < -0.5
        ? `The sun is ${(-degrees).toFixed(0)}° below the horizon.`
        : 'The sun is on the horizon.'

  return (
    <section className="sky" ref={wrap} aria-label="An atmosphere you can light">
      <canvas
        ref={canvas}
        className="sky-canvas"
        aria-hidden="true"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          place(e)
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) place(e)
        }}
      />
      <div
        className="sun"
        role="slider"
        tabIndex={0}
        aria-label="Sun height"
        aria-valuemin={-14}
        aria-valuemax={Math.round(top / DEG)}
        aria-valuenow={Math.round(degrees)}
        aria-valuetext={said}
        data-set={sun.el < 0 ? '' : undefined}
        style={{ left: `${sx * 100}%`, top: `${sy * 100}%` }}
        onKeyDown={key}
        onPointerDown={(e) => {
          canvas.current?.setPointerCapture(e.pointerId)
        }}
      />
      <div className="sky-words">
        {children}
        <p className="sky-hint" aria-live="polite">
          {touched ? said : 'Drag the sun, or click anywhere in the sky.'}
        </p>
      </div>
    </section>
  )
}
