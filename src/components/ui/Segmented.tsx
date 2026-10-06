import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'

type Option<T extends string | number> = { value: T; label: ReactNode; ariaLabel?: string }

type Props<T extends string | number> = {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  hideLabel?: boolean
  size?: 'sm' | 'md'
}

export function Segmented<T extends string | number>({ label, value, options, onChange, hideLabel, size = 'md' }: Props<T>) {
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, options.findIndex((o) => o.value === value))

  const move = (next: number) => {
    const i = (next + options.length) % options.length
    onChange(options[i].value)
    refs.current[i]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      move(index + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(index - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      move(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      move(options.length - 1)
    }
  }

  return (
    <div className="field">
      <span className={hideLabel ? 'visually-hidden' : 'field__label'} id={id}>
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={id} className={`segmented segmented--${size}`} onKeyDown={onKeyDown}>
        {options.map((o, i) => {
          const checked = o.value === value
          return (
            <button
              key={String(o.value)}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={o.ariaLabel}
              tabIndex={checked ? 0 : -1}
              className="segmented__option"
              onClick={() => onChange(o.value)}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
