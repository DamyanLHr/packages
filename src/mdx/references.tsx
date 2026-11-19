import { createContext, useContext } from 'react'

/**
 * Something a guide builds on: a paper, a talk, a book, documentation. A guide
 * lists them in `export const references = [...]` and cites them with
 * `<Cite id="..." />`; the page numbers them in that order and prints the
 * list at the end.
 */
export interface Reference {
  /** what `<Cite id>` uses: short and lowercase, 'hillaire2020' */
  id: string
  title: string
  authors?: string
  year?: number | string
  /** the journal, conference, book or site it appeared in */
  where?: string
  url?: string
}

export const ReferencesContext = createContext<Reference[]>([])

export const useReferences = () => useContext(ReferencesContext)

/** The anchor a reference's entry in the list carries. */
export const refAnchor = (id: string) => `ref-${id}`
