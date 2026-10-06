import { useDesign, uid } from '../store/design'
import type { WordSpec } from '../lib/stickers'

const jitter = (range = 0.12) => (Math.random() - 0.5) * range

export function useAddElement() {
  const addElement = useDesign((s) => s.addElement)
  const addSticker = (ref: string, outline: boolean) =>
    addElement({ id: uid(), kind: 'sticker', ref, outline, x: 0.5 + jitter(0.5), y: 0.5 + jitter(0.6), w: 0.26, rot: Math.round(jitter() * 160), flip: false })
  const addWord = (spec: WordSpec) =>
    addElement({ id: uid(), kind: 'word', spec, x: 0.5 + jitter(0.3), y: 0.5 + jitter(0.5), w: 0.42, rot: Math.round(jitter() * 80), flip: false })
  return { addSticker, addWord }
}
