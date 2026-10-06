import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { useT } from '../../i18n'

type Props = {
  label: string
  icon: ReactNode
  title: string
  children: ReactNode
  wide?: boolean
  disabled?: boolean
}

export function Popover({ label, icon, title, children, wide, disabled }: Props) {
  const t = useT()
  const id = useId()
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (refocus: boolean) => {
      setOpen(false)
      if (refocus) trigger.current?.focus()
    }
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) close(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    panel.current?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"], button, [tabindex="0"]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="popover">
      <button
        ref={trigger}
        type="button"
        className="btn btn--secondary btn--md popover__trigger"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-haspopup="dialog"
        aria-label={label}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span className="popover__label">{label}</span>
      </button>
      {open && (
        <div ref={panel} id={`${id}-panel`} role="dialog" aria-labelledby={`${id}-title`} className={`popover__panel ${wide ? 'popover__panel--wide' : ''}`}>
          <div className="popover__head">
            <h2 id={`${id}-title`}>{title}</h2>
            <button
              type="button"
              className="dialog__close"
              aria-label={t.common.close}
              onClick={() => {
                setOpen(false)
                trigger.current?.focus()
              }}
            >
              <X weight="bold" size={20} />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  )
}
