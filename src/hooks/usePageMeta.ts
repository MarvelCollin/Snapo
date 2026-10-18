import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang, useT, type Dict } from '../i18n'

type Meta = { title: string; description?: string }

const pageMeta = (t: Dict, pathname: string): Meta => {
  const path = pathname.replace(/\/+$/, '') || '/'
  const page = (title: string, description?: string) => ({ title: `${title} | ${t.meta.brand}`, description })
  if (path === '/') return { title: t.meta.home, description: t.meta.homeText }
  if (path === '/booth' || path === '/booth/layout') return page(t.meta.layout, t.meta.layoutText)
  if (path === '/booth/shoot') return page(t.meta.shoot)
  if (path === '/booth/edit') return page(t.meta.edit)
  if (path === '/booth/decorate') return page(t.meta.decorate)
  if (path === '/booth/save') return page(t.meta.save)
  if (path === '/gallery') return page(t.meta.gallery, t.meta.galleryText)
  return page(t.meta.notFound)
}

export function usePageMeta() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const { pathname } = useLocation()
  useEffect(() => {
    const meta = pageMeta(t, pathname)
    document.title = meta.title
    document.documentElement.lang = lang
    if (meta.description) document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [t, lang, pathname])
}
