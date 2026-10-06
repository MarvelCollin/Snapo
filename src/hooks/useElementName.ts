import type { CanvasEl } from '../store/design'
import { stickers } from '../lib/stickers'

export function useElementName() {
  return (el: CanvasEl) => (el.kind === 'word' ? `Text "${el.spec.text}"` : `Sticker ${stickers.find((s) => s.id === el.ref)?.name ?? el.ref}`)
}
