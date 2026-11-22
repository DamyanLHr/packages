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
import { BASE, ORIGIN } from './src/site'
import { pages } from './src/pages-list'
import { buildIndex } from './build/search-index'

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
      const all = pages()
      for (const page of all) {
        const url = `${ORIGIN}${BASE}${page.path}`
        // what a link to the page shows when it is posted somewhere
        const share = [
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:site_name" content="Unity packages by Damyan Hristov" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:title" content="${esc(page.title)}" />`,
          `<meta property="og:description" content="${esc(page.description)}" />`,
          `<meta property="og:image" content="${ORIGIN}${BASE}${page.image}" />`,
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
        ].join('\n    ')
        const out = html
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
          .replace(
            /(<meta\s+name="description"\s+content=")[^"]*(")/,
            `$1${esc(page.description)}$2`,
          )
          .replace('</head>', `  ${share}\n  </head>`)
        const dir = join(outDir, page.path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), out)
      }
      // every page, for search engines
      writeFileSync(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all
          .map((p) => `  <url><loc>${ORIGIN}${BASE}${p.path}</loc></url>`)
          .join('\n')}\n</urlset>\n`,
      )
      writeFileSync(join(outDir, '404.html'), html)
    },
  }
}

/**
 * The search index as a module of its own, so the app fetches it only when
 * someone opens the search: `import('virtual:search-index')`.
 */
function searchIndex(): Plugin {
  const id = 'virtual:search-index'
  return {
    name: 'search-index',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load: (loaded) =>
      loaded === `\0${id}`
        ? `export default ${JSON.stringify(buildIndex(import.meta.dirname))}`
        : undefined,
  }
}

export default defineConfig({
  base: BASE,
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, rehypeKatex, [rehypeShiki, { theme: 'github-dark' }]],
        providerImportSource: undefined,
      }),
    },
    react({ include: /\.(mdx|tsx|ts)$/ }),
    searchIndex(),
    pageFiles(),
  ],
  test: {
    environment: 'node',
  },
})
