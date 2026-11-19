import { useRef, useState } from 'react'
import type { Shot } from './catalog'
import { BASE } from './site'

// The package's own pictures and clips, and the frames they go in. A shot
// without a `src` yet is drawn as a viewfinder with its caption, so every page
// has its final shape, and shows what is coming, before the media exists.

const isClip = (src: string) => /\.(mp4|webm)$/i.test(src)
const url = (src: string) => `${BASE}${src.replace(/^\//, '')}`
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** An empty frame, waiting for its screenshot: corners, a centre mark, and what goes here. */
function Slot({ shot, size }: { shot: Shot; size: 'band' | 'card' | 'tile' }) {
  return (
    <div
      className={`slot slot-${size}`}
      role="img"
      aria-label={`${shot.title}: screenshot to come`}
    >
      <span className="slot-corners" aria-hidden="true" />
      <span className="slot-cross" aria-hidden="true" />
      {/* a tile's caption sits under it, and a card's on it, so only the band names itself */}
      {size === 'band' && (
        <span className="slot-words" aria-hidden="true">
          <span className="slot-title">{shot.title}</span>
          <span className="slot-note">Renders to come</span>
        </span>
      )}
      {size === 'tile' && (
        <span className="slot-words" aria-hidden="true">
          <span className="slot-note">Screenshot to come</span>
        </span>
      )}
    </div>
  )
}

/**
 * A shot in any of its three sizes: the wide band at the top of a page, the
 * art behind a card, or a tile in a gallery.
 */
export function ShotView({ shot, size }: { shot: Shot; size: 'band' | 'card' | 'tile' }) {
  if (!shot.src) return <Slot shot={shot} size={size} />
  if (isClip(shot.src)) {
    const quiet = still()
    return (
      <video
        className={`shot shot-${size}`}
        src={url(shot.src)}
        poster={shot.poster ? url(shot.poster) : undefined}
        aria-label={shot.alt ?? shot.title}
        autoPlay={!quiet}
        controls={quiet}
        muted
        loop
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
      loading={size === 'band' ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

/**
 * A package's screenshots, two to a row. A finished one opens full size in a
 * dialog (Escape or the button closes it); an empty slot just waits.
 */
export function Gallery({ shots }: { shots: Shot[] }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState<Shot | null>(null)
  const show = (s: Shot) => {
    setOpen(s)
    dialog.current?.showModal()
  }
  return (
    <>
      <ul className="gallery">
        {shots.map((s) => (
          <li key={s.title}>
            <figure className="tile">
              {s.src && !isClip(s.src) ? (
                <button
                  type="button"
                  className="tile-open"
                  onClick={() => show(s)}
                  aria-label={`${s.title}, full size`}
                >
                  <ShotView shot={s} size="tile" />
                </button>
              ) : (
                <ShotView shot={s} size="tile" />
              )}
              <figcaption>{s.title}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        className="viewer"
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      >
        {open?.src && (
          <figure>
            <img src={url(open.src)} alt={open.alt ?? open.title} />
            <figcaption>{open.title}</figcaption>
          </figure>
        )}
        <button type="button" className="btn viewer-close" onClick={() => dialog.current?.close()}>
          Close
        </button>
      </dialog>
    </>
  )
}
