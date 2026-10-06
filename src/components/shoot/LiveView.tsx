import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { FilterEngine, coverCrop } from '../../lib/filterEngine'
import type { FilterDef } from '../../lib/filters'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  live: boolean
  filter: FilterDef
  mirror: boolean
  aspect: number
  children?: ReactNode
}

export function LiveView({ videoRef, live, filter, mirror, aspect, children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<FilterEngine | null>(null)
  const params = useRef({ filter, mirror, aspect })
  params.current = { filter, mirror, aspect }

  useEffect(() => {
    if (!live) return
    const canvas = canvasRef.current
    if (!canvas) return
    engineRef.current ??= new FilterEngine(canvas)
    const engine = engineRef.current
    let raf = 0
    let seed = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const video = videoRef.current
      const box = boxRef.current
      if (!video || !box || video.readyState < 2) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const p = params.current
      const width = Math.min(1280, Math.round(box.clientWidth * dpr))
      const height = Math.round(width / p.aspect)
      const crop = coverCrop(video.videoWidth, video.videoHeight, width, height)
      seed = (seed + 1) % 97
      engine.render(video, p.filter, { width, height, crop, mirror: p.mirror, seed })
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [live, videoRef])

  return (
    <div ref={boxRef} className="liveview" style={{ aspectRatio: String(aspect), ['--aspect' as string]: aspect }}>
      <canvas ref={canvasRef} className="liveview__canvas" aria-hidden="true" />
      {children}
    </div>
  )
}
