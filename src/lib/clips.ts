import { createStore, delMany, get, keys, set, type UseStore } from 'idb-keyval'

const FPS = 10
const BEFORE = 12
const AFTER = 6
const MAX_SIDE = 400

export const CLIP_FPS = FPS

let db: UseStore | null = null
const store = () => (db ??= createStore('snapo-clips', 'clips'))
const memory = new Map<string, Blob[]>()

export async function saveClip(key: string, frames: Blob[]) {
  if (!frames.length) return
  memory.set(key, frames)
  await set(key, frames, store())
}

export async function getClip(key: string) {
  const hit = memory.get(key)
  if (hit) return hit
  const frames = await get<Blob[]>(key, store()).catch(() => undefined)
  if (frames?.length) memory.set(key, frames)
  return frames
}

export async function pruneClips(keep: string[]) {
  const wanted = new Set(keep)
  const all = (await keys(store())) as string[]
  const stale = all.filter((k) => !wanted.has(k))
  for (const k of stale) memory.delete(k)
  if (stale.length) await delMany(stale, store())
}

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

const toBlob = (c: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => c.toBlob((b) => resolve(b), 'image/jpeg', 0.82))

export class ClipRecorder {
  private ring: HTMLCanvasElement[] = []
  private head = 0
  private timer = 0
  private video: HTMLVideoElement
  private mirror: boolean

  constructor(video: HTMLVideoElement, mirror: boolean) {
    this.video = video
    this.mirror = mirror
  }

  private grab(into?: HTMLCanvasElement) {
    const v = this.video
    if (v.readyState < 2 || !v.videoWidth) return null
    const k = Math.min(1, MAX_SIDE / Math.max(v.videoWidth, v.videoHeight))
    const w = Math.round(v.videoWidth * k)
    const h = Math.round(v.videoHeight * k)
    const c = into ?? document.createElement('canvas')
    if (c.width !== w) c.width = w
    if (c.height !== h) c.height = h
    const ctx = c.getContext('2d')!
    ctx.setTransform(this.mirror ? -1 : 1, 0, 0, 1, this.mirror ? w : 0, 0)
    ctx.drawImage(v, 0, 0, w, h)
    return c
  }

  start() {
    this.stop()
    this.timer = window.setInterval(() => {
      if (this.ring.length < BEFORE) {
        const c = this.grab()
        if (c) this.ring.push(c)
      } else if (this.grab(this.ring[this.head])) {
        this.head = (this.head + 1) % BEFORE
      }
    }, 1000 / FPS)
  }

  stop() {
    window.clearInterval(this.timer)
  }

  async finish() {
    this.stop()
    const frames = [...this.ring.slice(this.head), ...this.ring.slice(0, this.head)]
    for (let i = 0; i < AFTER; i++) {
      await sleep(1000 / FPS)
      const c = this.grab()
      if (c) frames.push(c)
    }
    const blobs = await Promise.all(frames.map(toBlob))
    return blobs.filter((b): b is Blob => !!b)
  }
}
