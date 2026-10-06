import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { frameLayout, type CustomFrame } from '../lib/frameUpload'
import { setCustomLayouts } from '../lib/layouts'
import { idbStorage } from '../lib/idbStorage'

type FramesState = {
  frames: CustomFrame[]
  hydrated: boolean
  add: (frame: CustomFrame) => void
  remove: (id: string) => CustomFrame | null
  restore: (frame: CustomFrame) => void
}

export const useCustomFrames = create<FramesState>()(
  persist(
    (set, get) => ({
      frames: [],
      hydrated: false,
      add: (frame) => set({ frames: [frame, ...get().frames] }),
      remove: (id) => {
        const frame = get().frames.find((f) => f.id === id) ?? null
        set({ frames: get().frames.filter((f) => f.id !== id) })
        return frame
      },
      restore: (frame) => set({ frames: [frame, ...get().frames.filter((f) => f.id !== frame.id)].sort((a, b) => b.createdAt - a.createdAt) }),
    }),
    {
      name: 'snapo-frames',
      storage: createJSONStorage(() => idbStorage(150)),
      partialize: ({ frames }) => ({ frames }),
      onRehydrateStorage: () => () => useCustomFrames.setState({ hydrated: true }),
    },
  ),
)

setCustomLayouts(useCustomFrames.getState().frames.map(frameLayout))
useCustomFrames.subscribe((s, prev) => {
  if (s.frames !== prev.frames) setCustomLayouts(s.frames.map(frameLayout))
})
