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
    const source = videoRef.current
    if (!canvas || !source) return
    engineRef.current ??= new FilterEngine(canvas)
    const engine = engineRef.current
    let stopped = false
    let handle = 0
    let lastTime = -1
    let seed = 0
    let mask: Mask | null = null
    let blend: Uint8Array | null = null
    let raw: Uint8Array | undefined
    let lastSeg = 0
    let segCost = 0
    let inflight = false
    const segment = (video: HTMLVideoElement) => {
      inflight = true
      const t0 = performance.now()
      const vw = video.videoWidth
      const vh = video.videoHeight
      createImageBitmap(video, { resizeWidth: 256, resizeHeight: Math.max(1, Math.round((256 * vh) / vw)), resizeQuality: 'low' })
        .then((frame) => {
          if (!stopped) {
            const next = segmentNow(frame, frame.width, frame.height, 256, raw)
            if (next) {
              raw = next.data
              if (!blend || blend.length !== next.data.length) blend = new Uint8Array(next.data)
              else for (let i = 0; i < blend.length; i++) blend[i] = (next.data[i] * 7 + blend[i]) / 8
              mask = { data: blend, width: next.width, height: next.height }
            }
          }
          frame.close()
        })
        .catch(() => undefined)
        .finally(() => {
          segCost = performance.now() - t0
          inflight = false
        })
    }
    const draw = () => {
      const video = videoRef.current
      const box = boxRef.current
      if (!video || !box || video.readyState < 2) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const p = params.current
      const width = Math.max(64, Math.min(1280, Math.round(box.clientWidth * dpr), video.videoWidth || 1280))
      const height = Math.round(width / p.aspect)
      const crop = coverCrop(video.videoWidth, video.videoHeight, width, height)
      seed = (seed + 1) % 97

      const wantsBackdrop = backdropById(p.backdropId).kind !== 'none'
      const now = performance.now()
      if (!wantsBackdrop) {
        mask = null
      } else if (!inflight && now - lastSeg >= Math.max(40, segCost)) {
        lastSeg = now
        segment(video)
      }
      const backdrop = mask ? backdropSource(p.backdropId, width, height) : null
      engine.render(video, p.filter, { width, height, crop, mirror: p.mirror, seed, smooth: p.beauty, mask, backdrop })
    }
    const perFrame = typeof source.requestVideoFrameCallback === 'function'
    if (perFrame) {
      const onFrame = () => {
        if (stopped) return
        handle = source.requestVideoFrameCallback(onFrame)
        draw()
      }
      handle = source.requestVideoFrameCallback(onFrame)
    } else {
      const loop = () => {
        if (stopped) return
        handle = requestAnimationFrame(loop)
        if (source.currentTime === lastTime) return
        lastTime = source.currentTime
        draw()
      }
      loop()
    }
    return () => {
      stopped = true
      if (perFrame) source.cancelVideoFrameCallback(handle)
      else cancelAnimationFrame(handle)
    }
  }, [live, videoRef])

  return (
    <div ref={boxRef} className="liveview" style={{ aspectRatio: String(aspect), ['--aspect' as string]: aspect }}>
      <canvas ref={canvasRef} className="liveview__canvas" aria-hidden="true" />
      {children}
    </div>
  )
}
