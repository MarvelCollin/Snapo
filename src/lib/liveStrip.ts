import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import type { Design } from '../store/design'
import type { Layout } from './layouts'
import { renderComposition, type LiveFrame } from './render'
import { CLIP_FPS, getClip } from './clips'
import { photoKey } from './photos'
import { backdropById } from './backdrops'
import { segmentFrame } from './segment'
import type { Mask } from './filterEngine'

export type LiveStrip = { frames: HTMLCanvasElement[]; order: number[]; fps: number; width: number; height: number }

const tick = () => new Promise((r) => window.setTimeout(r, 0))
const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

async function decode(blob: Blob) {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
  bitmap.close()
  return canvas
}

export async function hasLiveClips(photos: (string | null)[]) {
  const clips = await Promise.all(photos.map((p) => (p ? getClip(photoKey(p)) : undefined)))
  return clips.some((c) => !!c?.length)
}

export async function makeLiveStrip(layout: Layout, design: Design, photos: (string | null)[], maxSide = 1280): Promise<LiveStrip | null> {
  const clips = await Promise.all(photos.map((p) => (p ? getClip(photoKey(p)) : undefined)))
  if (!clips.some((c) => !!c?.length)) return null
  const decoded = await Promise.all(clips.map((c) => (c?.length ? Promise.all(c.map(decode)) : null)))
  const len = Math.max(...decoded.map((d) => d?.length ?? 0))

  let masks: ((Mask | null)[] | null)[] | null = null
  if (backdropById(design.backdropId).kind !== 'none') {
    masks = []
    for (const d of decoded) {
      if (!d) {
        masks.push(null)
        continue
      }
      const list: (Mask | null)[] = []
      for (const frame of d) list.push(await segmentFrame(frame, frame.width, frame.height))
      masks.push(list)
    }
  }

  const scale = Math.min(1, maxSide / Math.max(layout.size.w, layout.size.h))
  const frames: HTMLCanvasElement[] = []
  for (let t = 0; t < len; t++) {
    const input: (LiveFrame | null)[] = decoded.map((d, i) => {
      if (!d) return null
      const k = Math.min(t, d.length - 1)
      return { source: d[k], width: d[k].width, height: d[k].height, mask: masks?.[i]?.[k] ?? null }
    })
    const canvas = document.createElement('canvas')
    await renderComposition(canvas, { layout, design, photos, scale, includeElements: true, emptyLabel: false, frames: input })
    frames.push(canvas)
    await tick()
  }
  const forward = frames.map((_, i) => i)
  const order = [...forward, ...forward.slice(1, -1).reverse()]
  return { frames, order, fps: CLIP_FPS, width: frames[0].width, height: frames[0].height }
}

const videoTypes = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']

export const videoType = () => {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement.prototype.captureStream !== 'function') return null
  return videoTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? null
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2)

export async function liveVideo(strip: LiveStrip, loops = 2) {
  const type = videoType()
  if (!type) throw new Error('Video recording is not supported')
  const canvas = document.createElement('canvas')
  canvas.width = even(strip.width)
  canvas.height = even(strip.height)
  const ctx = canvas.getContext('2d')!
  const stream = canvas.captureStream(0)
  const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack
  const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8_000_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data)
  }
  const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()))
  const draw = (i: number) => {
    ctx.drawImage(strip.frames[i], 0, 0, canvas.width, canvas.height)
    track.requestFrame?.()
  }
  draw(strip.order[0])
  recorder.start()
  const step = 1000 / strip.fps
  const begin = performance.now()
  let n = 0
  for (let loop = 0; loop < loops; loop++) {
    for (const i of strip.order) {
      draw(i)
      n++
      await sleep(Math.max(0, begin + n * step - performance.now()))
    }
  }
  recorder.stop()
  await stopped
  stream.getTracks().forEach((t) => t.stop())
  const mime = type.split(';')[0]
  return { blob: new Blob(chunks, { type: mime }), ext: mime === 'video/mp4' ? 'mp4' : 'webm' }
}

export async function liveGif(strip: LiveStrip, maxSide = 720) {
  const k = Math.min(1, maxSide / Math.max(strip.width, strip.height))
  const W = Math.round(strip.width * k)
  const H = Math.round(strip.height * k)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const encoded = new Map<number, { index: Uint8Array; palette: number[][] }>()
  const gif = GIFEncoder()
  for (const i of strip.order) {
    let frame = encoded.get(i)
    if (!frame) {
      ctx.drawImage(strip.frames[i], 0, 0, W, H)
      const { data } = ctx.getImageData(0, 0, W, H)
      const palette = quantize(data, 256)
      frame = { index: applyPalette(data, palette), palette }
      encoded.set(i, frame)
      await tick()
    }
    gif.writeFrame(frame.index, W, H, { palette: frame.palette, delay: Math.round(1000 / strip.fps) })
  }
  gif.finish()
  return new Blob([gif.bytes() as BlobPart], { type: 'image/gif' })
}
