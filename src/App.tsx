import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppHeader } from './components/app/AppHeader'
import { ToastRegion } from './components/ui/ToastRegion'
import HomePage from './pages/HomePage'
import BoothShell from './pages/booth/BoothShell'

const LayoutStep = lazy(() => import('./pages/booth/LayoutStep'))
const ShootStep = lazy(() => import('./pages/booth/ShootStep'))
const DecorateStep = lazy(() => import('./pages/booth/DecorateStep'))
const SaveStep = lazy(() => import('./pages/booth/SaveStep'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function RouteFocus() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const main = document.getElementById('main')
    main?.focus({ preventScroll: true })
  }, [pathname])
  return null
}

function PageFallback() {
  return (
    <div className="page-fallback" aria-busy="true" aria-label="Loading">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--block" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <RouteFocus />
      <AppHeader />
      <main id="main" tabIndex={-1} className="app-main">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booth" element={<BoothShell />}>
              <Route index element={<Navigate to="layout" replace />} />
              <Route path="layout" element={<LayoutStep />} />
              <Route path="shoot" element={<ShootStep />} />
              <Route path="decorate" element={<DecorateStep />} />
              <Route path="save" element={<SaveStep />} />
            </Route>
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <ToastRegion />
    </BrowserRouter>
  )
}
