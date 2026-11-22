// Share images: what a link to each page shows when it is posted somewhere.
// One 1200 x 630 card per package and one for the home page, in the site's
// own look: the name, the summary and whose it is. Once a package has a hero
// picture, its card is drawn over it.
//
// Run by hand after a package is added, renamed, or gets its hero picture:
//
//   node scripts/og.mjs
//
// then look at every image in public/og/ before committing. It needs
// Playwright with Chromium, which is not one of the site's dependencies. A
// test fails if a package has no card.
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = join(import.meta.dirname, '..')
const { chromium } = createRequire(import.meta.url)('playwright')
const { catalog } = await import('../src/catalog.ts')

const font = (pkg, file) =>
  pathToFileURL(join(root, 'node_modules', '@fontsource', pkg, 'files', file))
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

function card({ title, text, label, picture }) {
  return `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: G; font-weight: 500; src: url(${font('space-grotesk', 'space-grotesk-latin-500-normal.woff2')}); }
@font-face { font-family: G; font-weight: 700; src: url(${font('space-grotesk', 'space-grotesk-latin-700-normal.woff2')}); }
@font-face { font-family: M; src: url(${font('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #0a0b0d; color: #ece9e4; font-family: G, sans-serif; overflow: hidden; }
.bg { position: absolute; inset: 0; background: ${
    picture
      ? `url(${picture}) center / cover`
      : 'radial-gradient(60% 80% at 82% 28%, rgba(255,106,0,.17), transparent 70%), radial-gradient(70% 60% at 100% 0%, rgba(188,38,22,.14), transparent 75%), #101216'
  }; }
.scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,11,13,.96) 8%, rgba(10,11,13,.55) 48%, rgba(10,11,13,${picture ? '.1' : '0'}) 80%), linear-gradient(to right, rgba(10,11,13,.6), transparent 60%); }
.in { position: absolute; inset: 0; padding: 64px 72px; display: flex; flex-direction: column; justify-content: flex-end; gap: 20px; }
.mark { position: absolute; top: 60px; left: 72px; font-weight: 700; font-size: 26px; letter-spacing: .06em; }
.label { font: 20px M, monospace; color: #8a8f98; }
h1 { font-size: ${title.length > 18 ? 84 : 104}px; line-height: .95; letter-spacing: -.035em; font-weight: 700; }
p { max-width: 900px; font-size: 30px; line-height: 1.35; font-weight: 500; color: #d2cfca; }
.rule { position: absolute; left: 0; right: 0; bottom: 0; height: 6px; background: linear-gradient(90deg, #460c10, #bc2616, #ff6a00, #ffb25c); }
</style><div class="bg"></div><div class="scrim"></div><div class="mark">DH</div>
<div class="in"><div class="label">${esc(label)}</div><h1>${esc(title)}</h1><p>${esc(text)}</p></div><div class="rule"></div>`
}

/** the summary, cut at a whole sentence or a whole word, so the card never overflows */
function short(text, max = 150) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const end = cut.lastIndexOf('. ')
  return end > 60 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

const cards = [
  {
    file: 'home',
    title: 'Unity packages',
    text: 'Each with a guide to how it is built, in depth, and docs for using it.',
    label: 'Damyan Hristov',
  },
  ...catalog.map((p) => {
    const still =
      p.hero.poster ?? (p.hero.src && !/\.(mp4|webm)$/.test(p.hero.src) ? p.hero.src : undefined)
    return {
      file: p.id,
      title: p.name,
      text: short(p.summary),
      label: 'Unity package · Damyan Hristov',
      picture: still ? pathToFileURL(join(root, 'public', still)) : undefined,
    }
  }),
]

const out = join(root, 'public', 'og')
mkdirSync(out, { recursive: true })
const tmp = join(root, '.og.tmp.html')
const browser = await chromium.launch(
  existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {},
)
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  for (const c of cards) {
    writeFileSync(tmp, card(c))
    await page.goto(pathToFileURL(tmp).href)
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: join(out, `${c.file}.jpg`), type: 'jpeg', quality: 88 })
    console.log(`public/og/${c.file}.jpg`)
  }
} finally {
  await browser.close()
  rmSync(tmp, { force: true })
}
