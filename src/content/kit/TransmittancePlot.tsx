import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { Demo } from '../../mdx/components'
import { useParam } from '../../mdx/params'
import { useCanvas } from '../../mdx/canvas'

// The same law as a curve: how much light is left after any distance. The
// point on the curve is the fog from the figure above, so dragging one moves
// the other.

const MAX_X = 5
const PAD = { l: 44, r: 16, t: 16, b: 36 }

export function TransmittancePlot() {
  const [sigma] = useParam('sigma', 0.8)
  const [d, setD] = useParam('d', 2)
  const drag = useRef(false)

  const ref = useCanvas(
    (ctx, w, h, c) => {
      const pw = w - PAD.l - PAD.r
      const ph = h - PAD.t - PAD.b
      const X = (x: number) => PAD.l + (x / MAX_X) * pw
      const Y = (t: number) => PAD.t + (1 - t) * ph

      // axes, with a few honest ticks
      ctx.strokeStyle = c.rule
      ctx.lineWidth = 1
      ctx.font = '12px "IBM Plex Mono", ui-monospace, monospace'
      ctx.fillStyle = c.soft
      for (const t of [0, 0.5, 1]) {
        ctx.beginPath()
        ctx.moveTo(PAD.l, Y(t))
        ctx.lineTo(w - PAD.r, Y(t))
        ctx.stroke()
        ctx.textAlign = 'right'
        ctx.fillText(`${t * 100}%`, PAD.l - 8, Y(t) + 4)
      }
      ctx.textAlign = 'center'
      for (let x = 0; x <= MAX_X; x++) ctx.fillText(`${x} m`, X(x), h - 12)

      // twice as dense, faintly, to compare against
      ctx.strokeStyle = c.data2
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      for (let i = 0; i <= 160; i++) {
        const x = (i / 160) * MAX_X
        const y = Y(Math.exp(-2 * sigma * x))
        if (i === 0) ctx.moveTo(X(x), y)
        else ctx.lineTo(X(x), y)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // the fog as it is
      ctx.strokeStyle = c.ink
      ctx.lineWidth = 2.25
      ctx.beginPath()
      for (let i = 0; i <= 160; i++) {
        const x = (i / 160) * MAX_X
        const y = Y(Math.exp(-sigma * x))
        if (i === 0) ctx.moveTo(X(x), y)
        else ctx.lineTo(X(x), y)
      }
      ctx.stroke()

      // the point you drag, with its reading
      const t = Math.exp(-sigma * d)
      ctx.strokeStyle = c.handle
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(X(d), Y(0))
      ctx.lineTo(X(d), Y(t))
      ctx.lineTo(PAD.l, Y(t))
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = c.handle
      ctx.beginPath()
      ctx.arc(X(d), Y(t), 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = c.ink
      ctx.font = '600 13px "IBM Plex Mono", ui-monospace, monospace'
      ctx.textAlign = X(d) > w - 150 ? 'right' : 'left'
      ctx.fillText(
        `${Math.round(t * 100)}% left after ${d.toFixed(1)} m`,
        X(d) + (X(d) > w - 150 ? -14 : 14),
        Math.max(PAD.t + 12, Y(t) - 12),
      )
    },
    [sigma, d],
  )

  const toD = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left - PAD.l) / (r.width - PAD.l - PAD.r)) * MAX_X
    setD(Math.round(Math.min(MAX_X, Math.max(0.1, x)) * 10) / 10)
  }
  const key = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 1 : 0.1
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setD(Math.min(MAX_X, +(d + step).toFixed(1)))
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown')
      setD(Math.max(0.1, +(d - step).toFixed(1)))
    else return
    e.preventDefault()
  }

  return (
    <Demo
      title="What is left after any distance"
      caption="The solid curve is the fog above; the dashed one is the same fog twice as dense. Drag the point along the curve."
    >
      <canvas
        ref={ref}
        className="demo-canvas"
        role="slider"
        tabIndex={0}
        aria-label="Distance through the fog"
        aria-valuemin={0.1}
        aria-valuemax={MAX_X}
        aria-valuenow={d}
        aria-valuetext={`${Math.round(100 * Math.exp(-sigma * d))}% of the light left after ${d.toFixed(1)} metres`}
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
