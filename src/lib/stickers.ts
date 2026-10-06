import manifest from '../data/stickerManifest.json'
import { fontById, fontString } from './fonts'

export type StickerPack = 'love' | 'faces' | 'critters' | 'sweets' | 'sky' | 'party' | 'hands' | 'words'

export type StickerMeta = { id: string; name: string; pack: Exclude<StickerPack, 'words'> }

export const stickers = manifest as StickerMeta[]

export const stickerPacks: { id: StickerPack; label: string; cover: string }[] = [
  { id: 'love', label: 'Love', cover: 'sparkling-heart' },
  { id: 'faces', label: 'Faces', cover: 'smiling-face-with-hearts' },
  { id: 'critters', label: 'Critters', cover: 'rabbit-face' },
  { id: 'sweets', label: 'Sweets', cover: 'strawberry' },
  { id: 'sky', label: 'Sky and Bloom', cover: 'rainbow' },
  { id: 'party', label: 'Party', cover: 'ribbon' },
  { id: 'hands', label: 'Hands and Bubbles', cover: 'victory-hand' },
  { id: 'words', label: 'Words', cover: 'speech-balloon' },
]

export const stickerSrc = (id: string) => `/stickers/${id}.webp`

export type WordStyle = 'bubble' | 'script' | 'label' | 'pixel' | 'hand' | 'outline'

export type WordSpec = { text: string; style: WordStyle; color: string; font?: string }

export const wordStyles: { id: WordStyle; label: string; font: string }[] = [
  { id: 'bubble', label: 'Bubble', font: 'fredoka' },
  { id: 'script', label: 'Script', font: 'pacifico' },
  { id: 'label', label: 'Label tape', font: 'nunito' },
  { id: 'hand', label: 'Handwritten', font: 'caveat' },
  { id: 'pixel', label: 'Pixel', font: 'pixel' },
  { id: 'outline', label: 'Outline', font: 'fredoka' },
]

export const wordPresets: WordSpec[] = [
  { text: 'cute!', style: 'bubble', color: '#ff8fab' },
  { text: 'besties', style: 'script', color: '#ff6f91' },
  { text: 'xoxo', style: 'bubble', color: '#ffd166' },
  { text: 'love you', style: 'hand', color: '#e2445c' },
  { text: 'yay!', style: 'bubble', color: '#7bdcb5' },
  { text: 'OMG', style: 'pixel', color: '#8ec5ff' },
  { text: 'best day ever', style: 'label', color: '#ffe066' },
  { text: 'hehe', style: 'hand', color: '#ff8fab' },
  { text: 'say cheese', style: 'label', color: '#ffc8dd' },
  { text: 'BFF', style: 'outline', color: '#ff6f91' },
  { text: 'so sweet', style: 'script', color: '#c08bff' },
  { text: 'happy', style: 'bubble', color: '#ffb385' },
  { text: 'mood', style: 'pixel', color: '#ffd166' },
  { text: 'sparkle', style: 'script', color: '#62c6e8' },
  { text: 'smile', style: 'outline', color: '#7bdcb5' },
  { text: 'us', style: 'bubble', color: '#ff9fb5' },
  { text: 'good vibes', style: 'label', color: '#bde0fe' },
  { text: 'wow', style: 'outline', color: '#ffb703' },
  { text: 'miss u', style: 'hand', color: '#7a8cff' },
  { text: 'cheers', style: 'script', color: '#f6a35b' },
  { text: 'LOL', style: 'pixel', color: '#ff8fab' },
  { text: 'squad', style: 'bubble', color: '#9bdcfd' },
  { text: 'forever', style: 'script', color: '#e2445c' },
  { text: 'snap!', style: 'label', color: '#cdeac0' },
]

const imageCache = new Map<string, Promise<HTMLImageElement>>()

export function loadImage(src: string) {
  const hit = imageCache.get(src)
  if (hit) return hit
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => {
      imageCache.delete(src)
      reject(new Error(`Could not load ${src}`))
    }
    img.src = src
  })
  imageCache.set(src, p)
  return p
}

function silhouette(src: CanvasImageSource, w: number, h: number, color: string) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')!
  x.drawImage(src, 0, 0, w, h)
  x.globalCompositeOperation = 'source-in'
  x.fillStyle = color
  x.fillRect(0, 0, w, h)
  return c
}

export function dieCut(src: CanvasImageSource, w: number, h: number, opts: { outline: number; color?: string; shadow?: boolean }) {
  const r = Math.max(1, Math.round(opts.outline))
  const pad = r + (opts.shadow ? Math.round(r * 1.2) : 0)
  const out = document.createElement('canvas')
  out.width = w + pad * 2
  out.height = h + pad * 2
  const ctx = out.getContext('2d')!
  const sil = silhouette(src, w, h, opts.color ?? '#ffffff')
  const ring = document.createElement('canvas')
  ring.width = out.width
  ring.height = out.height
  const rc = ring.getContext('2d')!
  const steps = 36
  for (const k of [1, 0.66, 0.33]) {
    for (let i = 0; i < steps; i++) {
      const a = (Math.PI * 2 * i) / steps
      rc.drawImage(sil, pad + Math.cos(a) * r * k, pad + Math.sin(a) * r * k)
    }
  }
  if (opts.shadow) {
    ctx.save()
    ctx.shadowColor = 'rgba(70, 25, 40, 0.28)'
    ctx.shadowBlur = r * 0.9
    ctx.shadowOffsetY = r * 0.45
    ctx.drawImage(ring, 0, 0)
    ctx.restore()
  } else {
    ctx.drawImage(ring, 0, 0)
  }
  ctx.drawImage(src, pad, pad, w, h)
  return out
}

const artCache = new Map<string, Promise<string>>()

export function stickerArt(id: string, outline: boolean) {
  const key = `${id}|${outline}`
  const hit = artCache.get(key)
  if (hit) return hit
  const p = loadImage(stickerSrc(id)).then((img) => {
    if (!outline) return img.src
    const size = img.naturalWidth || 256
    return dieCut(img, size, size, { outline: size * 0.055, shadow: true }).toDataURL('image/png')
  })
  artCache.set(key, p)
  return p
}

const ink = '#3b2230'

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function drawWord(spec: WordSpec) {
  const style = wordStyles.find((s) => s.id === spec.style) ?? wordStyles[0]
  const font = fontById(spec.font ?? style.font)
  const px = 120
  const text = spec.style === 'pixel' ? spec.text.toUpperCase() : spec.text
  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = fontString(font, px)
  const m = measure.measureText(text)
  const ascent = m.actualBoundingBoxAscent || px * 0.8
  const descent = m.actualBoundingBoxDescent || px * 0.25
  const textW = Math.ceil(m.width)
  const textH = Math.ceil(ascent + descent)
  const stroke = spec.style === 'pixel' ? 14 : 16
  const padX = spec.style === 'label' ? 56 : stroke + 12
  const padY = spec.style === 'label' ? 34 : stroke + 12
  const c = document.createElement('canvas')
  c.width = textW + padX * 2
  c.height = textH + padY * 2
  const x = c.getContext('2d')!
  x.font = fontString(font, px)
  x.textBaseline = 'alphabetic'
  x.lineJoin = 'round'
  x.miterLimit = 2
  const tx = padX
  const ty = padY + ascent

  if (spec.style === 'label') {
    const r = 26
    x.fillStyle = spec.color
    x.strokeStyle = ink
    x.lineWidth = 8
    x.beginPath()
    x.roundRect(4, 4, c.width - 8, c.height - 8, r)
    x.fill()
    x.stroke()
    x.fillStyle = luminance(spec.color) > 0.5 ? ink : '#ffffff'
    x.fillText(text, tx, ty)
    return c
  }

  if (spec.style === 'outline') {
    x.strokeStyle = ink
    x.lineWidth = stroke * 1.6
    x.strokeText(text, tx, ty)
    x.strokeStyle = spec.color
    x.lineWidth = stroke * 0.9
    x.strokeText(text, tx, ty)
    x.fillStyle = '#ffffff'
    x.fillText(text, tx, ty)
    return c
  }

  x.strokeStyle = ink
  x.lineWidth = stroke
  x.strokeText(text, tx, ty)
  x.fillStyle = spec.color
  x.fillText(text, tx, ty)
  if (spec.style === 'bubble') {
    x.save()
    x.globalCompositeOperation = 'source-atop'
    x.fillStyle = 'rgba(255,255,255,0.35)'
    x.fillRect(0, 0, c.width, padY + ascent * 0.42)
    x.restore()
  }
  return c
}

const wordCache = new Map<string, string>()

export function wordArt(spec: WordSpec) {
  const key = JSON.stringify(spec)
  const hit = wordCache.get(key)
  if (hit) return hit
  const base = drawWord(spec)
  const url = dieCut(base, base.width, base.height, { outline: 18, shadow: true }).toDataURL('image/png')
  wordCache.set(key, url)
  return url
}
