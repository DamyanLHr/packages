// The pages every package's docs have, in reading order. Plain data: the
// build reads it too, to write an HTML file per page.
//
// Each page is src/content/<id>/docs/<file>.mdx. A page that has no file yet
// still has its address and its place in the sidebar, and says it is being
// written, so the docs keep one shape across packages and links never break.

export interface DocsPageInfo {
  /** the last part of its address: /packages/<id>/docs/<slug>/ ('' is the docs' first page) */
  slug: string
  /** its file: src/content/<id>/docs/<file>.mdx */
  file: string
  title: string
  /** what the page covers, in one sentence; shown until the page is written */
  about: string
}

export const DOCS_PAGES: DocsPageInfo[] = [
  {
    slug: '',
    file: 'quick-start',
    title: 'Quick start',
    about:
      'Installing the package and getting a first result in a scene, in as few steps as it takes.',
  },
  {
    slug: 'setup',
    file: 'setup',
    title: 'Setup',
    about:
      'Setting the package up in a project step by step: the render pipeline, the project settings it needs, and the sample scenes.',
  },
  {
    slug: 'components',
    file: 'components',
    title: 'Components',
    about:
      'Every component and asset the package adds, and what each of its settings does and costs.',
  },
  {
    slug: 'api',
    file: 'api',
    title: 'Scripting API',
    about: 'Every public type and member, for driving the package from code.',
  },
  {
    slug: 'integrations',
    file: 'integrations',
    title: 'Integrations',
    about: 'Using the package with my other packages and with other assets.',
  },
  {
    slug: 'troubleshooting',
    file: 'troubleshooting',
    title: 'Troubleshooting',
    about: 'The usual problems by symptom, with their causes and fixes.',
  },
]

export const findDocsPage = (slug: string) => DOCS_PAGES.find((p) => p.slug === slug)
