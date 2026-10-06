import type { Design, CanvasEl } from '../store/design'
import type { Layout, Rect, Slot } from './layouts'
import { patternTile, heartPath } from './patterns'
import type { Fill, Frame } from './frames'
import { filterById } from './filters'
import { coverCrop, filterToCanvas } from './filterEngine'
import { fontById, fontString, captionFonts } from '../fonts'
import { loadImage, stickerArt, wordArt } from './stickers'

export type RenderInput = {
  layout: Layout
  design: Design
  photos: (string | null)[]
  scale: number
  includeElements?: boolean
  date?: Date
  emptyLabel?: boolean
}

const filteredCache = new Map<string, HTMLCanvasElement>()

async function filteredPhoto(src: string, w: number, h: number, filterId: string, strength: number) {
  const W = Math.max(1, Math.round(w))
  const H = Math.max(1, Math.round(h))
  const key = `${src.length}:${src.slice(-48)}|${W}x${H}|${filterId}|${strength.toFixed(2)}`
  const hit = filteredCache.get(key)
  if (hit) return hit
  const img = await loadImage(src)
  const crop = coverCrop(img.naturalWidth, img.naturalHeight, W, H)
  const out = filterToCanvas(img, filterById(filterId), { width: W, height: H, crop, strength, seed: 3.7 })
  if (filteredCache.size > 80) filteredCache.delete(filteredCache.keys().next().value!)
  filteredCache.set(key, out)
  return out
}

export function fillStyleFor(ctx: CanvasRenderingContext2D, fill: Fill, w: number, h: number, scale: number) {
  if (fill.kind === 'solid') return fill.color
  if (fill.kind === 'gradient') {
    const a = ((fill.angle - 90) * Math.PI) / 180
    const cx = w / 2
    const cy = h / 2
    const len = (Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a))) / 2
    const g = ctx.createLinearGradient(cx - Math.cos(a) * len, cy - Math.sin(a) * len, cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    fill.colors.forEach((c, i) => g.addColorStop(i / Math.max(1, fill.colors.length - 1), c))
    return g
  }
  const tile = patternTile(fill.pattern, fill.base, fill.ink, fill.extra, fill.scale * scale)
  return ctx.createPattern(tile, 'repeat') ?? fill.base
}

let noiseTile: HTMLCanvasElement | null = null

function paperNoise() {
  if (noiseTile) return noiseTile
  const c = document.createElement('canvas')
  c.width = 96
  c.height = 96
  const x = c.getContext('2d')!
  const img = x.createImageData(96, 96)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  x.putImageData(img, 0, 0)
  noiseTile = c
  return c
}

function flowerPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2
  const cy = y + h / 2
  const n = 8
  const steps = 160
  for (let i = 0; i <= steps; i++) {
    const t = (Math.PI * 2 * i) / steps
    const k = 0.8 + 0.2 * Math.pow(Math.abs(Math.cos((t * n) / 2)), 0.7)
    const px = cx + Math.cos(t) * (w / 2) * k
    const py = cy + Math.sin(t) * (h / 2) * k
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

function slotPath(ctx: CanvasRenderingContext2D, slot: Slot, x: number, y: number, w: number, h: number, radiusFrac: number) {
  ctx.beginPath()
  switch (slot.shape) {
    case 'circle':
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
      break
    case 'heart':
      heartPath(ctx, x, y, w, h)
      break
    case 'flower':
      flowerPath(ctx, x, y, w, h)
      break
    case 'arch': {
      const r = Math.min(w / 2, h)
      ctx.moveTo(x, y + h)
      ctx.lineTo(x, y + r)
      ctx.arc(x + w / 2, y + r, w / 2, Math.PI, 0)
      ctx.lineTo(x + w, y + h)
      ctx.closePath()
      break
    }
    default: {
      const r = radiusFrac * Math.min(w, h)
      if (r > 0.5) ctx.roundRect(x, y, w, h, r)
      else ctx.rect(x, y, w, h)
    }
  }
}

function outlineColor(design: Design, frame: Frame) {
  switch (design.photoOutline) {
    case 'none':
      return null
    case 'white':
      return '#ffffff'
    case 'ink':
      return '#2a1d22'
    default:
      return frame.photoOutline
  }
}

export function formatDate(d: Date, style: Design['dateStyle']) {
  const pad = (n: number) => String(n).padStart(2, '0')
  if (style === 'dots') return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
  if (style === 'short') {
    const mon = d.toLocaleString('en', { month: 'short' }).toUpperCase()
    return `${pad(d.getDate())} ${mon} ${String(d.getFullYear()).slice(-2)}`
  }
  return d.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width <= maxW || !line) line = test
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawCaption(ctx: CanvasRenderingContext2D, rect: Rect, design: Design, layout: Layout, s: number, date: Date) {
  const color = design.captionColor ?? design.frame.text
  const font = fontById(design.captionFont)
  const x = rect.x * s
  const y = rect.y * s
  const w = rect.w * s
  const h = rect.h * s
  const tall = rect.h > rect.w * 1.2
  const caption = design.caption.trim()
  const dateText = design.showDate ? formatDate(date, design.dateStyle) : ''
  const logo = design.showLogo
  const overlay = layout.captionOverlay

  ctx.save()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (overlay) {
    ctx.shadowColor = 'rgba(30, 10, 20, 0.35)'
    ctx.shadowBlur = 18 * s
    ctx.shadowOffsetY = 4 * s
  }

  const metaSize = Math.min(h * (tall ? 0.06 : 0.16), w * 0.07, 34 * s)
  const metaFont = `700 ${Math.round(metaSize)}px "Nunito"`
  const logoFont = `600 ${Math.round(metaSize * 1.05)}px "Fredoka"`
  const metaLines = (dateText ? 1 : 0) + (logo ? 1 : 0)
  const metaBlock = overlay ? 0 : metaLines * metaSize * 1.5

  let lines: string[] = []
  let size = 0
  if (caption) {
    const maxLines = tall ? 5 : 2
    const avail = h - metaBlock - h * 0.08
    size = Math.min(avail / (tall ? 2.2 : 1.25), w * (tall ? 0.2 : 0.16), overlay ? 200 * s : 120 * s)
    for (let i = 0; i < 40; i++) {
      ctx.font = fontString(font, size)
      lines = wrap(ctx, caption, w * 0.94)
      const fits = lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= w * 0.96) && lines.length * size * 1.15 <= avail
      if (fits) break
      size *= 0.92
    }
    ctx.font = fontString(font, size)
  }

  const lineH = size * 1.15
  const captionBlock = lines.length * lineH
  const top = overlay ? y : y + (h - captionBlock - metaBlock) / 2

  if (caption) {
    ctx.font = fontString(font, size)
    lines.forEach((line, i) => ctx.fillText(line, x + w / 2, top + lineH * (i + 0.5)))
  }

  if (overlay) {
    const by = layout.size.h * s - 60 * s
    if (dateText) {
      ctx.textAlign = 'left'
      ctx.font = metaFont
      ctx.fillText(dateText, 60 * s, by)
    }
    if (logo) {
      ctx.textAlign = 'right'
      ctx.font = logoFont
      ctx.fillText('snapo', layout.size.w * s - 60 * s, by)
    }
    ctx.restore()
    return
  }

  let my = top + captionBlock + metaSize * 0.75
  if (dateText) {
    ctx.font = metaFont
    ctx.globalAlpha = 0.85
    ctx.fillText(dateText, x + w / 2, my)
    my += metaSize * 1.5
  }
  if (logo) {
    ctx.globalAlpha = 0.7
    ctx.font = logoFont
    ctx.fillText('snapo', x + w / 2, my)
  }
  ctx.restore()
}

function drawFilm(ctx: CanvasRenderingContext2D, layout: Layout, frame: Frame, s: number) {
  ctx.save()
  ctx.fillStyle = frame.accent
  const { w, h } = layout.size
  if (layout.decoration === 'film') {
    const hw = 34
    const hh = 26
    for (let y = 22; y + hh < h - 10; y += 62) {
      for (const x of [26, w - 26 - hw]) {
        ctx.beginPath()
        ctx.roundRect(x * s, y * s, hw * s, hh * s, 6 * s)
        ctx.fill()
      }
    }
  } else if (layout.decoration === 'film-wide') {
    const hw = 30
    const hh = 34
    for (let x = 24; x + hw < w - 10; x += 62) {
      for (const y of [32, h - 32 - hh]) {
        ctx.beginPath()
        ctx.roundRect(x * s, y * s, hw * s, hh * s, 6 * s)
        ctx.fill()
      }
    }
  }
  ctx.restore()
}

function drawEmpty(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: Frame, index: number, label: boolean) {
  ctx.fillStyle = frame.accent
  ctx.fill()
  if (!label) return
  ctx.save()
  ctx.fillStyle = frame.text
  ctx.globalAlpha = 0.55
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 ${Math.round(Math.min(w, h) * 0.22)}px "Fredoka"`
  ctx.fillText(String(index + 1), x + w / 2, y + h / 2)
  ctx.restore()
}

export async function elementImage(el: CanvasEl) {
  if (el.kind === 'sticker') return loadImage(await stickerArt(el.ref, el.outline))
  return loadImage(wordArt(el.spec))
}

export async function renderComposition(canvas: HTMLCanvasElement, input: RenderInput) {
  const { layout, design, photos, scale: s } = input
  const W = Math.round(layout.size.w * s)
  const H = Math.round(layout.size.h * s)
  const frame = design.frame

  await Promise.all(captionFonts.map((f) => document.fonts?.load(fontString(f, 40)).catch(() => [])))

  const slotImages = await Promise.all(
    layout.slots.map(async (slot) => {
      const src = photos[slot.photo]
      if (!src) return null
      return filteredPhoto(src, slot.w * s, slot.h * s, design.filterId, design.strength)
    }),
  )
  const elImages = input.includeElements ? await Promise.all(design.elements.map((e) => elementImage(e).catch(() => null))) : []

  if (canvas.width !== W) canvas.width = W
  if (canvas.height !== H) canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.save()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = fillStyleFor(ctx, frame.fill, W, H, s)
  ctx.fillRect(0, 0, W, H)

  if (frame.paper) {
    ctx.save()
    ctx.globalAlpha = 0.07
    ctx.globalCompositeOperation = 'multiply'
    const p = ctx.createPattern(paperNoise(), 'repeat')
    if (p) {
      ctx.fillStyle = p
      ctx.fillRect(0, 0, W, H)
    }
    ctx.restore()
  }

  if (layout.decoration) drawFilm(ctx, layout, frame, s)

  const outline = outlineColor(design, frame)

  layout.slots.forEach((slot, i) => {
    const x = slot.x * s
    const y = slot.y * s
    const w = slot.w * s
    const h = slot.h * s
    ctx.save()
    if (slot.rotate) {
      ctx.translate(x + w / 2, y + h / 2)
      ctx.rotate((slot.rotate * Math.PI) / 180)
      ctx.translate(-(x + w / 2), -(y + h / 2))
    }
    if (slot.card) {
      const pad = w * 0.06
      ctx.save()
      ctx.shadowColor = 'rgba(60, 25, 35, 0.25)'
      ctx.shadowBlur = 24 * s
      ctx.shadowOffsetY = 8 * s
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(x - pad, y - pad, w + pad * 2, h + pad + w * 0.22, 6 * s)
      ctx.fill()
      ctx.restore()
    }
    const radius = slot.shape && slot.shape !== 'rect' ? 0 : Math.max(design.photoRadius, slot.radius ?? 0)
    slotPath(ctx, slot, x, y, w, h, radius)
    const img = slotImages[i]
    if (img) {
      ctx.save()
      ctx.clip()
      ctx.drawImage(img, x, y, w, h)
      ctx.restore()
    } else {
      drawEmpty(ctx, x, y, w, h, frame, slot.photo, input.emptyLabel ?? true)
    }
    if (outline && !slot.card) {
      slotPath(ctx, slot, x, y, w, h, radius)
      ctx.lineWidth = Math.max(2, 7 * s)
      ctx.strokeStyle = outline
      ctx.stroke()
    }
    ctx.restore()
  })

  const date = input.date ?? new Date()
  for (const rect of layout.captions) drawCaption(ctx, rect, design, layout, s, date)

  if (input.includeElements) {
    design.elements.forEach((el, i) => {
      const img = elImages[i]
      if (!img) return
      const ew = el.w * W
      const eh = ew * (img.naturalHeight / img.naturalWidth)
      ctx.save()
      ctx.translate(el.x * W, el.y * H)
      ctx.rotate((el.rot * Math.PI) / 180)
      if (el.flip) ctx.scale(-1, 1)
      ctx.drawImage(img, -ew / 2, -eh / 2, ew, eh)
      ctx.restore()
    })
  }
  ctx.restore()
  return canvas
}

export function exportScale(layout: Layout, target = 2) {
  const maxPixels = 14_000_000
  return Math.min(target, Math.sqrt(maxPixels / (layout.size.w * layout.size.h)))
}
