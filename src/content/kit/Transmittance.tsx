import { useEffect, useRef, useState } from 'react'
import { Demo, Slider } from '../../mdx/components'

/**
 * The example demo: how much light gets through a uniform medium, T = e^(-σd),
 * drawn for a density the reader picks. A package's own demos follow the same
 * shape: state, controls, and a drawing that redraws when the state changes.
 */
export function Transmittance() {
  const [sigma, setSigma] = useState(0.8)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = c.clientWidth
      const h = c.clientHeight
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const css = getComputedStyle(c)
      const ink = css.getPropertyValue('--ink').trim()
      const accent = css.getPropertyValue('--accent').trim()
      const rule = css.getPropertyValue('--rule').trim()
      ctx.clearRect(0, 0, w, h)
      const pad = 28
      const maxD = 5
      const x = (d: number) => pad + (d / maxD) * (w - pad * 2)
      const y = (t: number) => h - pad - t * (h - pad * 2)
      ctx.strokeStyle = rule
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pad, pad)
      ctx.lineTo(pad, h - pad)
      ctx.lineTo(w - pad, h - pad)
      ctx.stroke()
      ctx.fillStyle = ink
      ctx.font = '12px "IBM Plex Mono", monospace'
      ctx.fillText('T', 8, pad + 4)
      ctx.fillText('distance', w - pad - 64, h - 8)
      ctx.strokeStyle = accent
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i <= 200; i++) {
        const d = (i / 200) * maxD
        const px = x(d)
        const py = y(Math.exp(-sigma * d))
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(c)
    const dark = window.matchMedia('(prefers-color-scheme: dark)')
    dark.addEventListener('change', draw)
    return () => {
      ro.disconnect()
      dark.removeEventListener('change', draw)
    }
  }, [sigma])

  return (
    <Demo
      title="Transmittance through a uniform medium"
      caption="Raise the density and watch how quickly the light that gets through falls away."
      controls={
        <Slider
          label="Density σ"
          value={sigma}
          onChange={setSigma}
          min={0.05}
          max={3}
          step={0.05}
        />
      }
    >
      <canvas
        ref={canvas}
        className="demo-canvas"
        role="img"
        aria-label={`Transmittance falling with distance at density ${sigma.toFixed(2)}`}
      />
    </Demo>
  )
}
