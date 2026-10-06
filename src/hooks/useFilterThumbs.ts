import { useCallback, useEffect, useRef, useState } from 'react'
import { makeThumbs } from '../lib/filterThumbs'

export function useFilterThumbs() {
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const busy = useRef(false)

  const fromVideo = useCallback((video: HTMLVideoElement | null, mirror: boolean) => {
    if (!video || video.readyState < 2 || busy.current) return
    busy.current = true
    try {
      setThumbs(makeThumbs(video, video.videoWidth, video.videoHeight, mirror))
    } finally {
      busy.current = false
    }
  }, [])

  const fromImage = useCallback((img: HTMLImageElement | null) => {
    if (!img) return
    setThumbs(makeThumbs(img, img.naturalWidth, img.naturalHeight))
  }, [])

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
