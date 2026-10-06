import type { CanvasEl } from '../store/design'
import { stickers } from '../lib/stickers'
import { useT } from '../i18n'

export function useElementName() {
  const t = useT()
  return (el: CanvasEl) =>
    el.kind === 'word' ? t.decorate.wordName(el.spec.text) : t.decorate.stickerName(stickers.find((s) => s.id === el.ref)?.name ?? el.ref)
}
