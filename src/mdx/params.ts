import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

/** The numbers a page shares between its prose and its figures. */
export interface ParamStore {
  get: () => Record<string, number>
  set: (name: string, value: number) => void
  subscribe: (fn: () => void) => () => void
}

// outside any page, figures still work: they share this one
const fallback: ParamStore = createParams()

export const ParamsContext = createContext<ParamStore>(fallback)
export const useParams = () => useContext(ParamsContext)

/** A page's shared numbers: what the prose and the figures both read and set. */
export function createParams(initial: Record<string, number> = {}): ParamStore {
  let values = { ...initial }
  const subs = new Set<() => void>()
  return {
    get: () => values,
    set: (name, v) => {
      if (values[name] === v) return
      values = { ...values, [name]: v }
      subs.forEach((s) => s())
    },
    subscribe: (fn) => {
      subs.add(fn)
      return () => subs.delete(fn)
    },
  }
}

/**
 * One shared number, by name: the value, and a setter. `initial` is only a
 * fallback; the page's `params` export is where a number starts.
 */
export function useParam(name: string, initial: number): [number, (v: number) => void] {
  const store = useParams()
  const value = useSyncExternalStore(
    store.subscribe,
    () => store.get()[name] ?? initial,
    () => initial,
  )
  const set = useCallback((v: number) => store.set(name, v), [store, name])
  return [value, set]
}

/** Every shared number, for <Live>. */
export function useAllParams() {
  const store = useParams()
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
