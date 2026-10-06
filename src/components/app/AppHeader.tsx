import { NavLink, Link } from 'react-router-dom'
import { Camera, ImagesSquare } from '@phosphor-icons/react'
import { languages, useLang, useT, type Lang } from '../../i18n'
import { Segmented } from '../ui/Segmented'

export function AppHeader() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="brand" aria-label={t.header.home}>
          <img src="/stickers/camera-with-flash.webp" alt="" width={36} height={36} className="brand__mark" />
          <span className="brand__word">snapo</span>
        </Link>
        <nav aria-label={t.header.nav} className="main-nav">
          <NavLink to="/booth" className="main-nav__link">
            <Camera weight="bold" size={20} aria-hidden="true" />
            <span>{t.header.booth}</span>
          </NavLink>
          <NavLink to="/gallery" className="main-nav__link">
            <ImagesSquare weight="bold" size={20} aria-hidden="true" />
            <span>{t.header.gallery}</span>
          </NavLink>
        </nav>
        <div className="lang-toggle">
          <Segmented<Lang>
            label={t.header.language}
            hideLabel
            size="sm"
            value={lang}
            onChange={setLang}
            options={languages.map((l) => ({ value: l.id, label: l.short, ariaLabel: l.label }))}
          />
        </div>
      </div>
    </header>
  )
}
