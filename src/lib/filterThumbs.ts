import { filters } from './filters'
import { coverCrop, sharedEngine } from './filterEngine'

const W = 96
const H = 112
const COLS = 8

export type FilterThumbs = { src: string; cols: number; rows: number; index: Record<string, number> }

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)))

export async function makeThumbs(source: CanvasImageSource, srcW: number, srcH: number, mirror = false): Promise<FilterThumbs> {
  const still = document.createElement('canvas')
  still.width = W * 2
  still.height = H * 2
  const sctx = still.getContext('2d')!
  const crop = coverCrop(srcW, srcH, still.width, still.height)
  if (mirror) {
    sctx.translate(still.width, 0)
    sctx.scale(-1, 1)
  }
  sctx.drawImage(source, crop.x * srcW, crop.y * srcH, crop.w * srcW, crop.h * srcH, 0, 0, still.width, still.height)

  const rows = Math.ceil(filters.length / COLS)
  const atlas = document.createElement('canvas')
  atlas.width = W * COLS
  atlas.height = H * rows
  const actx = atlas.getContext('2d')!
  const engine = sharedEngine()
  const index: Record<string, number> = {}
  for (let i = 0; i < filters.length; i++) {
    engine.render(still, filters[i], { width: W, height: H, seed: 1.3 })
    actx.drawImage(engine.canvas, (i % COLS) * W, Math.floor(i / COLS) * H)
    index[filters[i].id] = i
    if ((i + 1) % 16 === 0) await nextFrame()
  }
  const src = await new Promise<string>((resolve) =>
    atlas.toBlob((b) => resolve(b ? URL.createObjectURL(b) : atlas.toDataURL('image/jpeg', 0.82)), 'image/jpeg', 0.82),
  )
  return { src, cols: COLS, rows, index }
}

export function thumbStyle(thumbs: FilterThumbs, id: string) {
  const i = thumbs.index[id] ?? 0
  const col = i % thumbs.cols
  const row = Math.floor(i / thumbs.cols)
  return {
    backgroundImage: `url("${thumbs.src}")`,
    backgroundSize: `${thumbs.cols * 100}% ${thumbs.rows * 100}%`,
    backgroundPosition: `${(col / (thumbs.cols - 1)) * 100}% ${(row / Math.max(1, thumbs.rows - 1)) * 100}%`,
  }
}
