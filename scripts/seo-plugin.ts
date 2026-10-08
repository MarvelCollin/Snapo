import type { Plugin } from 'vite'

export type SeoOptions = {
  siteUrl: string
  base: string
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function seo({ siteUrl, base }: SeoOptions): Plugin {
  const site = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  const indexable = new URL(site).pathname === base
  return {
    name: 'snapo-seo',
    transformIndexHtml(html) {
      let out = html.replaceAll('__SITE_URL__', escapeHtml(site))
      if (!indexable) out = out.replace('<meta name="robots" content="index, follow, max-image-preview:large" />', '<meta name="robots" content="noindex, nofollow" />')
      return out
    },
  }
}
