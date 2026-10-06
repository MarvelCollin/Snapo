import type { Layout, Rect, Slot } from './layouts'

export type CustomFrame = {
  id: string
  name: string
  src: string
  w: number
  h: number
  slots: Slot[]
  twin: boolean
  createdAt: number
}

export class FrameError extends Error {
  code: 'notImage' | 'noHoles' | 'tooMany'
  count: number
  constructor(code: FrameError['code'], count = 0) {
    super(code)
    this.code = code
    this.count = count
  }
}

const MAX_SPOTS = 12
const LAYOUT_SIDE = 1800
const STORE_SIDE = 3600
const SCAN_SIDE = 480

type Box = { minX: number; minY: number; maxX: number; maxY: number; count: number }

function findHoles(alpha: Uint8ClampedArray, w: number, h: number): Box[] {
  const clear = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) clear[i] = alpha[i * 4 + 3] < 64 ? 1 : 0
  const seen = new Uint8Array(w * h)
  const boxes: Box[] = []
  const stack: number[] = []
  const visit = (j: number) => {
    if (clear[j] && !seen[j]) {
      seen[j] = 1
      stack.push(j)
    }
  }
  for (let start = 0; start < w * h; start++) {
    if (!clear[start] || seen[start]) continue
    const box: Box = { minX: w, minY: h, maxX: 0, maxY: 0, count: 0 }
    seen[start] = 1
    stack.push(start)
    while (stack.length) {
      const i = stack.pop()!
      const x = i % w
      const y = (i - x) / w
      box.count++
      if (x < box.minX) box.minX = x
      if (x > box.maxX) box.maxX = x
      if (y < box.minY) box.minY = y
      if (y > box.maxY) box.maxY = y
      if (x > 0) visit(i - 1)
      if (x < w - 1) visit(i + 1)
      if (y > 0) visit(i - w)
      if (y < h - 1) visit(i + w)
    }
    boxes.push(box)
  }
  const total = w * h
  return boxes.filter((b) => b.count >= total * 0.004 && (b.maxX - b.minX + 1) * (b.maxY - b.minY + 1) < total * 0.9)
}

function readingOrder(rects: Rect[]) {
  const sorted = [...rects].sort((a, b) => a.y + a.h / 2 - (b.y + b.h / 2))
  const rows: Rect[][] = []
  for (const r of sorted) {
    const row = rows[rows.length - 1]
    const cy = r.y + r.h / 2
    if (row && Math.abs(cy - (row[0].y + row[0].h / 2)) < Math.min(r.h, row[0].h) * 0.5) row.push(r)
    else rows.push([r])
  }
  return rows.flatMap((row) => row.sort((a, b) => a.x - b.x))
}

function twinColumns(rects: Rect[], width: number) {
  if (rects.length < 2 || rects.length % 2) return null
  const left = rects.filter((r) => r.x + r.w / 2 < width / 2).sort((a, b) => a.y - b.y)
  const right = rects.filter((r) => r.x + r.w / 2 >= width / 2).sort((a, b) => a.y - b.y)
  if (left.length !== right.length) return null
  const tol = width * 0.02
  const match = left.every((l, i) => {
    const r = right[i]
    return Math.abs(l.y - r.y) < tol && Math.abs(l.w - r.w) < tol && Math.abs(l.h - r.h) < tol
  })
  return match ? { left, right } : null
}

export async function readFrame(file: File): Promise<CustomFrame> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new FrameError('notImage')
  }
  try {
    const k = Math.min(1, STORE_SIDE / Math.max(bitmap.width, bitmap.height))
    const fw = Math.round(bitmap.width * k)
    const fh = Math.round(bitmap.height * k)

    const ks = Math.min(1, SCAN_SIDE / Math.max(fw, fh))
    const sw = Math.max(1, Math.round(fw * ks))
    const sh = Math.max(1, Math.round(fh * ks))
    const scan = document.createElement('canvas')
    scan.width = sw
    scan.height = sh
    const sctx = scan.getContext('2d', { willReadFrequently: true })!
    sctx.drawImage(bitmap, 0, 0, sw, sh)
    const holes = findHoles(sctx.getImageData(0, 0, sw, sh).data, sw, sh)
    if (!holes.length) throw new FrameError('noHoles')
    if (holes.length > MAX_SPOTS) throw new FrameError('tooMany', holes.length)

    const kl = LAYOUT_SIDE / Math.max(fw, fh)
    const W = Math.round(fw * kl)
    const H = Math.round(fh * kl)
    const rects: Rect[] = holes.map((b) => {
      const x = Math.max(0, ((b.minX - 1) / sw) * W)
      const y = Math.max(0, ((b.minY - 1) / sh) * H)
      return { x, y, w: Math.min(W, ((b.maxX + 2) / sw) * W) - x, h: Math.min(H, ((b.maxY + 2) / sh) * H) - y }
    })

    const twin = twinColumns(rects, W)
    const slots: Slot[] = twin
      ? [...twin.left.map((r, i) => ({ ...r, photo: i })), ...twin.right.map((r, i) => ({ ...r, photo: i }))]
      : readingOrder(rects).map((r, i) => ({ ...r, photo: i }))

    const full = document.createElement('canvas')
    full.width = fw
    full.height = fh
    full.getContext('2d')!.drawImage(bitmap, 0, 0, fw, fh)

    return {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: file.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'My frame',
      src: full.toDataURL('image/png'),
      w: W,
      h: H,
      slots,
      twin: !!twin,
      createdAt: Date.now(),
    }
  } finally {
    bitmap.close()
  }
}

export function frameLayout(f: CustomFrame): Layout {
  return {
    id: `custom-${f.id}`,
    name: f.name,
    group: 'mine',
    size: { w: f.w, h: f.h },
    sizeLabel: '',
    slots: f.slots,
    captions: [],
    shots: f.slots.reduce((m, s) => Math.max(m, s.photo + 1), 0),
    overlay: f.src,
  }
}
