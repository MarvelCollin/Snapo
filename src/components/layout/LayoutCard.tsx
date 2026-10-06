import type { ReactNode } from 'react'
import { CheckCircle } from '@phosphor-icons/react'

type Props = {
  name: string
  meta: string
  active: boolean
  onPick: () => void
  onOpen: () => void
  children: ReactNode
}

export function LayoutCard({ name, meta, active, onPick, onOpen, children }: Props) {
  return (
    <button
      type="button"
      className={`layout-card ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      onClick={onPick}
      onDoubleClick={() => {
        onPick()
        onOpen()
      }}
    >
      <span className="layout-card__art">{children}</span>
      <span className="layout-card__text">
        <span className="layout-card__name">
          {name}
          {active && <CheckCircle weight="fill" size={20} aria-hidden="true" className="layout-card__check" />}
        </span>
        <span className="layout-card__meta">{meta}</span>
      </span>
    </button>
  )
}
