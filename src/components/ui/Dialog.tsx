import { useEffect, useRef, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { useT } from '../../i18n'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'confirm' | 'form' | 'media'
}

export function Dialog({ open, onClose, title, children, footer, size = 'form' }: Props) {
  const t = useT()
  const ref = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      returnFocus.current = document.activeElement as HTMLElement
      el.showModal()
    } else if (!open && el.open) {
      el.close()
      returnFocus.current?.focus()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--${size}`}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      {open && (
        <div className="dialog__inner">
          <header className="dialog__head">
            <h2 id="dialog-title">{title}</h2>
            <button type="button" className="dialog__close" aria-label={t.common.close} onClick={onClose}>
              <X weight="bold" size={20} />
            </button>
          </header>
          <div className="dialog__body">{children}</div>
          {footer && <footer className="dialog__foot">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
