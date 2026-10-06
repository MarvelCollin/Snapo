import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { FilterEngine, coverCrop, type Mask } from '../../lib/filterEngine'
import type { FilterDef } from '../../lib/filters'
import { backdropById, backdropSource } from '../../lib/backdrops'
import { loadSegmenter, segmentNow, segmenterStatus } from '../../lib/segment'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  live: boolean
  filter: FilterDef
  mirror: boolean
  aspect: number
  beauty?: number
  backdropId?: string
  children?: ReactNode
}

export function LiveView({ videoRef, live, filter, mirror, aspect, beauty = 0, backdropId = 'none', children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<FilterEngine | null>(null)
  const params = useRef({ filter, mirror, aspect, beauty, backdropId })
  params.current = { filter, mirror, aspect, beauty, backdropId }

  useEffect(() => {
    if (backdropById(backdropId).kind !== 'none' && segmenterStatus() === 'idle') loadSegmenter()
  }, [backdropId])

  useEffect(() => {
    if (!live) return
    const canvas = canvasRef.current
    if (!canvas) return
    engineRef.current ??= new FilterEngine(canvas)
    const engine = engineRef.current
    let raf = 0
    let seed = 0
    let mask: Mask | null = null
    let blend: Uint8Array | null = null
    let raw: Uint8Array | undefined
    let lastSeg = 0
    let segCost = 0
    const held = document.createElement('canvas')
    const hold = (video: HTMLVideoElement) => {
      const k = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight))
      const w = Math.round(video.videoWidth * k)
      const h = Math.round(video.videoHeight * k)
      if (held.width !== w) held.width = w
      if (held.height !== h) held.height = h
      held.getContext('2d')!.drawImage(video, 0, 0, w, h)
      return held
    }
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

      const wantsBackdrop = backdropById(p.backdropId).kind !== 'none'
      const now = performance.now()
      if (!wantsBackdrop) {
        mask = null
      } else if (now - lastSeg >= Math.max(16, segCost * 1.25)) {
        const t0 = performance.now()
        const frame = hold(video)
        const next = segmentNow(frame, frame.width, frame.height, 256, raw)
        segCost = performance.now() - t0
        lastSeg = now
        if (next) {
          raw = next.data
          if (!blend || blend.length !== next.data.length) blend = new Uint8Array(next.data)
          else for (let i = 0; i < blend.length; i++) blend[i] = (next.data[i] * 7 + blend[i]) / 8
          mask = { data: blend, width: next.width, height: next.height }
        }
      }
      const backdrop = mask ? backdropSource(p.backdropId, width, height) : null
      engine.render(mask ? held : video, p.filter, { width, height, crop, mirror: p.mirror, seed, smooth: p.beauty, mask, backdrop })
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
