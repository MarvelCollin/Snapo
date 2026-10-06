import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { layoutById } from '../lib/layouts'
import { idbStorage } from '../lib/idbStorage'

export type Timer = 3 | 5 | 10

export type Bonus = 0 | 2 | 4

export type Take = { id: string; photo: string; at: number }

const MAX_TAKES = 24

type SessionState = {
  layoutId: string
  photos: (string | null)[]
  takes: Take[]
  timer: Timer
  mirror: boolean
  autoSequence: boolean
  sound: boolean
  bonus: Bonus
  poses: boolean
  hydrated: boolean
  setLayout: (id: string) => void
  setPhoto: (index: number, url: string | null) => void
  setPhotos: (photos: (string | null)[]) => void
  swapPhotos: (a: number, b: number) => void
  clearPhotos: () => void
  addTake: (photo: string) => void
  removeTake: (id: string) => void
  setTimer: (t: Timer) => void
  setMirror: (m: boolean) => void
  setAutoSequence: (v: boolean) => void
  setSound: (v: boolean) => void
  setBonus: (v: Bonus) => void
  setPoses: (v: boolean) => void
}

const fit = (photos: (string | null)[], n: number) => Array.from({ length: n }, (_, i) => photos[i] ?? null)

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      layoutId: 'classic-4',
      photos: fit([], 4),
      takes: [],
      timer: 3,
      mirror: true,
      autoSequence: true,
      sound: true,
      bonus: 2,
      poses: true,
      hydrated: false,
      setLayout: (id) => {
        const n = layoutById(id).shots
        set({ layoutId: id, photos: fit(get().photos, n) })
      },
      setPhoto: (index, url) => {
        const photos = [...get().photos]
        photos[index] = url
        set({ photos })
      },
      setPhotos: (photos) => set({ photos: fit(photos, layoutById(get().layoutId).shots) }),
      swapPhotos: (a, b) => {
        const photos = [...get().photos]
        ;[photos[a], photos[b]] = [photos[b], photos[a]]
        set({ photos })
      },
      clearPhotos: () => set({ photos: fit([], layoutById(get().layoutId).shots), takes: [] }),
      addTake: (photo) => {
        const { takes, photos } = get()
        if (takes.some((t) => t.photo === photo)) return
        let next = [...takes, { id: Math.random().toString(36).slice(2, 10), photo, at: Date.now() }]
        while (next.length > MAX_TAKES) {
          const drop = next.findIndex((t) => !photos.includes(t.photo))
          if (drop < 0) break
          next = next.filter((_, i) => i !== drop)
        }
        set({ takes: next })
      },
      removeTake: (id) => set({ takes: get().takes.filter((t) => t.id !== id) }),
      setTimer: (timer) => set({ timer }),
      setMirror: (mirror) => set({ mirror }),
      setAutoSequence: (autoSequence) => set({ autoSequence }),
      setSound: (sound) => set({ sound }),
      setBonus: (bonus) => set({ bonus }),
      setPoses: (poses) => set({ poses }),
    }),
    {
      name: 'snapo-session',
      storage: createJSONStorage(() => idbStorage(300)),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => () => useSession.setState({ hydrated: true }),
    },
  ),
)

export const useShots = () => useSession((s) => layoutById(s.layoutId).shots)
export const useFilledCount = () => useSession((s) => s.photos.filter(Boolean).length)
