import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { navigate } from '../nav'
import { search, type Entry } from './match'

/**
 * Search over every package, guide and docs page. The index is fetched the
 * first time the search opens. Open it with the button, with / or with
 * Ctrl+K (Cmd+K on a Mac); the arrow keys move through the results.
 */
export function Search() {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [at, setAt] = useState(0)
  const id = useId()

  const [wanted, setWanted] = useState(false)

  const open = useCallback(() => {
    if (dialog.current?.open) return
    dialog.current?.showModal()
    input.current?.select()
    setWanted(true)
  }, [])

  // the index, fetched the first time the search is opened
  useEffect(() => {
    if (!wanted) return
    let live = true
    import('virtual:search-index').then(
      (m) => live && setEntries(m.default),
      () => live && setFailed(true),
    )
    return () => {
      live = false
    }
  }, [wanted])

  useEffect(() => {
    const key = (e: globalThis.KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open])

  const hits = entries ? search(entries, query) : []
  const picked = Math.min(at, hits.length - 1)

  const go = (u: string) => {
    dialog.current?.close()
    navigate(u)
    const hash = u.split('#')[1]
    if (!hash) window.scrollTo(0, 0)
    // a page already on screen will not scroll itself; one still loading does it when it lands
    else requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView())
  }

  const keys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAt(Math.min(picked + 1, hits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAt(Math.max(picked - 1, 0))
    } else if (e.key === 'Enter' && hits[picked]) {
      e.preventDefault()
      go(hits[picked].entry.u)
    }
  }

  return (
    <>
      <button type="button" className="search-open" onClick={open} aria-keyshortcuts="/ Control+K">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m10.5 10.5 3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>Search</span>
        <kbd aria-hidden="true">/</kbd>
      </button>
      <dialog
        ref={dialog}
        className="search"
        aria-label="Search the site"
        onClose={() => {
          setQuery('')
          setAt(0)
        }}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      >
        <div className="search-box">
          <input
            ref={input}
            type="search"
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls={`${id}-list`}
            aria-activedescendant={hits[picked] ? `${id}-${picked}` : undefined}
            aria-label="Search packages, guides and docs"
            placeholder="Search packages, guides and docs"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setAt(0)
            }}
            onKeyDown={keys}
          />
          <button
            type="button"
            className="btn search-close"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <ul className="search-hits" id={`${id}-list`} role="listbox" aria-label="Results">
          {hits.map((h, i) => (
            <li
              key={h.entry.u + h.entry.h}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === picked}
            >
              <a
                href={h.entry.u}
                tabIndex={-1}
                onClick={(e) => {
                  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                  e.preventDefault()
                  go(h.entry.u)
                }}
                onMouseMove={() => setAt(i)}
              >
                <span className="search-where">{h.entry.p}</span>
                <span className="search-head">{h.entry.h}</span>
                <span className="search-text">
                  {h.snippet[0]}
                  {h.snippet[1] && <mark>{h.snippet[1]}</mark>}
                  {h.snippet[2]}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="search-status" aria-live="polite">
          {failed
            ? 'The search could not be loaded. Try reloading the page.'
            : !entries
              ? 'Loading…'
              : query.trim() === ''
                ? 'Type to search. The arrow keys move through the results, and Enter opens one.'
                : hits.length === 0
                  ? `Nothing found for "${query.trim()}".`
                  : ''}
        </p>
      </dialog>
    </>
  )
}
