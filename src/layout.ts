// How the packages sit on the home page. When a package is added to (or
// removed from) the catalog, update this so the mosaic still fills its rows;
// a test fails until every package has a width and the rows add up.

/** Mosaic widths for the four-column grid, in catalog order: (2+1+1)(2+2). */
export const SPAN: Record<string, number> = {
  sky: 2,
  upscalers: 1,
  'terrain-rendering': 1,
  'terrain-dressing': 2,
  water: 2,
}

/** columns in the home page's mosaic on a desktop */
export const MOSAIC_COLUMNS = 4
