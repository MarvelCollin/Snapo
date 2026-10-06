import { useRef, type KeyboardEvent, type ReactNode } from 'react'

export type TabItem<T extends string> = { id: T; label: ReactNode; icon?: ReactNode; count?: number }

type Props<T extends string> = {
  label: string
  tabs: TabItem<T>[]
  active: T
  onChange: (id: T) => void
  idPrefix: string
  variant?: 'line' | 'chunky'
}

export function Tabs<T extends string>({ label, tabs, active, onChange, idPrefix, variant = 'line' }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, tabs.findIndex((t) => t.id === active))

  const go = (i: number) => {
    const next = (i + tabs.length) % tabs.length
    onChange(tabs[next].id)
    refs.current[next]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      go(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      go(tabs.length - 1)
    }
  }

  return (
    <div role="tablist" aria-label={label} className={`tabs tabs--${variant}`} onKeyDown={onKeyDown}>
      {tabs.map((t, i) => {
        const selected = t.id === active
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            role="tab"
            type="button"
            id={`${idPrefix}-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            className="tabs__tab"
            onClick={() => onChange(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.count !== undefined && <span className="tabs__count">{t.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
