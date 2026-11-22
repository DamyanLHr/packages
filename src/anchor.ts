/** The anchor a heading on a package page gets: 'Volumetric clouds' -> 'volumetric-clouds'. */
export const anchor = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
