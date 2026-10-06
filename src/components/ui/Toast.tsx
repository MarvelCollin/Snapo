import { create } from 'zustand'
import { X } from '@phosphor-icons/react'

type Toast = {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'info' | 'error'
}

type ToastState = {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>, ms?: number) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t, ms = 4500) => {
    const id = ++seq
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] })
    window.setTimeout(() => get().dismiss(id), ms)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

export const toast = (message: string, extra?: Omit<Toast, 'id' | 'message'>, ms?: number) =>
  useToasts.getState().push({ message, ...extra }, ms)

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
