import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { createParams, ParamsContext, useAllParams, useParam } from './params'

// The parts that make a guide something you play with, not just read:
//
//   <Scrub name="sigma" />   a number in a sentence you can drag
//   <Live f={(p) => ...} />  a number in a sentence that answers the others
//   <Quiz />                 a question to check yourself, with the why
//   <Side>...</Side>         a note in the margin
//   <Reveal>...</Reveal>     the maths, folded until it is wanted
//
// Everything a reader can drag is drawn in one colour (--handle), in the text
// and in the figures, so it only has to be learned once.

/**
 * Holds a page's shared numbers, seeded from the page's own
 * `export const params = { ... }`.
 */
export function ParamsProvider({
  initial,
  children,
}: {
  initial?: Record<string, number>
  children: ReactNode
}) {
  const [store] = useState(() => createParams(initial))
  return <ParamsContext.Provider value={store}>{children}</ParamsContext.Provider>
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * A number in the text that you drag sideways to change (or focus and use the
 * arrow keys). Whatever else reads the same name, a figure or a <Live>,
 * follows it.
 */
export function Scrub({
  name,
  value: initial = 0,
  min,
  max,
  step = 0.1,
  unit = '',
  label,
  digits,
}: {
  name: string
  /** only a fallback: set where a number starts in the page's `params` */
  value?: number
  min: number
  max: number
  step?: number
  unit?: string
  /** what the number is, for screen readers: "fog density" */
  label: string
  digits?: number
}) {
  const [value, set] = useParam(name, initial)
  const start = useRef<{ x: number; v: number } | null>(null)
  const places = digits ?? Math.max(0, -Math.floor(Math.log10(step)))
  const snap = (v: number) => clamp(Math.round(v / step) * step, min, max)

  const down = (e: PointerEvent<HTMLSpanElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, v: value }
    e.preventDefault()
  }
  const move = (e: PointerEvent<HTMLSpanElement>) => {
    if (!start.current) return
    // the whole range across about 240 px of drag
    const dv = ((e.clientX - start.current.x) / 240) * (max - min)
    set(snap(start.current.v + dv))
  }
  const up = () => {
    start.current = null
  }
  const key = (e: KeyboardEvent) => {
    const big = e.shiftKey ? 10 : 1
    const moves: Record<string, number> = {
      ArrowRight: value + step * big,
      ArrowUp: value + step * big,
      ArrowLeft: value - step * big,
      ArrowDown: value - step * big,
      Home: min,
      End: max,
    }
    if (moves[e.key] === undefined) return
    e.preventDefault()
    set(snap(moves[e.key]))
  }
  const text = `${value.toFixed(places)}${unit}`
  return (
    <span
      className="scrub"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={text}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
    >
      {text}
    </span>
  )
}

/** A number in the text worked out from the page's shared numbers. */
export function Live({ f }: { f: (p: Record<string, number>) => ReactNode }) {
  const p = useAllParams()
  return <span className="live">{f(p)}</span>
}

/**
 * A question to check yourself on. Pick an answer and it says whether it is
 * right and why; a wrong one can be tried again.
 */
export function Quiz({
  question,
  options,
  answer,
  why,
}: {
  question: ReactNode
  options: ReactNode[]
  /** the index of the right option */
  answer: number
  why: ReactNode
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const id = useId()
  const right = picked === answer
  return (
    <div className="quiz" role="group" aria-labelledby={`${id}-q`}>
      <p className="quiz-q" id={`${id}-q`}>
        {question}
      </p>
      <div className="quiz-options">
        {options.map((o, i) => (
          <button
            key={i}
            type="button"
            className="quiz-option"
            aria-pressed={picked === i}
            data-verdict={picked === i ? (right ? 'right' : 'wrong') : undefined}
            disabled={right && i !== answer}
            onClick={() => setPicked(i)}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="quiz-why" aria-live="polite">
        {picked !== null &&
          (right ? (
            <p>
              <strong>Yes.</strong> {why}
            </p>
          ) : (
            <p>
              <strong>Not quite.</strong> Have another go.
            </p>
          ))}
      </div>
    </div>
  )
}

/**
 * A note in the margin beside the line it belongs to, numbered. On a narrow
 * screen it sits under the paragraph instead.
 */
export function Side({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="side-mark" aria-hidden="true" />
      <span className="side" role="note">
        {children}
      </span>
    </>
  )
}

/** Something folded away until the reader wants it: a derivation, a proof, the details. */
export function Reveal({
  title = 'Show the maths',
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <details className="reveal">
      <summary>{title}</summary>
      <div className="reveal-body">{children}</div>
    </details>
  )
}
