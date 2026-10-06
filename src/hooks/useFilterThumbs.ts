import { useCallback, useEffect, useRef, useState } from 'react'
import { filters } from '../lib/filters'
import { coverCrop, sharedEngine } from '../lib/filterEngine'

const W = 96
const H = 112

export function makeThumbs(source: TexImageSource & { width?: number; height?: number }, srcW: number, srcH: number, mirror = false) {
  const engine = sharedEngine()
  const crop = coverCrop(srcW, srcH, W, H)
  const out: Record<string, string> = {}
  for (const f of filters) {
    engine.render(source, f, { width: W, height: H, crop, mirror, seed: 1.3 })
    out[f.id] = engine.canvas.toDataURL('image/jpeg', 0.82)
  }
  return out
}

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
