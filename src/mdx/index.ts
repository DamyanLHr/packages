import { ApiMember, ApiType, Cite, Demo, Figure, H2, H3, Note, Slider, Toggle } from './components'
import { Live, Reveal, Scrub, Side } from './explorable'

/** What every guide and docs page can use without importing it. */
export const mdxComponents = {
  h2: H2,
  h3: H3,
  Note,
  Figure,
  Cite,
  Demo,
  Slider,
  Toggle,
  ApiType,
  ApiMember,
  Scrub,
  Live,
  Side,
  Reveal,
}
