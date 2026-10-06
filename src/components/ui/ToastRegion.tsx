import { X } from '@phosphor-icons/react'
import { useToasts } from '../../store/toasts'
import { useT } from '../../i18n'

export function ToastRegion() {
  const t = useT()
  const { toasts, dismiss } = useToasts()
  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {toasts.map((item) => (
        <div key={item.id} className={`toast ${item.tone === 'error' ? 'toast--error' : ''}`}>
          <span className="toast__msg">{item.message}</span>
          {item.actionLabel && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                item.onAction?.()
                dismiss(item.id)
              }}
            >
              {item.actionLabel}
            </button>
          )}
          <button type="button" className="toast__close" aria-label={t.common.dismiss} onClick={() => dismiss(item.id)}>
            <X weight="bold" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
