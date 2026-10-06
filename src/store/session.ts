import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { layoutById } from '../lib/layouts'
import { photoKey } from '../lib/photos'
import { pruneClips } from '../lib/clips'
import { idbStorage } from '../lib/idbStorage'

export type Timer = 3 | 5 | 10

type SessionState = {
  layoutId: string
  photos: (string | null)[]
  timer: Timer
  mirror: boolean
  autoSequence: boolean
  sound: boolean
  poses: boolean
  live: boolean
  hydrated: boolean
  setLayout: (id: string) => void
  setPhoto: (index: number, url: string | null) => void
  setPhotos: (photos: (string | null)[]) => void
  swapPhotos: (a: number, b: number) => void
  clearPhotos: () => void
  setTimer: (t: Timer) => void
  setMirror: (m: boolean) => void
  setAutoSequence: (v: boolean) => void
  setSound: (v: boolean) => void
  setPoses: (v: boolean) => void
  setLive: (v: boolean) => void
}

const fit = (photos: (string | null)[], n: number) => Array.from({ length: n }, (_, i) => photos[i] ?? null)

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      layoutId: 'classic-4',
      photos: fit([], 4),
      timer: 3,
      mirror: true,
      autoSequence: true,
      sound: true,
      poses: true,
      live: true,
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
      clearPhotos: () => set({ photos: fit([], layoutById(get().layoutId).shots) }),
      setTimer: (timer) => set({ timer }),
      setMirror: (mirror) => set({ mirror }),
      setAutoSequence: (autoSequence) => set({ autoSequence }),
      setSound: (sound) => set({ sound }),
      setPoses: (poses) => set({ poses }),
      setLive: (live) => set({ live }),
    }),
    {
      name: 'snapo-session',
      storage: createJSONStorage(() => idbStorage(300)),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        useSession.setState({ hydrated: true })
        if (!state) return
        const keep = state.photos.filter((p): p is string => !!p).map(photoKey)
        pruneClips(keep).catch(() => undefined)
      },
    },
  ),
)

export const useShots = () => useSession((s) => layoutById(s.layoutId).shots)
export const useFilledCount = () => useSession((s) => s.photos.filter(Boolean).length)
