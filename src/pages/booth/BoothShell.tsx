import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Check } from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { layoutById } from '../../lib/layouts'
import { useT } from '../../i18n'

const steps = ['layout', 'shoot', 'decorate', 'save'] as const

export default function BoothShell() {
  const t = useT()
  const { pathname } = useLocation()
  const hydrated = useSession((s) => s.hydrated)
  const photos = useSession((s) => s.photos)
  const layoutId = useSession((s) => s.layoutId)
  const complete = photos.length === layoutById(layoutId).shots && photos.every(Boolean)
  const current = Math.max(0, steps.findIndex((s) => pathname.endsWith(s)))

  return (
    <div className="booth">
      <nav aria-label={t.booth.stepsLabel} className="stepper">
        <p className="stepper__count">{t.booth.stepOf(current + 1, steps.length)}</p>
        <ol className="stepper__list">
          {steps.map((step, i) => {
            const locked = i >= 2 && !complete
            const done = i < current
            const content = (
              <>
                <span className="stepper__dot" aria-hidden="true">
                  {done ? <Check weight="bold" size={14} /> : i + 1}
                </span>
                <span className="stepper__label">{t.booth.steps[step]}</span>
              </>
            )
            return (
              <li key={step} className={`stepper__item ${done ? 'is-done' : ''}`}>
                {locked ? (
                  <span className="stepper__link is-locked" aria-disabled="true" title="">
                    {content}
                    <span className="visually-hidden">{t.booth.locked}</span>
                  </span>
                ) : (
                  <NavLink to={step} className="stepper__link" aria-current={i === current ? 'step' : undefined}>
                    {content}
                  </NavLink>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      {hydrated ? (
        <Outlet />
      ) : (
        <div className="page-fallback" aria-busy="true" aria-label={t.booth.loadingSession}>
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--block" />
        </div>
      )}
    </div>
  )
}
