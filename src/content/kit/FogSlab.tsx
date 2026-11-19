import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Demo, Slider } from '../../mdx/components'
import { useParam } from '../../mdx/params'
import { prefersStill, useCanvas } from '../../mdx/canvas'

// Photons fired into a slab of fog, one at a time, each surviving every small
// step with the chance the Beer-Lambert law gives it. Count the ones that
// reach the far side and you measure transmittance by hand; the law's own
// answer sits beside the count.

const LEFT = 0.16 // where the fog starts, as a fraction of the width
const MAX_D = 5 // metres the figure can show
const SPEED = 2.2 // metres per second

/** fixed specks of fog, placed once */
const SPECKS = Array.from({ length: 220 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 91.7 + n * 47.3) * 43758.5453
    return x - Math.floor(x)
  }
  return { x: r(1), y: r(2), r: 0.6 + r(3) * 1.6 }
})

interface Photon {
  x: number // metres from the start of the fog (negative: still on its way)
  y: number // 0..1 down the figure
  dead: number // seconds since it was lost, or -1
}

export function FogSlab() {
  const [sigma, setSigma] = useParam('sigma', 0.8)
  const [d, setD] = useParam('d', 2)
  const [playing, setPlaying] = useState(() => !prefersStill())
  const photons = useRef<Photon[]>([])
  const count = useRef({ sent: 0, through: 0, lost: 0 })
  const [frame, tick] = useState(0)
  const drag = useRef(false)

  // the simulation: its own clock, so a slow frame does not change the odds
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    let spawn = 0
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      spawn += dt
      while (spawn > 0.045) {
        spawn -= 0.045
        photons.current.push({ x: -0.9, y: 0.12 + Math.random() * 0.76, dead: -1 })
        count.current.sent++
      }
      const survive = Math.exp(-sigma * SPEED * dt)
      for (const p of photons.current) {
        if (p.dead >= 0) {
          p.dead += dt
          continue
        }
        const before = p.x
        p.x += SPEED * dt
        if (before >= 0 && before < d && Math.random() > survive) {
          p.dead = 0
          count.current.lost++
        } else if (before < d && p.x >= d) count.current.through++
      }
      photons.current = photons.current.filter((p) =>
        p.dead < 0 ? p.x < MAX_D + 1.2 : p.dead < 0.5,
      )
      tick((t) => t + 1)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing, sigma, d])

  // a new slab is a new experiment
  useEffect(() => {
    count.current = { sent: 0, through: 0, lost: 0 }
    photons.current = []
  }, [sigma, d])

  const ref = useCanvas(
    (ctx, w, h, c) => {
      const x0 = w * LEFT
      const scale = (w * (1 - LEFT - 0.12)) / MAX_D
      const x1 = x0 + d * scale
      // the fog: a faint wash and drifting specks, denser looks thicker
      ctx.fillStyle = c.link
      ctx.globalAlpha = Math.min(0.32, 0.04 + sigma * 0.08)
      ctx.fillRect(x0, 0, x1 - x0, h)
      ctx.globalAlpha = Math.min(0.5, 0.1 + sigma * 0.14)
      for (const s of SPECKS) {
        ctx.beginPath()
        ctx.arc(x0 + s.x * (x1 - x0), s.y * h, s.r * (1 + sigma * 0.4), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      // the lamp
      ctx.fillStyle = c.ink
      ctx.beginPath()
      ctx.arc(x0 * 0.35, h / 2, 9, 0, Math.PI * 2)
      ctx.fill()
      // still: twelve rays, each going as far as the law says a photon of its
      // luck would, so the picture teaches without moving
      if (!playing && photons.current.length === 0) {
        for (let i = 0; i < 12; i++) {
          const py = h * (0.12 + (0.76 * (i + 0.5)) / 12)
          const reach = -Math.log((i + 0.5) / 12) / sigma
          const lost = reach < d
          const end = x0 + Math.min(reach, lost ? reach : MAX_D) * scale
          ctx.strokeStyle = c.ink
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(x0 * 0.35 + 12, py)
          ctx.lineTo(lost ? end : w - 12, py)
          ctx.stroke()
          if (lost) {
            ctx.strokeStyle = c.data2
            ctx.beginPath()
            ctx.arc(end, py, 4, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      }
      // photons: alive in ink, lost ones flare and fade in the second colour
      for (const p of photons.current) {
        const px = x0 + p.x * scale
        const py = p.y * h
        if (px < x0 * 0.35) continue
        if (p.dead >= 0) {
          ctx.globalAlpha = 1 - p.dead / 0.5
          ctx.strokeStyle = c.data2
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(px, py, 2 + p.dead * 14, 0, Math.PI * 2)
          ctx.stroke()
          ctx.globalAlpha = 1
        } else {
          ctx.fillStyle = c.ink
          ctx.beginPath()
          ctx.arc(px, py, 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      // the far edge of the fog: the handle
      ctx.fillStyle = c.handle
      ctx.fillRect(x1 - 2, 0, 4, h)
      ctx.beginPath()
      ctx.roundRect(x1 - 7, h / 2 - 18, 14, 36, 7)
      ctx.fill()
      ctx.fillStyle = c.paper
      for (const k of [-6, 0, 6]) ctx.fillRect(x1 - 3, h / 2 + k - 0.75, 6, 1.5)
      // the measurement
      const { through, lost } = count.current
      const settled = through + lost
      ctx.fillStyle = c.ink
      ctx.font = '600 13px "IBM Plex Mono", ui-monospace, monospace'
      ctx.textAlign = 'right'
      const still = !playing && photons.current.length === 0
      const measured = still
        ? `${Math.round(100 * Math.exp(-sigma * d))}% get through`
        : settled >= 60
          ? `${Math.round((100 * through) / settled)}% of ${settled} got through`
          : 'counting…'
      ctx.fillText(measured, w - 10, 22)
      ctx.fillStyle = c.soft
      ctx.font = '13px "IBM Plex Mono", ui-monospace, monospace'
      if (!still)
        ctx.fillText(`the law says ${Math.round(100 * Math.exp(-sigma * d))}%`, w - 10, 40)
    },
    [sigma, d, playing, frame],
  )

  // drag the far edge to make the slab thicker or thinner
  const toD = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x0 = r.width * LEFT
    const scale = (r.width * (1 - LEFT - 0.12)) / MAX_D
    setD(Math.round(Math.min(MAX_D, Math.max(0.1, (e.clientX - r.left - x0) / scale)) * 10) / 10)
  }
  const key = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 1 : 0.1
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setD(Math.min(MAX_D, +(d + step).toFixed(1)))
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown')
      setD(Math.max(0.1, +(d - step).toFixed(1)))
    else return
    e.preventDefault()
  }

  return (
    <Demo
      title="Firing photons into fog"
      caption="Each dot is a photon. Inside the fog it can be lost at any moment, and the rings show where. Drag the fog's far edge, or change its density, and watch the count settle on the law's answer."
      playing={playing}
      onPlay={setPlaying}
      onReset={() => {
        setSigma(0.8)
        setD(2)
      }}
      controls={
        <Slider
          label="Density σ (per metre)"
          value={sigma}
          onChange={setSigma}
          min={0.05}
          max={3}
          step={0.05}
        />
      }
    >
      <canvas
        ref={ref}
        className="demo-canvas demo-canvas-wide"
        role="slider"
        tabIndex={0}
        aria-label="Thickness of the fog"
        aria-valuemin={0.1}
        aria-valuemax={MAX_D}
        aria-valuenow={d}
        aria-valuetext={`${d.toFixed(1)} metres of fog; the law says ${Math.round(100 * Math.exp(-sigma * d))}% of the light gets through`}
        onKeyDown={key}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drag.current = true
          toD(e)
        }}
        onPointerMove={(e) => drag.current && toD(e)}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
      />
    </Demo>
  )
}
