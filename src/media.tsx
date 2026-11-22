import {
  createContext,
  useContext,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import type { Compare, Shot } from './catalog'
import { BASE } from './site'

// The package's own pictures and clips, and the frames they go in. A shot
// without a `src` yet is drawn as a viewfinder, so every page has its final
// shape, and shows what is coming, before the media exists.

const isClip = (src: string) => /\.(mp4|webm)$/i.test(src)
const url = (src: string) => `${BASE}${src.replace(/^\//, '')}`
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Size = 'hero' | 'band' | 'card' | 'tile'

/** An empty frame, waiting for its picture: corners, a centre mark, and what goes here. */
function Slot({ shot, size }: { shot: Shot; size: Size }) {
  return (
    <div className={`slot slot-${size}`} role="img" aria-label={`${shot.title}: picture to come`}>
      <span className="slot-corners" aria-hidden="true" />
      <span className="slot-cross" aria-hidden="true" />
      {/* a tile and a card name themselves over the frame; the band and the hero say what is coming */}
      {size === 'band' && (
        <span className="slot-words" aria-hidden="true">
          <span className="slot-title">{shot.title}</span>
          <span className="slot-note">Renders to come</span>
        </span>
      )}
      {size === 'hero' && (
        <span className="slot-words slot-words-top" aria-hidden="true">
          <span className="slot-note">Showcase to come</span>
        </span>
      )}
    </div>
  )
}

/** A shot in any of its sizes: the hero, the home band, the art behind a card, or a tile. */
export function ShotView({
  shot,
  size,
  watch = false,
}: {
  shot: Shot
  size: Size
  /** a clip to sit down and watch (a trailer): controls and sound, started by the viewer */
  watch?: boolean
}) {
  if (!shot.src) return <Slot shot={shot} size={size} />
  if (isClip(shot.src)) {
    const quiet = still() || watch
    return (
      <video
        className={`shot shot-${size}`}
        src={url(shot.src)}
        poster={shot.poster ? url(shot.poster) : undefined}
        aria-label={shot.alt ?? shot.title}
        autoPlay={!quiet}
        controls={quiet}
        muted={!watch}
        loop={!watch}
        playsInline
        preload="metadata"
      />
    )
  }
  return (
    <img
      className={`shot shot-${size}`}
      src={url(shot.src)}
      alt={shot.alt ?? shot.title}
      loading={size === 'hero' || size === 'band' ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

// ---------- the viewer: every finished picture on a page, full size ----------

interface ViewerApi {
  open: (s: Shot) => void
  canOpen: (s: Shot) => boolean
}

const ViewerContext = createContext<ViewerApi>({ open: () => {}, canOpen: () => false })

/**
 * Lets every tile inside open full size in one dialog that steps through all
 * the page's finished pictures: the buttons, or the arrow keys; Escape closes.
 */
export function Viewer({ shots, children }: { shots: Shot[]; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [at, setAt] = useState(-1)
  const items = shots.filter((s) => s.src && !isClip(s.src))
  const step = (d: number) => setAt((k) => (k + d + items.length) % items.length)
  const api: ViewerApi = {
    open: (s) => {
      const k = items.indexOf(s)
      if (k < 0) return
      setAt(k)
      dialog.current?.showModal()
    },
    canOpen: (s) => items.includes(s),
  }
  const cur = items[at]
  const many = items.length > 1
  return (
    <ViewerContext.Provider value={api}>
      {children}
      <dialog
        ref={dialog}
        className="viewer"
        aria-label="Full size"
        onClose={() => setAt(-1)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onKeyDown={(e) => {
          if (!many) return
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
      >
        {cur?.src && (
          <figure>
            <img src={url(cur.src)} alt={cur.alt ?? cur.title} />
            <figcaption>
              <span>{cur.title}</span>
              {many && (
                <span className="meta">
                  {at + 1} of {items.length}
                </span>
              )}
            </figcaption>
          </figure>
        )}
        <div className="viewer-bar">
          {many && (
            <>
              <button type="button" className="btn" onClick={() => step(-1)}>
                Previous
              </button>
              <button type="button" className="btn" onClick={() => step(1)}>
                Next
              </button>
            </>
          )}
          <button
            type="button"
            className="btn viewer-close"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
      </dialog>
    </ViewerContext.Provider>
  )
}

/** One picture on a package page, named over its lower edge; a finished one opens full size. */
export function Tile({
  shot,
  className = '',
  watch = false,
}: {
  shot: Shot
  className?: string
  watch?: boolean
}) {
  const viewer = useContext(ViewerContext)
  const openable = viewer.canOpen(shot)
  return (
    <figure className={`tile ${className}`}>
      {openable ? (
        <button
          type="button"
          className="tile-open"
          onClick={() => viewer.open(shot)}
          aria-label={`${shot.title}, full size`}
        >
          <ShotView shot={shot} size="tile" />
        </button>
      ) : (
        <ShotView shot={shot} size="tile" watch={watch} />
      )}
      <figcaption className="tile-cap">
        <span>{shot.title}</span>
        {!shot.src && <span className="slot-note">to come</span>}
      </figcaption>
    </figure>
  )
}

/**
 * Two captures of one view, one over the other, split by a line the reader
 * drags (or moves with the arrow keys). Dotted ember, because it can be dragged.
 */
export function CompareView({ compare, className = '' }: { compare: Compare; className?: string }) {
  const [x, setX] = useState(50)
  const { a, b } = compare
  const waiting = !a.src || !b.src
  return (
    <figure className={`tile compare ${className}`} style={{ '--x': `${x}%` } as CSSProperties}>
      <div className="compare-side compare-a">
        <ShotView shot={a} size="card" />
      </div>
      <div className="compare-side compare-b">
        <ShotView shot={b} size="card" />
      </div>
      <span className="compare-line" aria-hidden="true">
        <span className="compare-knob" />
      </span>
      <span className="compare-label compare-label-a" aria-hidden="true">
        {a.title}
      </span>
      <span className="compare-label compare-label-b" aria-hidden="true">
        {b.title}
      </span>
      <input
        className="compare-range"
        type="range"
        min={0}
        max={100}
        step={1}
        value={x}
        onChange={(e) => setX(Number(e.target.value))}
        aria-label={`${compare.title}: drag between ${a.title} and ${b.title}`}
        aria-valuetext={`${x}% ${a.title}`}
      />
      <figcaption className="tile-cap">
        <span>{compare.title}</span>
        {waiting && <span className="slot-note">to come</span>}
      </figcaption>
    </figure>
  )
}
