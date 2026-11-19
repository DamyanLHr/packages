import { useId, type ReactNode } from 'react'
import { refAnchor, useReferences, type Reference } from './references'

// The components every guide and docs page can use without importing them.
// docs/AUTHORING.md shows each one; /packages/kit/ renders them all.

/** A remark set off from the text: a note, a tip, or a warning. */
export function Note({
  kind = 'note',
  title,
  children,
}: {
  kind?: 'note' | 'tip' | 'warning'
  title?: string
  children: ReactNode
}) {
  return (
    <aside className={`note note-${kind}`}>
      <p className="note-title">
        {title ?? { note: 'Note', tip: 'Tip', warning: 'Careful' }[kind]}
      </p>
      <div className="note-body">{children}</div>
    </aside>
  )
}

/**
 * An image with a caption. Use the package's own renders and diagrams: no
 * screenshots of other products and no vendor logos.
 */
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string
  alt: string
  caption?: ReactNode
  width?: number
  height?: number
}) {
  return (
    <figure className="figure">
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

/** A numbered citation of one of the page's references. */
export function Cite({ id }: { id: string }) {
  const refs = useReferences()
  const n = refs.findIndex((r) => r.id === id) + 1
  if (n === 0) {
    if (import.meta.env.DEV) console.error(`<Cite id="${id}"> has no entry in references`)
    return <sup className="cite cite-missing">[?]</sup>
  }
  const ref = refs[n - 1]
  return (
    <sup className="cite">
      <a href={`#${refAnchor(id)}`} aria-label={`Reference ${n}: ${ref.title}`}>
        [{n}]
      </a>
    </sup>
  )
}

/** The page's references, numbered as they are cited. ArticlePage adds it. */
export function References({ items }: { items: Reference[] }) {
  return (
    <section className="refs" aria-labelledby="references">
      <h2 id="references">References</h2>
      <ol>
        {items.map((r) => (
          <li key={r.id} id={refAnchor(r.id)}>
            {r.authors && <span className="ref-authors">{r.authors}. </span>}
            {r.url ? <a href={r.url}>{r.title}</a> : <span className="ref-title">{r.title}</span>}
            {r.where && <span className="ref-where">, {r.where}</span>}
            {r.year && <span>, {r.year}</span>}.
          </li>
        ))}
      </ol>
    </section>
  )
}

/**
 * An interactive figure: whatever the demo draws, its controls under it, and a
 * caption that says what to try. The demo itself is a component of the
 * package's own, in src/content/<id>/demos/.
 */
export function Demo({
  title,
  controls,
  children,
  caption,
  onReset,
  playing,
  onPlay,
}: {
  title: string
  controls?: ReactNode
  children: ReactNode
  caption?: ReactNode
  /** puts every number the figure owns back where it started */
  onReset?: () => void
  /** for a figure that moves on its own: whether it is moving, and the switch */
  playing?: boolean
  onPlay?: (playing: boolean) => void
}) {
  return (
    <figure className="demo" aria-label={title}>
      <div className="demo-stage">{children}</div>
      {(controls || onReset || onPlay) && (
        <div className="demo-controls">
          {controls}
          {(onReset || onPlay) && (
            <div className="demo-buttons">
              {onPlay && (
                <button type="button" className="demo-button" onClick={() => onPlay(!playing)}>
                  {playing ? 'Pause' : 'Play'}
                </button>
              )}
              {onReset && (
                <button type="button" className="demo-button" onClick={onReset}>
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <figcaption>
        <span className="demo-title">{title}.</span> {caption}
      </figcaption>
    </figure>
  )
}

/** A labelled slider for a demo, with its value printed beside it. */
export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  format = (v) => v.toFixed(2),
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  format?: (v: number) => string
}) {
  const id = useId()
  return (
    <div className="slider">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <output htmlFor={id}>{format(value)}</output>
    </div>
  )
}

/** A labelled on/off switch for a demo. */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

/** A public type in the API reference: a class, struct, enum or interface. */
export function ApiType({
  name,
  kind,
  namespace,
  children,
}: {
  name: string
  kind: 'class' | 'struct' | 'enum' | 'interface' | 'component' | 'asset'
  namespace?: string
  children: ReactNode
}) {
  const anchor = `api-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <section className="api-type" aria-labelledby={anchor}>
      <h3 id={anchor}>
        <span className="api-kind">{kind}</span> {name}
      </h3>
      {namespace && <p className="api-ns">{namespace}</p>}
      {children}
    </section>
  )
}

/** One member of a type: its C# signature, then what it does. */
export function ApiMember({ signature, children }: { signature: string; children: ReactNode }) {
  return (
    <div className="api-member">
      <pre className="api-sig">
        <code>{signature}</code>
      </pre>
      <div className="api-doc">{children}</div>
    </div>
  )
}
