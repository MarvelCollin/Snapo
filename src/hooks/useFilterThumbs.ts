import { useCallback, useEffect, useRef, useState } from 'react'
import { makeThumbs, type FilterThumbs } from '../lib/filterThumbs'

export function useFilterThumbs() {
  const [thumbs, setThumbs] = useState<FilterThumbs | null>(null)
  const busy = useRef(false)
  const current = useRef<string | null>(null)

  const keep = useCallback((next: FilterThumbs) => {
    const old = current.current
    current.current = next.src
    setThumbs(next)
    if (old?.startsWith('blob:')) window.setTimeout(() => URL.revokeObjectURL(old), 2000)
  }, [])

  useEffect(
    () => () => {
      if (current.current?.startsWith('blob:')) URL.revokeObjectURL(current.current)
    },
    [],
  )

  const fromVideo = useCallback(
    async (video: HTMLVideoElement | null, mirror: boolean) => {
      if (!video || video.readyState < 2 || busy.current) return
      busy.current = true
      try {
        keep(await makeThumbs(video, video.videoWidth, video.videoHeight, mirror))
      } finally {
        busy.current = false
      }
    },
    [keep],
  )

  const fromImage = useCallback(
    async (img: HTMLImageElement | null) => {
      if (!img || busy.current) return
      busy.current = true
      try {
        keep(await makeThumbs(img, img.naturalWidth, img.naturalHeight))
      } finally {
        busy.current = false
      }
    },
    [keep],
  )

  return { thumbs, fromVideo, fromImage }
}

export function useImageThumbs(src: string | null) {
  const { thumbs, fromImage } = useFilterThumbs()
  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => fromImage(img)
    img.src = src
  }, [src, fromImage])
  return thumbs
}
