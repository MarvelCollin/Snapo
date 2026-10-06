import { create } from 'zustand'

export type Toast = {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'info' | 'error'
}

type ToastState = {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>, ms?: number) => number
  dismiss: (id: number) => void
}

let seq = 0

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t, ms = 4500) => {
    const id = ++seq
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] })
    window.setTimeout(() => get().dismiss(id), ms)
    return id
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

export const toast = (message: string, extra?: Omit<Toast, 'id' | 'message'>, ms?: number) =>
  useToasts.getState().push({ message, ...extra }, ms)
