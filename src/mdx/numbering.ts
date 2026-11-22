import { createContext, useContext } from 'react'

// What a page's numbered things are called, by id: 'fog' -> 'Figure 1',
// 'beer-lambert' -> 'Equation 2', 'clouds' -> 'Section 3'. The page works them
// out once its text is on screen (Article.tsx) and <Ref to="..."> reads them.

export type Labels = Record<string, string>

/** The kinds of thing a page numbers, and the word each is referred to by. */
export const KINDS = {
  fig: 'Figure',
  eq: 'Equation',
  table: 'Table',
  listing: 'Listing',
} as const

export const LabelsContext = createContext<Labels>({})

export const useLabels = () => useContext(LabelsContext)

/** The label of everything numbered inside `root`, in the order it appears. */
export function collectLabels(root: HTMLElement): Labels {
  const out: Labels = {}
  for (const [kind, word] of Object.entries(KINDS)) {
    root.querySelectorAll<HTMLElement>(`[data-kind="${kind}"]`).forEach((el, i) => {
      if (el.id) out[el.id] = `${word} ${i + 1}`
    })
  }
  root.querySelectorAll<HTMLElement>('[data-n][id]').forEach((h) => {
    out[h.id] = `Section ${h.dataset.n}`
  })
  return out
}
