/// <reference types="vitest/config" />
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeShiki from '@shikijs/rehype'
import { BASE } from './src/site'
import { pages } from './src/pages-list'

/**
 * GitHub Pages serves a folder's index.html, so every page gets its own copy of
 * the app's HTML with its own title and description: a link to
 * /packages/sky/guide/ answers 200 with the right preview, not a 404 that the
 * app then fixes up. Anything else falls back to 404.html (the same app), which
 * shows the not-found page.
 */
function pageFiles(): Plugin {
  return {
    name: 'page-files',
    apply: 'build',
    writeBundle(options, bundle) {
      const entry = bundle['index.html']
      if (!entry || entry.type !== 'asset') return
      const outDir = options.dir ?? 'dist'
      const html = String(entry.source)
      const esc = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
      for (const page of pages()) {
        const out = html
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
        const dir = join(outDir, page.path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), out)
      }
      writeFileSync(join(outDir, '404.html'), html)
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          rehypeKatex,
          [rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }],
        ],
        providerImportSource: undefined,
      }),
    },
    react({ include: /\.(mdx|tsx|ts)$/ }),
    pageFiles(),
  ],
  test: {
    environment: 'node',
  },
})
