import type { ImageSegmenter } from '@mediapipe/tasks-vision'
import wasmLoader from '@mediapipe/tasks-vision/vision_wasm_internal.js?url'
import wasmBinary from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url'
import type { Mask } from './filterEngine'
import { loadImage } from './stickers'
import { photoKey } from './photos'

export type SegmenterStatus = 'idle' | 'loading' | 'ready' | 'error'

let status: SegmenterStatus = 'idle'
const listeners = new Set<() => void>()

const setStatus = (next: SegmenterStatus) => {
  status = next
  listeners.forEach((fn) => fn())
}

export const segmenterStatus = () => status

export function onSegmenterStatus(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

const LEGACY = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${import.meta.env.VITE_MEDIAPIPE_VERSION}/wasm`

const MODEL = `${import.meta.env.BASE_URL}models/selfie-segmenter.tflite`

let segmenter: ImageSegmenter | null = null
let loading: Promise<ImageSegmenter | null> | null = null
let lastTs = 0

export function loadSegmenter() {
  if (loading) return loading
  setStatus('loading')
  loading = (async () => {
    try {
      const { ImageSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const simd = await FilesetResolver.isSimdSupported()
      segmenter = await ImageSegmenter.createFromOptions(
        simd
          ? { wasmLoaderPath: wasmLoader, wasmBinaryPath: wasmBinary }
          : { wasmLoaderPath: `${LEGACY}/vision_wasm_nosimd_internal.js`, wasmBinaryPath: `${LEGACY}/vision_wasm_nosimd_internal.wasm` },
        {
          baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          outputConfidenceMasks: true,
          outputCategoryMask: false,
        },
      )
      setStatus('ready')
      return segmenter
    } catch (err) {
      console.error(err)
      loading = null
      setStatus('error')
      return null
    }
  })()
  return loading
}

let work: HTMLCanvasElement | null = null

function shrink(source: CanvasImageSource, w: number, h: number, max: number) {
  work ??= document.createElement('canvas')
  const k = Math.min(1, max / Math.max(w, h))
  const cw = Math.max(1, Math.round(w * k))
  const ch = Math.max(1, Math.round(h * k))
  if (work.width !== cw) work.width = cw
  if (work.height !== ch) work.height = ch
  work.getContext('2d', { willReadFrequently: true })!.drawImage(source, 0, 0, cw, ch)
  return work
}

export function segmentNow(source: CanvasImageSource, w: number, h: number, max = 256, reuse?: Uint8Array): Mask | null {
  if (!segmenter || !w || !h) return null
  const input = shrink(source, w, h, max)
  lastTs = Math.max(performance.now(), lastTs + 1)
  let out: Mask | null = null
  try {
    segmenter.segmentForVideo(input, lastTs, (result) => {
      const m = result.confidenceMasks?.[0]
      if (!m) return
      const f = m.getAsFloat32Array()
      const data = reuse && reuse.length === f.length ? reuse : new Uint8Array(f.length)
      for (let i = 0; i < f.length; i++) data[i] = Math.min(255, Math.max(0, f[i] * 255))
      out = { data, width: m.width, height: m.height }
    })
  } catch (err) {
    console.error(err)
    return null
  }
  return out
}

export async function segmentFrame(source: CanvasImageSource, w: number, h: number) {
  await loadSegmenter()
  return segmentNow(source, w, h, 320)
}

const maskCache = new Map<string, Promise<Mask | null>>()

export function photoMask(src: string) {
  const key = photoKey(src)
  const hit = maskCache.get(key)
  if (hit) return hit
  const p = (async () => {
    const seg = await loadSegmenter()
    if (!seg) return null
    const img = await loadImage(src)
    return segmentNow(img, img.naturalWidth, img.naturalHeight, 384)
  })()
  if (maskCache.size > 40) maskCache.delete(maskCache.keys().next().value!)
  maskCache.set(key, p)
  p.then((m) => {
    if (!m) maskCache.delete(key)
  })
  return p
}
