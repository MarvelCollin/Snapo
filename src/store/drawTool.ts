import { create } from 'zustand'
import type { PenSizeId, PenStyle } from '../lib/doodle'

type DrawToolState = {
  mode: 'pen' | 'erase'
  pen: PenStyle
  color: string
  size: PenSizeId
  set: (patch: Partial<Omit<DrawToolState, 'set'>>) => void
}

export const useDrawTool = create<DrawToolState>((set) => ({
  mode: 'pen',
  pen: 'neon',
  color: '#ff5c8a',
  size: 'm',
  set: (patch) => set(patch),
}))
