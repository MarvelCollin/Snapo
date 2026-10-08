import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

export type SeoRoute = {
  path: string
  title: string
  description: string
}

export type SeoOptions = {
  siteUrl: string
  base: string
  routes: SeoRoute[]
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const swap = (html: string, pattern: RegExp, value: string) => html.replace(pattern, (_, start: string, end: string) => `${start}${escapeHtml(value)}${end}`)

function pageHtml(html: string, route: SeoRoute, url: string) {
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
  out = swap(out, /(<meta name="description" content=")[^"]*(" \/>)/, route.description)
  out = swap(out, /(<meta property="og:title" content=")[^"]*(" \/>)/, route.title)
  out = swap(out, /(<meta property="og:description" content=")[^"]*(" \/>)/, route.description)
  out = swap(out, /(<meta name="twitter:title" content=")[^"]*(" \/>)/, route.title)
  out = swap(out, /(<meta name="twitter:description" content=")[^"]*(" \/>)/, route.description)
  out = swap(out, /(<link rel="canonical" href=")[^"]*(" \/>)/, url)
  out = swap(out, /(<meta property="og:url" content=")[^"]*(" \/>)/, url)
  return out
}

export function seo({ siteUrl, base, routes }: SeoOptions): Plugin {
  const site = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  const indexable = new URL(site).pathname === base
  const urlOf = (path: string) => (path === '/' ? site : `${site}${path.replace(/^\/|\/$/g, '')}/`)
  let config: ResolvedConfig
  return {
    name: 'snapo-seo',
    configResolved(resolved) {
      config = resolved
    },
    transformIndexHtml(html) {
      let out = html.replaceAll('__SITE_URL__', escapeHtml(site))
      if (!indexable) out = out.replace('<meta name="robots" content="index, follow, max-image-preview:large" />', '<meta name="robots" content="noindex, nofollow" />')
      return out
    },
    writeBundle() {
      const outDir = join(config.root, config.build.outDir)
      const html = readFileSync(join(outDir, 'index.html'), 'utf-8')
      for (const route of routes) {
        const page = pageHtml(html, route, urlOf(route.path))
        const dir = route.path === '/' ? outDir : join(outDir, route.path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), page)
      }
    },
  }
}
