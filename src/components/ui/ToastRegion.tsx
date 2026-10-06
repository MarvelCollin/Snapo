import { X } from '@phosphor-icons/react'
import { useToasts } from '../../store/toasts'

export function ToastRegion() {
  const { toasts, dismiss } = useToasts()
  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone === 'error' ? 'toast--error' : ''}`}>
          <span className="toast__msg">{t.message}</span>
          {t.actionLabel && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                t.onAction?.()
                dismiss(t.id)
              }}
            >
              {t.actionLabel}
            </button>
          )}
          <button type="button" className="toast__close" aria-label="Dismiss message" onClick={() => dismiss(t.id)}>
            <X weight="bold" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
