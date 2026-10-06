import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { frameById, type Frame } from '../lib/frames'
import type { WordSpec } from '../lib/stickers'
import { idbStorage } from '../lib/idbStorage'

export type StickerEl = {
  id: string
  kind: 'sticker'
  ref: string
  outline: boolean
  x: number
  y: number
  w: number
  rot: number
  flip: boolean
}

export type WordEl = {
  id: string
  kind: 'word'
  spec: WordSpec
  x: number
  y: number
  w: number
  rot: number
  flip: boolean
}

export type CanvasEl = StickerEl | WordEl

export type DateStyle = 'dots' | 'long' | 'short'

export type Design = {
  filterId: string
  strength: number
  frame: Frame
  photoRadius: number
  photoOutline: 'none' | 'frame' | 'white' | 'ink'
  caption: string
  captionFont: string
  captionColor: string | null
  showDate: boolean
  dateStyle: DateStyle
  showLogo: boolean
  elements: CanvasEl[]
  beauty: number
  backdropId: string
}

export const defaultDesign = (): Design => ({
  filterId: 'seoul',
  strength: 1,
  beauty: 0.3,
  backdropId: 'none',
  frame: { ...frameById('strawberry-milk') },
  photoRadius: 0,
  photoOutline: 'frame',
  caption: 'best day ever',
  captionFont: 'fredoka',
  captionColor: null,
  showDate: true,
  dateStyle: 'dots',
  showLogo: true,
  elements: [],
})

type DesignState = {
  design: Design
  past: Design[]
  future: Design[]
  selectedId: string | null
  createdAt: number
  update: (patch: Partial<Design>, opts?: { history?: boolean }) => void
  checkpoint: () => void
  undo: () => void
  redo: () => void
  select: (id: string | null) => void
  addElement: (el: CanvasEl) => void
  updateElement: (id: string, patch: Partial<CanvasEl>, opts?: { history?: boolean }) => void
  removeElement: (id: string) => void
  duplicateElement: (id: string) => void
  reorderElement: (id: string, dir: 'up' | 'down') => void
  reset: () => void
}

const LIMIT = 60

export const uid = () => Math.random().toString(36).slice(2, 10)

export const useDesign = create<DesignState>()(
  persist(
    (set, get) => {
      const push = () => {
        const { design, past } = get()
        set({ past: [...past.slice(-LIMIT + 1), design], future: [] })
      }
      return {
        design: defaultDesign(),
        past: [],
        future: [],
        selectedId: null,
        createdAt: Date.now(),
        update: (patch, opts) => {
          if (opts?.history !== false) push()
          set({ design: { ...get().design, ...patch } })
        },
        checkpoint: push,
        undo: () => {
          const { past, design, future } = get()
          if (!past.length) return
          set({ design: past[past.length - 1], past: past.slice(0, -1), future: [design, ...future] })
        },
        redo: () => {
          const { past, design, future } = get()
          if (!future.length) return
          set({ design: future[0], future: future.slice(1), past: [...past, design] })
        },
        select: (selectedId) => set({ selectedId }),
        addElement: (el) => {
          push()
          set({ design: { ...get().design, elements: [...get().design.elements, el] }, selectedId: el.id })
        },
        updateElement: (id, patch, opts) => {
          if (opts?.history !== false) push()
          const elements = get().design.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as CanvasEl) : e))
          set({ design: { ...get().design, elements } })
        },
        removeElement: (id) => {
          push()
          set({
            design: { ...get().design, elements: get().design.elements.filter((e) => e.id !== id) },
            selectedId: get().selectedId === id ? null : get().selectedId,
          })
        },
        duplicateElement: (id) => {
          const el = get().design.elements.find((e) => e.id === id)
          if (!el) return
          const copy = { ...el, id: uid(), x: Math.min(0.95, el.x + 0.04), y: Math.min(0.95, el.y + 0.03) } as CanvasEl
          get().addElement(copy)
        },
        reorderElement: (id, dir) => {
          const list = [...get().design.elements]
          const i = list.findIndex((e) => e.id === id)
          const j = dir === 'up' ? i + 1 : i - 1
          if (i < 0 || j < 0 || j >= list.length) return
          push()
          ;[list[i], list[j]] = [list[j], list[i]]
          set({ design: { ...get().design, elements: list } })
        },
        reset: () => set({ design: defaultDesign(), past: [], future: [], selectedId: null, createdAt: Date.now() }),
      }
    },
    {
      name: 'snapo-design',
      storage: createJSONStorage(() => idbStorage(500)),
      partialize: (s) => ({ design: s.design, createdAt: s.createdAt }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Pick<DesignState, 'design' | 'createdAt'>>
        return { ...current, ...saved, design: { ...defaultDesign(), ...saved.design } }
      },
    },
  ),
)
