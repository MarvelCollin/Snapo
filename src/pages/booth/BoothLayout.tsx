import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Check } from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { layoutById } from '../../lib/layouts'

const steps = [
  { path: 'layout', label: 'Layout' },
  { path: 'shoot', label: 'Shoot' },
  { path: 'decorate', label: 'Decorate' },
  { path: 'save', label: 'Save' },
]

export function BoothLayout() {
  const { pathname } = useLocation()
  const hydrated = useSession((s) => s.hydrated)
  const photos = useSession((s) => s.photos)
  const layoutId = useSession((s) => s.layoutId)
  const complete = photos.length === layoutById(layoutId).shots && photos.every(Boolean)
  const current = Math.max(0, steps.findIndex((s) => pathname.endsWith(s.path)))

  return (
    <div className="booth">
      <nav aria-label="Booth steps" className="stepper">
        <p className="stepper__count">
          Step {current + 1} of {steps.length}
        </p>
        <ol className="stepper__list">
          {steps.map((step, i) => {
            const locked = i >= 2 && !complete
            const done = i < current
            const content = (
              <>
                <span className="stepper__dot" aria-hidden="true">
                  {done ? <Check weight="bold" size={14} /> : i + 1}
                </span>
                <span className="stepper__label">{step.label}</span>
              </>
            )
            return (
              <li key={step.path} className={`stepper__item ${done ? 'is-done' : ''}`}>
                {locked ? (
                  <span className="stepper__link is-locked" aria-disabled="true" title="">
                    {content}
                    <span className="visually-hidden">, take all shots first</span>
                  </span>
                ) : (
                  <NavLink to={step.path} className="stepper__link" aria-current={i === current ? 'step' : undefined}>
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
        <div className="page-fallback" aria-busy="true" aria-label="Loading your session">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--block" />
        </div>
      )}
    </div>
  )
}
