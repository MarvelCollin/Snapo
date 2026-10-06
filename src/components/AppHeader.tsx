import { NavLink, Link } from 'react-router-dom'
import { Camera, ImagesSquare } from '@phosphor-icons/react'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="brand" aria-label="Snapo home">
          <img src="/stickers/camera-with-flash.webp" alt="" width={36} height={36} className="brand__mark" />
          <span className="brand__word">snapo</span>
        </Link>
        <nav aria-label="Main" className="main-nav">
          <NavLink to="/booth" className="main-nav__link">
            <Camera weight="bold" size={20} aria-hidden="true" />
            <span>Booth</span>
          </NavLink>
          <NavLink to="/gallery" className="main-nav__link">
            <ImagesSquare weight="bold" size={20} aria-hidden="true" />
            <span>Gallery</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
