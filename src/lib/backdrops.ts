import type { Fill } from './frames'
import type { PatternId } from './patterns'
import { fillStyleFor } from './render'

export type Backdrop = {
  id: string
  kind: 'none' | 'blur' | 'fill'
  fill?: Fill
  studio?: boolean
}

const solid = (color: string): Fill => ({ kind: 'solid', color })
const grad = (angle: number, ...colors: string[]): Fill => ({ kind: 'gradient', colors, angle })
const pat = (pattern: PatternId, base: string, ink: string, extra = '#ffffff', scale = 1): Fill => ({ kind: 'pattern', pattern, base, ink, extra, scale })

export const backdrops: Backdrop[] = [
  { id: 'none', kind: 'none' },
  { id: 'blur', kind: 'blur' },
  { id: 'studio-white', kind: 'fill', fill: solid('#f4f1ef'), studio: true },
  { id: 'cream', kind: 'fill', fill: solid('#f8e9d6'), studio: true },
  { id: 'baby-pink', kind: 'fill', fill: solid('#ffcfdc'), studio: true },
  { id: 'butter', kind: 'fill', fill: solid('#ffefa8'), studio: true },
  { id: 'peach', kind: 'fill', fill: solid('#ffd4be'), studio: true },
  { id: 'mint', kind: 'fill', fill: solid('#c8ecd9'), studio: true },
  { id: 'sky', kind: 'fill', fill: solid('#c9e1ff'), studio: true },
  { id: 'lilac', kind: 'fill', fill: solid('#dfd3fa'), studio: true },
  { id: 'studio-gray', kind: 'fill', fill: solid('#b8b4b2'), studio: true },
  { id: 'night', kind: 'fill', fill: solid('#221d20'), studio: true },
  { id: 'sunset', kind: 'fill', fill: grad(160, '#ffd3a5', '#fd9fb3', '#c9a7eb') },
  { id: 'aurora', kind: 'fill', fill: grad(200, '#c4f1e0', '#d8d4ff', '#ffd6ec') },
  { id: 'gingham', kind: 'fill', fill: pat('gingham', '#fff5f7', '#ff9fb5') },
  { id: 'clouds', kind: 'fill', fill: pat('clouds', '#bfe3ff', '#ffffff', '#ffffff', 0.9) },
  { id: 'hearts', kind: 'fill', fill: pat('hearts', '#ffe3ea', '#ffb3c6', '#ffffff', 0.7) },
  { id: 'stars', kind: 'fill', fill: pat('stars', '#1e2a52', '#ffe48a', '#ffffff', 0.8) },
  { id: 'batik', kind: 'fill', fill: pat('kawung', '#f3e3c3', '#6b3e1f', '#c8963e', 0.9) },
  { id: 'checker', kind: 'fill', fill: pat('checker', '#ffffff', '#ffc2d1', '#ffffff', 0.9) },
]

export const backdropById = (id: string | undefined) => backdrops.find((b) => b.id === id) ?? backdrops[0]

const cache = new Map<string, HTMLCanvasElement>()

export function backdropCanvas(b: Backdrop, w: number, h: number) {
  const W = Math.max(1, Math.round(w))
  const H = Math.max(1, Math.round(h))
  const key = `${b.id}|${W}x${H}`
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  if (b.fill) {
    ctx.fillStyle = fillStyleFor(ctx, b.fill, W, H, Math.max(W, H) / 900)
    ctx.fillRect(0, 0, W, H)
  }
  if (b.studio) {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.75)
    g.addColorStop(0, 'rgba(255,255,255,0.35)')
    g.addColorStop(0.55, 'rgba(255,255,255,0.05)')
    g.addColorStop(1, 'rgba(0,0,0,0.12)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
  if (cache.size > 16) cache.delete(cache.keys().next().value!)
  cache.set(key, c)
  return c
}

export function backdropSource(id: string | undefined, w: number, h: number): HTMLCanvasElement | 'blur' | null {
  const b = backdropById(id)
  if (b.kind === 'none') return null
  if (b.kind === 'blur') return 'blur'
  return backdropCanvas(b, w, h)
}
