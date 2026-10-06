import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import type { Design } from '../store/design'
import type { Layout } from './layouts'
import { exportScale, fillStyleFor, formatDate, renderComposition } from './render'
import { filterById } from './filters'
import { coverCrop, filterToCanvas } from './filterEngine'
import { loadImage } from './stickers'
import { fontById, fontString } from './fonts'

export const fileStamp = (d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

export const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality?: number) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed'))), type, quality))

export async function renderFinal(layout: Layout, design: Design, photos: (string | null)[]) {
  const canvas = document.createElement('canvas')
  await renderComposition(canvas, { layout, design, photos, scale: exportScale(layout), includeElements: true, emptyLabel: false })
  return canvas
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function toJpeg(canvas: HTMLCanvasElement) {
  return canvasToBlob(canvas, 'image/jpeg', 0.93)
}

export async function makeGif(layout: Layout, design: Design, photos: (string | null)[]) {
  const slot = layout.slots[0]
  const aspect = slot.w / slot.h
  const W = 480
  const pad = 22
  const photoW = W - pad * 2
  const photoH = Math.round(photoW / aspect)
  const capH = design.caption.trim() || design.showDate ? 92 : pad
  const H = pad + photoH + capH
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const gif = GIFEncoder()
  const filter = filterById(design.filterId)
  const font = fontById(design.captionFont)
  const color = design.captionColor ?? design.frame.text
  const list = photos.filter((p): p is string => !!p)

  for (const src of list) {
    const img = await loadImage(src)
    const crop = coverCrop(img.naturalWidth, img.naturalHeight, photoW, photoH)
    const filtered = filterToCanvas(img, filter, { width: photoW, height: photoH, crop, strength: design.strength, seed: 2 })
    ctx.fillStyle = fillStyleFor(ctx, design.frame.fill, W, H, 0.5)
    ctx.fillRect(0, 0, W, H)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(pad, pad, photoW, photoH, design.photoRadius * Math.min(photoW, photoH))
    ctx.clip()
    ctx.drawImage(filtered, pad, pad)
    ctx.restore()
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const caption = design.caption.trim()
    if (caption) {
      let size = 34
      ctx.font = fontString(font, size)
      while (ctx.measureText(caption).width > W - pad * 2 && size > 12) {
        size -= 2
        ctx.font = fontString(font, size)
      }
      ctx.fillText(caption, W / 2, pad + photoH + (design.showDate ? 36 : capH / 2))
    }
    if (design.showDate) {
      ctx.font = '700 15px "Nunito"'
      ctx.globalAlpha = 0.85
      ctx.fillText(formatDate(new Date(), design.dateStyle), W / 2, pad + photoH + (caption ? 68 : capH / 2))
      ctx.globalAlpha = 1
    }
    const { data } = ctx.getImageData(0, 0, W, H)
    const palette = quantize(data, 256)
    gif.writeFrame(applyPalette(data, palette), W, H, { palette, delay: 650 })
    await new Promise((r) => setTimeout(r, 0))
  }
  gif.finish()
  return new Blob([gif.bytes() as BlobPart], { type: 'image/gif' })
}

export async function shareImage(blob: Blob, name: string) {
  const file = new File([blob], name, { type: blob.type })
  const data = { files: [file], title: 'My Snapo strip' }
  if (!navigator.canShare?.(data)) return false
  await navigator.share(data)
  return true
}

export const canShareFiles = () => {
  try {
    const file = new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' })
    return !!navigator.canShare?.({ files: [file] })
  } catch {
    return false
  }
}

export function printImage(url: string, w: number, h: number) {
  const frame = document.createElement('iframe')
  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '0'
  frame.style.height = '0'
  frame.style.border = '0'
  frame.setAttribute('aria-hidden', 'true')
  document.body.appendChild(frame)
  const doc = frame.contentDocument!
  const portrait = h >= w
  doc.open()
  doc.write(
    `<!doctype html><html><head><title>Snapo</title><style>@page{margin:10mm;size:${portrait ? 'portrait' : 'landscape'}}html,body{margin:0;height:100%}body{display:grid;place-items:center}img{max-width:100%;max-height:100%;object-fit:contain}</style></head><body><img src="${url}"></body></html>`,
  )
  doc.close()
  const img = doc.querySelector('img')!
  const go = () => {
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    window.setTimeout(() => frame.remove(), 1500)
  }
  if (img.complete) go()
  else img.onload = go
}

export async function thumbnailOf(canvas: HTMLCanvasElement, maxW = 360) {
  const k = Math.min(1, maxW / canvas.width)
  const t = document.createElement('canvas')
  t.width = Math.round(canvas.width * k)
  t.height = Math.round(canvas.height * k)
  t.getContext('2d')!.drawImage(canvas, 0, 0, t.width, t.height)
  return t.toDataURL('image/jpeg', 0.84)
}
