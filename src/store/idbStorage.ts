import { get, set, del } from 'idb-keyval'
import type { StateStorage } from 'zustand/middleware'

const timers = new Map<string, number>()

export const idbStorage = (delay = 400): StateStorage => ({
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: (name, value) => {
    const t = timers.get(name)
    if (t) window.clearTimeout(t)
    timers.set(
      name,
      window.setTimeout(() => {
        set(name, value).catch(() => undefined)
        timers.delete(name)
      }, delay),
    )
  },
  removeItem: async (name) => {
    await del(name)
  },
})
