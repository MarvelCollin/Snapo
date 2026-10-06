import { useEffect, useState } from 'react'
import type { CanvasEl } from '../store/design'
import { stickerArt, wordArt } from '../lib/stickers'

export function useElementArt(el: CanvasEl) {
  const stickerKey = el.kind === 'sticker' ? `${el.ref}|${el.outline}` : null
  const [sticker, setSticker] = useState<{ key: string; src: string } | null>(null)

  useEffect(() => {
    if (!stickerKey) return
    const [ref, outline] = stickerKey.split('|')
    let alive = true
    stickerArt(ref, outline === 'true').then((src) => {
      if (alive) setSticker({ key: stickerKey, src })
    })
    return () => {
      alive = false
    }
  }, [stickerKey])

  if (el.kind === 'word') return wordArt(el.spec)
  return sticker?.key === stickerKey ? sticker.src : null
}
