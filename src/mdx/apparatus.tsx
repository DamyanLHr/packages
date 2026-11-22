import { useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import { useLabels } from './numbering'

// The parts that make a guide a reference: equations, tables and listings that
// are numbered and can be pointed at, the fixed tables for a render pass and
// for measurements, and a comparison of two renders. docs/AUTHORING.md shows
// each one; /packages/kit/ renders them all.

/**
 * A reference to something numbered on the page, by its id: a figure, an
 * equation, a table, a listing or a section. It reads "Figure 2" and links
 * there.
 */
export function Ref({ to }: { to: string }) {
  const label = useLabels()[to]
  return (
    <a className={`xref${label ? '' : ' xref-missing'}`} href={`#${to}`}>
      {label ?? '[?]'}
    </a>
  )
}

/** A displayed equation with a number, so the text can refer to it. Wrap `$$ ... $$` in it. */
export function Equation({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <div className="equation" id={id} data-kind="eq">
      <div className="equation-body">{children}</div>
      <span className="equation-n" aria-hidden="true" />
    </div>
  )
}

/** A table with a number and a caption above it. Wrap a Markdown table in it. */
export function Table({
  id,
  caption,
  wide = false,
  children,
}: {
  id?: string
  caption: ReactNode
  /** take the margin too, for a table with many columns */
  wide?: boolean
  children: ReactNode
}) {
  return (
    <figure className={`table${wide ? ' numbered-wide' : ''}`} id={id} data-kind="table">
      <figcaption>{caption}</figcaption>
      <div className="table-scroll">{children}</div>
    </figure>
  )
}

/**
 * An excerpt of the package's own code with a number, the file it is from and
 * what it shows. Wrap a fenced code block in it.
 */
export function Listing({
  id,
  file,
  line,
  href,
  caption,
  children,
}: {
  id?: string
  /** the file, from the package's root: 'Runtime/Clouds/CloudMarch.hlsl' */
  file: string
  /** the line the excerpt starts at */
  line?: number
  /** a link to the file, where it is public */
  href?: string
  caption?: ReactNode
  children: ReactNode
}) {
  const where = `${file}${line ? `:${line}` : ''}`
  return (
    <figure className="listing" id={id} data-kind="listing">
      <figcaption>
        <span className="listing-what">{caption}</span>
        <span className="listing-file">{href ? <a href={href}>{where}</a> : where}</span>
      </figcaption>
      {children}
    </figure>
  )
}

/** A code block with a button that copies it. Every fenced block gets one. */
export function Pre(props: ComponentProps<'pre'>) {
  const pre = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const text = pre.current?.textContent ?? ''
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }
  return (
    <div className="code">
      <pre ref={pre} {...props} />
      <button type="button" className="code-copy" onClick={copy} aria-live="polite">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

/** One texture or buffer a render pass touches. */
export interface Resource {
  /** its name in the code: '_CloudScattering' */
  name: string
  /** 'Half', 'Full', '32 x 32 x 32', '256 x 64' */
  resolution: string
  /** 'R11G11B10_UFloat', 'RGBA16F' */
  format: string
  /** what it holds, where it comes from, how long it lives */
  notes?: ReactNode
}

/**
 * What one render pass reads and what it writes, in the same columns for
 * every pass, so the frame can be followed resource by resource.
 */
export function PassTable({
  id,
  name,
  reads,
  writes,
}: {
  id?: string
  /** the pass: 'Cloud raymarch' */
  name: string
  reads: Resource[]
  writes: Resource[]
}) {
  const group = (title: string, rows: Resource[]) => (
    <tbody>
      <tr className="table-group">
        <th colSpan={4} scope="rowgroup">
          {title}
        </th>
      </tr>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={4} className="tbc">
            Nothing
          </td>
        </tr>
      ) : (
        rows.map((r) => (
          <tr key={r.name}>
            <th scope="row">
              <code>{r.name}</code>
            </th>
            <td>{r.resolution}</td>
            <td>
              <code>{r.format}</code>
            </td>
            <td>{r.notes}</td>
          </tr>
        ))
      )}
    </tbody>
  )
  return (
    <figure className="table numbered-wide" id={id} data-kind="table">
      <figcaption>The {name} pass: what it reads and what it writes.</figcaption>
      <div className="table-scroll">
        <table className="pass-table">
          <thead>
            <tr>
              <th scope="col">Resource</th>
              <th scope="col">Resolution</th>
              <th scope="col">Format</th>
              <th scope="col">Notes</th>
            </tr>
          </thead>
          {group('Reads', reads)}
          {group('Writes', writes)}
        </table>
      </div>
    </figure>
  )
}

/**
 * Measurements as a table: what was measured down the side, the settings
 * across the top, and under it the conditions they hold for. A number without
 * its conditions is not a measurement, so `conditions` is required.
 */
export function Perf({
  id,
  caption,
  conditions,
  columns,
  rows,
  unit = 'ms',
  digits = 2,
}: {
  id?: string
  caption: ReactNode
  /** the GPU or GPUs if not in the rows, the resolution, the API, the Unity version, the scene */
  conditions: string
  /** the settings measured: ['Low', 'Medium', 'High'] */
  columns: string[]
  /** one row per thing measured (a GPU, a pass); `null` for a cell not measured */
  rows: { name: string; values: (number | null)[] }[]
  unit?: string
  digits?: number
}) {
  return (
    <figure className="table numbered-wide" id={id} data-kind="table">
      <figcaption>{caption}</figcaption>
      <div className="table-scroll">
        <table className="perf-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="tbc">{unit}</span>
              </th>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                {columns.map((c, i) => {
                  const v = r.values[i]
                  return (
                    <td key={c}>
                      {v == null ? <span className="tbc">not measured</span> : v.toFixed(digits)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-conditions">
        <span className="tbc">Measured on</span> {conditions || 'conditions missing'}
      </p>
    </figure>
  )
}

/**
 * Two renders of the same view, one over the other, with a line the reader
 * drags between them: a reference and the package, a low tier and a high one.
 */
export function Compare({
  id,
  caption,
  a,
  b,
}: {
  id?: string
  caption: ReactNode
  a: { src: string; label: string; alt: string }
  b: { src: string; label: string; alt: string }
}) {
  const [x, setX] = useState(50)
  return (
    <figure className="figure" id={id} data-kind="fig">
      <div className="tile compare compare-inline" style={{ '--x': `${x}%` } as CSSProperties}>
        <div className="compare-side compare-a">
          <img className="shot" src={a.src} alt={a.alt} loading="lazy" decoding="async" />
        </div>
        <div className="compare-side compare-b">
          <img className="shot" src={b.src} alt={b.alt} loading="lazy" decoding="async" />
        </div>
        <span className="compare-line" aria-hidden="true">
          <span className="compare-knob" />
        </span>
        <span className="compare-label compare-label-a" aria-hidden="true">
          {a.label}
        </span>
        <span className="compare-label compare-label-b" aria-hidden="true">
          {b.label}
        </span>
        <input
          className="compare-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          aria-label={`Drag between ${a.label} and ${b.label}`}
          aria-valuetext={`${x}% ${a.label}`}
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
