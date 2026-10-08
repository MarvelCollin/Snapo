import type { Dict } from '../i18n'
import type { Fill } from './frames'
import { heartPath, starPath } from './patterns'

export type ArtSlot = { x: number; y: number; w: number; h: number; index: number }

export type ArtArgs = {
  c: CanvasRenderingContext2D
  s: number
  w: number
  h: number
  ink: string
  accent: string
  paper: string
  caption: string
  date: Date
  locale: string
  t: Dict['art']
  slots: ArtSlot[]
}

type Painter = (a: ArtArgs) => void

export type TemplateArt = { under?: Painter; over?: Painter }

type TextOpts = {
  size: number
  family: string
  weight?: number
  italic?: boolean
  color?: string
  align?: CanvasTextAlign
  spacing?: number
  maxW?: number
  stroke?: string
  strokeW?: number
  shadow?: boolean
}

const fontOf = (o: TextOpts, size: number) => `${o.italic ? 'italic ' : ''}${o.weight ?? 400} ${size}px "${o.family}"`

function text(a: ArtArgs, str: string, x: number, y: number, o: TextOpts) {
  const { c, s } = a
  c.save()
  c.textAlign = o.align ?? 'left'
  c.textBaseline = 'alphabetic'
  c.letterSpacing = `${(o.spacing ?? 0) * s}px`
  let size = o.size * s
  c.font = fontOf(o, size)
  if (o.maxW) {
    while (size > 8 && c.measureText(str).width > o.maxW * s) {
      size *= 0.94
      c.font = fontOf(o, size)
    }
  }
  if (o.shadow) {
    c.shadowColor = 'rgba(20, 10, 15, 0.45)'
    c.shadowBlur = 14 * s
    c.shadowOffsetY = 3 * s
  }
  if (o.stroke) {
    c.lineJoin = 'round'
    c.lineWidth = (o.strokeW ?? 10) * s
    c.strokeStyle = o.stroke
    c.strokeText(str, x * s, y * s)
    c.shadowColor = 'transparent'
  }
  c.fillStyle = o.color ?? a.ink
  c.fillText(str, x * s, y * s)
  c.restore()
}

function wrapLines(a: ArtArgs, str: string, width: number, o: TextOpts) {
  const { c, s } = a
  c.save()
  c.font = fontOf(o, o.size * s)
  const words = str.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (!line || c.measureText(test).width <= width * s) line = test
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  c.restore()
  return lines
}

function paragraph(a: ArtArgs, str: string, x: number, y: number, width: number, lineH: number, o: TextOpts, maxLines = 99) {
  const lines = wrapLines(a, str, width, o).slice(0, maxLines)
  const ax = o.align === 'center' ? x + width / 2 : o.align === 'right' ? x + width : x
  lines.forEach((ln, i) => text(a, ln, ax, y + i * lineH, o))
  return y + lines.length * lineH
}

function rule(a: ArtArgs, x1: number, y: number, x2: number, weight = 2, color = a.ink) {
  const { c, s } = a
  c.save()
  c.fillStyle = color
  c.fillRect(x1 * s, (y - weight / 2) * s, (x2 - x1) * s, weight * s)
  c.restore()
}

function box(a: ArtArgs, x: number, y: number, w: number, h: number, fill: string, r = 0) {
  const { c, s } = a
  c.save()
  c.fillStyle = fill
  c.beginPath()
  c.roundRect(x * s, y * s, w * s, h * s, r * s)
  c.fill()
  c.restore()
}

function outline(a: ArtArgs, x: number, y: number, w: number, h: number, color: string, weight: number, r = 0) {
  const { c, s } = a
  c.save()
  c.strokeStyle = color
  c.lineWidth = weight * s
  c.beginPath()
  c.roundRect(x * s, y * s, w * s, h * s, r * s)
  c.stroke()
  c.restore()
}

function circle(a: ArtArgs, x: number, y: number, r: number, fill: string) {
  const { c, s } = a
  c.save()
  c.fillStyle = fill
  c.beginPath()
  c.arc(x * s, y * s, r * s, 0, Math.PI * 2)
  c.fill()
  c.restore()
}

function dashed(a: ArtArgs, x1: number, y1: number, x2: number, y2: number, color: string, weight = 3, dash = 14) {
  const { c, s } = a
  c.save()
  c.strokeStyle = color
  c.lineWidth = weight * s
  c.setLineDash([dash * s, dash * 0.7 * s])
  c.beginPath()
  c.moveTo(x1 * s, y1 * s)
  c.lineTo(x2 * s, y2 * s)
  c.stroke()
  c.restore()
}

function barcode(a: ArtArgs, x: number, y: number, w: number, h: number, color: string, vertical = false) {
  const { c, s } = a
  let seed = 7
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  c.save()
  c.fillStyle = color
  let p = 0
  const len = vertical ? h : w
  while (p < len) {
    const bar = 2 + Math.floor(rnd() * 4)
    const gap = 2 + Math.floor(rnd() * 4)
    if (vertical) c.fillRect(x * s, (y + p) * s, w * s, Math.min(bar, len - p) * s)
    else c.fillRect((x + p) * s, y * s, Math.min(bar, len - p) * s, h * s)
    p += bar + gap
  }
  c.restore()
}

function bunting(a: ArtArgs, x1: number, x2: number, y: number, sag: number, colors: string[], flag = 70) {
  const { c, s } = a
  const at = (t: number) => y + sag * 4 * t * (1 - t)
  c.save()
  c.strokeStyle = a.ink
  c.lineWidth = 3 * s
  c.beginPath()
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    const px = (x1 + (x2 - x1) * t) * s
    const py = at(t) * s
    if (i === 0) c.moveTo(px, py)
    else c.lineTo(px, py)
  }
  c.stroke()
  const n = Math.floor((x2 - x1) / (flag * 1.15))
  for (let i = 0; i < n; i++) {
    const t0 = (i + 0.1) / n
    const t1 = (i + 0.9) / n
    const tm = (t0 + t1) / 2
    c.fillStyle = colors[i % colors.length]
    c.beginPath()
    c.moveTo((x1 + (x2 - x1) * t0) * s, at(t0) * s)
    c.lineTo((x1 + (x2 - x1) * t1) * s, at(t1) * s)
    c.lineTo((x1 + (x2 - x1) * tm) * s, (at(tm) + flag * 1.1) * s)
    c.closePath()
    c.fill()
    c.lineWidth = 2 * s
    c.stroke()
  }
  c.restore()
}

function paw(a: ArtArgs, x: number, y: number, size: number, color: string) {
  const { c, s } = a
  c.save()
  c.fillStyle = color
  c.beginPath()
  c.ellipse(x * s, (y + size * 0.18) * s, size * 0.32 * s, size * 0.26 * s, 0, 0, Math.PI * 2)
  c.fill()
  for (const [dx, dy] of [
    [-0.34, -0.2],
    [-0.12, -0.38],
    [0.12, -0.38],
    [0.34, -0.2],
  ]) {
    c.beginPath()
    c.ellipse((x + dx * size) * s, (y + dy * size) * s, size * 0.12 * s, size * 0.15 * s, 0, 0, Math.PI * 2)
    c.fill()
  }
  c.restore()
}

function bow(a: ArtArgs, x: number, y: number, size: number, color: string) {
  const { c, s } = a
  c.save()
  c.translate(x * s, y * s)
  c.rotate(-0.25)
  c.fillStyle = color
  c.strokeStyle = '#ffffff'
  c.lineWidth = size * 0.07 * s
  c.lineJoin = 'round'
  const k = size * s
  for (const dir of [-1, 1]) {
    c.beginPath()
    c.moveTo(0, 0)
    c.quadraticCurveTo(dir * k * 0.3, -k * 0.55, dir * k * 0.62, -k * 0.32)
    c.quadraticCurveTo(dir * k * 0.72, 0, dir * k * 0.62, k * 0.32)
    c.quadraticCurveTo(dir * k * 0.3, k * 0.55, 0, 0)
    c.fill()
    c.stroke()
  }
  c.beginPath()
  c.arc(0, 0, size * 0.15 * s, 0, Math.PI * 2)
  c.fill()
  c.stroke()
  c.restore()
}

function burst(a: ArtArgs, x: number, y: number, r: number, fill: string, label: string, labelColor: string) {
  const { c, s } = a
  c.save()
  c.beginPath()
  const n = 14
  for (let i = 0; i < n * 2; i++) {
    const rad = (i % 2 ? r * 0.62 : r) * s
    const ang = (Math.PI * i) / n
    const px = x * s + Math.cos(ang) * rad
    const py = y * s + Math.sin(ang) * rad
    if (i === 0) c.moveTo(px, py)
    else c.lineTo(px, py)
  }
  c.closePath()
  c.fillStyle = fill
  c.fill()
  c.lineWidth = 8 * s
  c.strokeStyle = '#111111'
  c.lineJoin = 'round'
  c.stroke()
  c.restore()
  text(a, label, x, y + r * 0.22, { size: r * 0.55, family: 'Oswald', weight: 700, color: labelColor, align: 'center', stroke: '#111111', strokeW: 6, maxW: r * 1.2 })
}

function ears(a: ArtArgs, x: number, y: number, size: number) {
  const { c, s } = a
  c.save()
  for (const dir of [-1, 1]) {
    c.save()
    c.translate((x + dir * size * 0.28) * s, y * s)
    c.rotate(dir * 0.18)
    c.fillStyle = '#ffffff'
    c.strokeStyle = a.ink
    c.lineWidth = 4 * s
    c.beginPath()
    c.ellipse(0, -size * 0.45 * s, size * 0.16 * s, size * 0.48 * s, 0, 0, Math.PI * 2)
    c.fill()
    c.stroke()
    c.fillStyle = '#ffc2d1'
    c.beginPath()
    c.ellipse(0, -size * 0.45 * s, size * 0.08 * s, size * 0.34 * s, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
  c.restore()
}

function star(a: ArtArgs, x: number, y: number, r: number, fill: string) {
  const { c, s } = a
  c.save()
  c.fillStyle = fill
  c.beginPath()
  starPath(c, x * s, y * s, r * s)
  c.fill()
  c.restore()
}

function heart(a: ArtArgs, x: number, y: number, size: number, fill: string) {
  const { c, s } = a
  c.save()
  c.fillStyle = fill
  c.beginPath()
  heartPath(c, (x - size / 2) * s, (y - size / 2) * s, size * s, size * 0.9 * s)
  c.fill()
  c.restore()
}

function crescent(a: ArtArgs, x: number, y: number, r: number, fill: string) {
  const { c, s } = a
  c.save()
  c.beginPath()
  c.arc(x * s, y * s, r * s, 0, Math.PI * 2)
  c.clip()
  c.beginPath()
  c.arc(x * s, y * s, r * s, 0, Math.PI * 2)
  c.moveTo((x + r * 0.42 + r * 0.86) * s, (y - r * 0.28) * s)
  c.arc((x + r * 0.42) * s, (y - r * 0.28) * s, r * 0.86 * s, 0, Math.PI * 2)
  c.fillStyle = fill
  c.fill('evenodd')
  c.restore()
}

type Pal = { body: string; sprout: string; cheek: string }

const mochiPals: Pal[] = [
  { body: '#fffaf3', sprout: '#5fbf6a', cheek: '#ff9fb6' },
  { body: '#cdb8f4', sprout: '#7a52c7', cheek: '#ff8fb0' },
  { body: '#c6e8ad', sprout: '#3f9a4c', cheek: '#ff9f9f' },
  { body: '#ffc9da', sprout: '#e0577f', cheek: '#ff7f9f' },
]

function mochiBody(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  c.beginPath()
  c.moveTo(x - w / 2, y + h * 0.22)
  c.bezierCurveTo(x - w / 2, y - h * 0.62, x + w / 2, y - h * 0.62, x + w / 2, y + h * 0.22)
  c.bezierCurveTo(x + w / 2, y + h * 0.56, x - w / 2, y + h * 0.56, x - w / 2, y + h * 0.22)
  c.closePath()
}

function mochi(a: ArtArgs, x: number, y: number, size: number, pal: Pal, ink = '#4a2a3a') {
  const { c, s } = a
  const w = size * s
  const h = size * 0.82 * s
  const cx = x * s
  const cy = y * s
  c.save()
  c.lineJoin = 'round'
  c.lineCap = 'round'
  c.strokeStyle = ink
  c.lineWidth = w * 0.035
  c.beginPath()
  c.moveTo(cx, cy - h * 0.38)
  c.quadraticCurveTo(cx + w * 0.02, cy - h * 0.5, cx, cy - h * 0.58)
  c.stroke()
  for (const dir of [-1, 1]) {
    c.save()
    c.translate(cx + dir * w * 0.075, cy - h * 0.6)
    c.rotate(dir * 0.75)
    c.fillStyle = pal.sprout
    c.beginPath()
    c.ellipse(0, 0, w * 0.1, w * 0.05, 0, 0, Math.PI * 2)
    c.fill()
    c.stroke()
    c.restore()
  }
  mochiBody(c, cx, cy, w, h)
  c.fillStyle = pal.body
  c.fill()
  c.stroke()
  c.save()
  c.globalAlpha = 0.55
  c.fillStyle = '#ffffff'
  c.beginPath()
  c.ellipse(cx - w * 0.22, cy - h * 0.2, w * 0.09, h * 0.05, -0.5, 0, Math.PI * 2)
  c.fill()
  c.restore()
  for (const dir of [-1, 1]) {
    c.fillStyle = ink
    c.beginPath()
    c.ellipse(cx + dir * w * 0.16, cy + h * 0.02, w * 0.04, w * 0.055, 0, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#ffffff'
    c.beginPath()
    c.arc(cx + dir * w * 0.16 - w * 0.012, cy - h * 0.012, w * 0.014, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = pal.cheek
    c.globalAlpha = 0.75
    c.beginPath()
    c.ellipse(cx + dir * w * 0.29, cy + h * 0.15, w * 0.075, w * 0.042, 0, 0, Math.PI * 2)
    c.fill()
    c.globalAlpha = 1
  }
  c.lineWidth = w * 0.025
  c.beginPath()
  c.arc(cx, cy + h * 0.07, w * 0.05, 0.2 * Math.PI, 0.8 * Math.PI)
  c.stroke()
  c.restore()
}

function peek(a: ArtArgs, x: number, edge: number, size: number, pal: Pal, ink = '#4a2a3a') {
  const { c, s } = a
  c.save()
  c.beginPath()
  c.rect(0, 0, a.w, edge * s)
  c.clip()
  mochi(a, x, edge - size * 0.16, size, pal, ink)
  c.restore()
  c.save()
  c.fillStyle = pal.body
  c.strokeStyle = ink
  c.lineWidth = size * 0.03 * s
  for (const dir of [-1, 1]) {
    c.beginPath()
    c.ellipse((x + dir * size * 0.3) * s, edge * s, size * 0.075 * s, size * 0.05 * s, 0, 0, Math.PI * 2)
    c.fill()
    c.stroke()
  }
  c.restore()
}

function sunburst(a: ArtArgs, x: number, y: number, r: number, color: string, rays = 24) {
  const { c, s } = a
  c.save()
  c.fillStyle = color
  for (let i = 0; i < rays; i++) {
    const a0 = (Math.PI * 2 * i) / rays
    const a1 = a0 + Math.PI / rays
    c.beginPath()
    c.moveTo(x * s, y * s)
    c.lineTo((x + Math.cos(a0) * r) * s, (y + Math.sin(a0) * r) * s)
    c.lineTo((x + Math.cos(a1) * r) * s, (y + Math.sin(a1) * r) * s)
    c.closePath()
    c.fill()
  }
  c.restore()
}

function bottleCap(a: ArtArgs, x: number, y: number, r: number, fill: string, ink: string) {
  const { c, s } = a
  const teeth = 21
  c.save()
  c.beginPath()
  for (let i = 0; i < teeth * 2; i++) {
    const rad = (i % 2 ? r * 0.9 : r) * s
    const ang = (Math.PI * i) / teeth
    const px = x * s + Math.cos(ang) * rad
    const py = y * s + Math.sin(ang) * rad
    if (i === 0) c.moveTo(px, py)
    else c.lineTo(px, py)
  }
  c.closePath()
  c.fillStyle = fill
  c.fill()
  c.lineJoin = 'round'
  c.lineWidth = 5 * s
  c.strokeStyle = ink
  c.stroke()
  c.restore()
  circle(a, x, y, r * 0.84, '#ffffff')
}

function fizz(a: ArtArgs, x: number, y: number, r: number, color: string) {
  const { c, s } = a
  c.save()
  c.strokeStyle = color
  c.lineWidth = Math.max(2, r * 0.22) * s
  c.beginPath()
  c.arc(x * s, y * s, r * s, 0, Math.PI * 2)
  c.stroke()
  c.fillStyle = color
  c.beginPath()
  c.arc((x - r * 0.35) * s, (y - r * 0.35) * s, r * 0.2 * s, 0, Math.PI * 2)
  c.fill()
  c.restore()
}

function ribbonBanner(a: ArtArgs, x: number, y: number, w: number, h: number, fill: string) {
  const { c, s } = a
  const notch = h * 0.45
  c.save()
  c.fillStyle = fill
  c.beginPath()
  c.moveTo((x - notch) * s, y * s)
  c.lineTo((x + w + notch) * s, y * s)
  c.lineTo((x + w) * s, (y + h / 2) * s)
  c.lineTo((x + w + notch) * s, (y + h) * s)
  c.lineTo((x - notch) * s, (y + h) * s)
  c.lineTo(x * s, (y + h / 2) * s)
  c.closePath()
  c.fill()
  c.restore()
}

function vinyl(a: ArtArgs, x: number, y: number, r: number, label: string, labelR: number) {
  const { c, s } = a
  c.save()
  c.shadowColor = 'rgba(30, 10, 30, 0.35)'
  c.shadowBlur = 40 * s
  c.shadowOffsetY = 12 * s
  circle(a, x, y, r, '#151219')
  c.restore()
  c.save()
  c.strokeStyle = 'rgba(255, 255, 255, 0.07)'
  c.lineWidth = 2 * s
  for (let rr = labelR + 24; rr < r - 10; rr += 13) {
    c.beginPath()
    c.arc(x * s, y * s, rr * s, 0, Math.PI * 2)
    c.stroke()
  }
  c.fillStyle = 'rgba(255, 255, 255, 0.08)'
  for (const start of [-0.9, Math.PI - 0.9]) {
    c.beginPath()
    c.moveTo(x * s, y * s)
    c.arc(x * s, y * s, (r - 8) * s, start, start + 0.45)
    c.closePath()
    c.fill()
  }
  c.restore()
  circle(a, x, y, labelR, label)
}

function ringText(a: ArtArgs, str: string, x: number, y: number, r: number, size: number, color: string) {
  const { c, s } = a
  c.save()
  c.font = `700 ${size * s}px "Oswald"`
  c.fillStyle = color
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  const chars = [...str]
  const step = (Math.PI * 2) / chars.length
  chars.forEach((ch, i) => {
    const ang = -Math.PI / 2 + i * step
    c.save()
    c.translate((x + Math.cos(ang) * r) * s, (y + Math.sin(ang) * r) * s)
    c.rotate(ang + Math.PI / 2)
    c.fillText(ch, 0, 0)
    c.restore()
  })
  c.restore()
}

function cerealO(a: ArtArgs, x: number, y: number, r: number, color: string) {
  const { c, s } = a
  c.save()
  c.lineWidth = r * 0.62 * s
  c.strokeStyle = color
  c.beginPath()
  c.arc(x * s, y * s, r * 0.7 * s, 0, Math.PI * 2)
  c.stroke()
  c.lineWidth = r * 0.14 * s
  c.strokeStyle = 'rgba(255, 255, 255, 0.55)'
  c.beginPath()
  c.arc(x * s, y * s, r * 0.78 * s, Math.PI * 1.1, Math.PI * 1.55)
  c.stroke()
  c.restore()
}

function watermelon(a: ArtArgs, x: number, y: number, r: number, rot: number) {
  const { c, s } = a
  c.save()
  c.translate(x * s, y * s)
  c.rotate(rot)
  c.beginPath()
  c.arc(0, 0, r * s, 0, Math.PI)
  c.closePath()
  c.fillStyle = '#2f9e44'
  c.fill()
  c.beginPath()
  c.arc(0, 0, r * 0.9 * s, 0, Math.PI)
  c.closePath()
  c.fillStyle = '#e9fac8'
  c.fill()
  c.beginPath()
  c.arc(0, 0, r * 0.8 * s, 0, Math.PI)
  c.closePath()
  c.fillStyle = '#ff5d73'
  c.fill()
  c.fillStyle = '#2b1d1d'
  for (const [dx, dy] of [
    [-0.45, 0.2],
    [-0.15, 0.32],
    [0.15, 0.32],
    [0.45, 0.2],
    [-0.3, 0.52],
    [0, 0.6],
    [0.3, 0.52],
  ]) {
    c.beginPath()
    c.ellipse(dx * r * s, dy * r * s, r * 0.045 * s, r * 0.075 * s, dx * 0.8, 0, Math.PI * 2)
    c.fill()
  }
  c.restore()
}

function cassette(a: ArtArgs, x: number, y: number, w: number, h: number, title: string, sub: string) {
  const { c, s } = a
  c.save()
  c.shadowColor = 'rgba(20, 40, 30, 0.3)'
  c.shadowBlur = 24 * s
  c.shadowOffsetY = 10 * s
  box(a, x, y, w, h, '#2b2b33', 28)
  c.restore()
  box(a, x + 40, y + 34, w - 80, h * 0.5, '#fff6e0', 12)
  box(a, x + 40, y + 34, w - 80, 26, '#ff5d73', 8)
  box(a, x + 40, y + 60, w - 80, 14, '#ffc53d')
  text(a, title, x + w / 2, y + 150, { size: 64, family: 'Caveat', weight: 700, align: 'center', color: '#1f2a44', maxW: w - 140 })
  text(a, sub, x + w / 2, y + 196, { size: 22, family: 'Space Mono', weight: 700, align: 'center', color: '#1f2a44', maxW: w - 140 })
  const wy = y + h * 0.72
  box(a, x + w * 0.28, wy - 36, w * 0.44, 72, '#4a4a55', 36)
  for (const dx of [0.33, 0.67]) {
    circle(a, x + w * dx, wy, 34, '#fff6e0')
    circle(a, x + w * dx, wy, 16, '#2b2b33')
  }
  const { c: cc } = a
  cc.save()
  cc.fillStyle = '#3a3a44'
  cc.beginPath()
  cc.moveTo((x + w * 0.18) * s, (y + h) * s)
  cc.lineTo((x + w * 0.24) * s, (y + h * 0.86) * s)
  cc.lineTo((x + w * 0.76) * s, (y + h * 0.86) * s)
  cc.lineTo((x + w * 0.82) * s, (y + h) * s)
  cc.closePath()
  cc.fill()
  cc.restore()
}

function snowflake(a: ArtArgs, x: number, y: number, r: number, color: string) {
  const { c, s } = a
  c.save()
  c.translate(x * s, y * s)
  c.strokeStyle = color
  c.lineCap = 'round'
  c.lineWidth = Math.max(1.5, r * 0.14) * s
  for (let i = 0; i < 6; i++) {
    c.rotate(Math.PI / 3)
    c.beginPath()
    c.moveTo(0, 0)
    c.lineTo(0, -r * s)
    c.moveTo(0, -r * 0.55 * s)
    c.lineTo(-r * 0.25 * s, -r * 0.8 * s)
    c.moveTo(0, -r * 0.55 * s)
    c.lineTo(r * 0.25 * s, -r * 0.8 * s)
    c.stroke()
  }
  c.restore()
}

function snowfall(a: ArtArgs, count: number, seed: number, alpha: number, maxR: number) {
  let n = seed
  const rnd = () => {
    n = (n * 9301 + 49297) % 233280
    return n / 233280
  }
  const W = a.w / a.s
  const H = a.h / a.s
  for (let i = 0; i < count; i++) circle(a, rnd() * W, rnd() * H, 2 + rnd() * maxR, `rgba(255, 255, 255, ${alpha * (0.4 + rnd() * 0.6)})`)
}

function candle(a: ArtArgs, x: number, y: number, h: number) {
  const { c, s } = a
  c.save()
  const g = c.createRadialGradient(x * s, (y - h - 30) * s, 0, x * s, (y - h - 30) * s, 150 * s)
  g.addColorStop(0, 'rgba(255, 214, 140, 0.6)')
  g.addColorStop(1, 'rgba(255, 214, 140, 0)')
  c.fillStyle = g
  c.fillRect((x - 150) * s, (y - h - 180) * s, 300 * s, 300 * s)
  c.restore()
  box(a, x - 26, y - h, 52, h, '#fff1df', 8)
  box(a, x - 26, y - h, 52, 18, '#f7dcc0', 8)
  rule(a, x - 1.5, y - h - 6, x + 1.5, 14, '#3a2a2a')
  c.save()
  c.fillStyle = '#ffcf5c'
  c.beginPath()
  c.moveTo(x * s, (y - h - 62) * s)
  c.quadraticCurveTo((x + 20) * s, (y - h - 22) * s, x * s, (y - h - 8) * s)
  c.quadraticCurveTo((x - 20) * s, (y - h - 22) * s, x * s, (y - h - 62) * s)
  c.fill()
  c.fillStyle = '#fff6d6'
  c.beginPath()
  c.ellipse(x * s, (y - h - 22) * s, 6 * s, 12 * s, 0, 0, Math.PI * 2)
  c.fill()
  c.restore()
}

function sparkle4(a: ArtArgs, x: number, y: number, r: number, fill: string, ink = '#111111') {
  const { c, s } = a
  c.save()
  c.translate(x * s, y * s)
  c.beginPath()
  for (let i = 0; i < 4; i++) {
    const ang = (Math.PI / 2) * i - Math.PI / 2
    if (i === 0) c.moveTo(Math.cos(ang) * r * s, Math.sin(ang) * r * s)
    else c.lineTo(Math.cos(ang) * r * s, Math.sin(ang) * r * s)
    c.quadraticCurveTo(0, 0, Math.cos(ang + Math.PI / 2) * r * s, Math.sin(ang + Math.PI / 2) * r * s)
  }
  c.closePath()
  c.fillStyle = fill
  c.fill()
  c.lineWidth = Math.max(2, r * 0.08) * s
  c.lineJoin = 'round'
  c.strokeStyle = ink
  c.stroke()
  c.restore()
}

function focusLines(a: ArtArgs, x: number, y: number, w: number, h: number, count: number, color: string) {
  const { c, s } = a
  let n = 17
  const rnd = () => {
    n = (n * 9301 + 49297) % 233280
    return n / 233280
  }
  const cx = x + w / 2
  const cy = y + h / 2
  c.save()
  c.beginPath()
  c.rect(x * s, y * s, w * s, h * s)
  c.clip()
  c.fillStyle = color
  for (let i = 0; i < count; i++) {
    const ang = (Math.PI * 2 * i) / count + rnd() * 0.05
    const dx = Math.cos(ang)
    const dy = Math.sin(ang)
    const t = Math.min(Math.abs(w / 2 / (dx || 1e-6)), Math.abs(h / 2 / (dy || 1e-6)))
    const len = 50 + rnd() * 110
    const spread = 0.012 + rnd() * 0.01
    c.beginPath()
    c.moveTo((cx + Math.cos(ang - spread) * (t + 40)) * s, (cy + Math.sin(ang - spread) * (t + 40)) * s)
    c.lineTo((cx + Math.cos(ang + spread) * (t + 40)) * s, (cy + Math.sin(ang + spread) * (t + 40)) * s)
    c.lineTo((cx + dx * (t - len)) * s, (cy + dy * (t - len)) * s)
    c.closePath()
    c.fill()
  }
  c.restore()
}

function awning(a: ArtArgs, y: number, h: number, stripe: number, colors: [string, string]) {
  const { c, s } = a
  const W = a.w / s
  c.save()
  for (let i = 0, x = 0; x < W; i++, x += stripe) {
    c.fillStyle = colors[i % 2]
    c.beginPath()
    c.rect(x * s, y * s, stripe * s, h * s)
    c.fill()
    c.beginPath()
    c.arc((x + stripe / 2) * s, (y + h) * s, (stripe / 2) * s, 0, Math.PI)
    c.fill()
  }
  c.restore()
}

function moonGlow(a: ArtArgs, x: number, y: number, r: number) {
  const { c, s } = a
  c.save()
  const g = c.createRadialGradient(x * s, y * s, r * 0.6 * s, x * s, y * s, r * 2.6 * s)
  g.addColorStop(0, 'rgba(255, 244, 205, 0.55)')
  g.addColorStop(1, 'rgba(255, 244, 205, 0)')
  c.fillStyle = g
  c.fillRect((x - r * 3) * s, (y - r * 3) * s, r * 6 * s, r * 6 * s)
  c.restore()
  circle(a, x, y, r, '#fff4cd')
  circle(a, x - r * 0.28, y - r * 0.2, r * 0.22, 'rgba(231, 214, 160, 0.55)')
  circle(a, x + r * 0.32, y + r * 0.25, r * 0.16, 'rgba(231, 214, 160, 0.55)')
  circle(a, x + r * 0.12, y - r * 0.42, r * 0.1, 'rgba(231, 214, 160, 0.55)')
}

function bamboo(a: ArtArgs, x: number, y1: number, y2: number, w: number, color: string) {
  const { c, s } = a
  c.save()
  c.fillStyle = color
  c.fillRect((x - w / 2) * s, y1 * s, w * s, (y2 - y1) * s)
  c.fillStyle = 'rgba(255, 255, 255, 0.12)'
  c.fillRect((x - w / 2) * s, y1 * s, w * 0.28 * s, (y2 - y1) * s)
  const step = w * 3.4
  c.fillStyle = 'rgba(0, 0, 0, 0.35)'
  for (let y = y1 + step * 0.6; y < y2; y += step) c.fillRect((x - w / 2 - 3) * s, y * s, (w + 6) * s, w * 0.2 * s)
  c.fillStyle = color
  let k = 0
  for (let y = y1 + step * 1.2; y < y2; y += step * 2) {
    const dir = k++ % 2 ? -1 : 1
    c.save()
    c.translate((x + dir * w * 0.5) * s, y * s)
    c.rotate(dir * -0.9)
    c.beginPath()
    c.ellipse(dir * w * 1.6 * s, 0, w * 1.7 * s, w * 0.28 * s, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
  c.restore()
}

function seigaiha(a: ArtArgs, x: number, y: number, w: number, rows: number, r: number, colors: [string, string, string]) {
  const { c, s } = a
  c.save()
  c.beginPath()
  c.rect(x * s, y * s, w * s, a.h - y * s)
  c.clip()
  c.lineWidth = Math.max(1.5, r * 0.04) * s
  c.strokeStyle = colors[2]
  const rings = [1, 0.74, 0.48, 0.22]
  for (let j = 0; j < rows; j++) {
    for (let i = -1; i <= Math.ceil(w / (r * 2)); i++) {
      const cx = x + i * r * 2 + (j % 2) * r
      const cy = y + j * r * 0.5
      rings.forEach((k, n) => {
        c.beginPath()
        c.arc(cx * s, cy * s, r * k * s, 0, Math.PI * 2)
        c.fillStyle = colors[n % 2]
        c.fill()
        c.stroke()
      })
    }
  }
  c.restore()
}

function checkerBorder(a: ArtArgs, size: number, c1: string, c2: string) {
  const W = a.w / a.s
  const H = a.h / a.s
  const cols = Math.round(W / size)
  const rows = Math.round(H / size)
  const cw = W / cols
  const ch = H / rows
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (i > 0 && i < cols - 1 && j > 0 && j < rows - 1) continue
      box(a, i * cw, j * ch, cw + 0.5, ch + 0.5, (i + j) % 2 ? c1 : c2)
    }
  }
}

function wisteria(a: ArtArgs, x: number, y: number, len: number, seed: number) {
  let n = seed
  const rnd = () => {
    n = (n * 9301 + 49297) % 233280
    return n / 233280
  }
  const palette = ['#b79cf0', '#9b7be0', '#d4c2ff', '#8564cc']
  const rows = Math.round(len / 16)
  for (let i = 0; i < rows; i++) {
    const t = i / rows
    const spread = (1 - t) * 46 + 4
    const count = Math.round((1 - t) * 5) + 1
    for (let k = 0; k < count; k++) circle(a, x + (rnd() - 0.5) * 2 * spread, y + i * 16 + rnd() * 6, 8 + rnd() * 5 * (1 - t), palette[Math.floor(rnd() * palette.length)])
  }
}

function slash(a: ArtArgs, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, rgb: string) {
  const { c, s } = a
  c.save()
  c.lineCap = 'round'
  for (const [w, col] of [
    [30, `rgba(${rgb}, 0.22)`],
    [12, `rgb(${rgb})`],
    [4, '#ffffff'],
  ] as [number, string][]) {
    c.strokeStyle = col
    c.lineWidth = w * s
    c.beginPath()
    c.moveTo(x1 * s, y1 * s)
    c.quadraticCurveTo(cx * s, cy * s, x2 * s, y2 * s)
    c.stroke()
  }
  c.restore()
}

function embers(a: ArtArgs, count: number, seed: number, y1: number, y2: number, rgb: string) {
  let n = seed
  const rnd = () => {
    n = (n * 9301 + 49297) % 233280
    return n / 233280
  }
  for (let i = 0; i < count; i++) circle(a, 40 + rnd() * 1120, y1 + rnd() * (y2 - y1), 2 + rnd() * 4, `rgba(${rgb}, ${0.35 + rnd() * 0.6})`)
}

function airmailBorder(a: ArtArgs, thickness: number, colors: string[]) {
  const { c, s } = a
  const W = a.w / s
  const H = a.h / s
  const stripe = 34
  c.save()
  c.beginPath()
  c.rect(0, 0, a.w, a.h)
  c.rect(thickness * s, thickness * s, (W - thickness * 2) * s, (H - thickness * 2) * s)
  c.clip('evenodd')
  for (let i = 0; i * stripe < W + H; i++) {
    c.fillStyle = colors[i % colors.length]
    c.beginPath()
    c.moveTo(i * stripe * s, 0)
    c.lineTo((i + 1) * stripe * s, 0)
    c.lineTo(((i + 1) * stripe - H) * s, a.h)
    c.lineTo((i * stripe - H) * s, a.h)
    c.closePath()
    c.fill()
  }
  c.restore()
}

function stamp(a: ArtArgs, x: number, y: number, w: number, h: number) {
  const { c, s } = a
  c.save()
  c.shadowColor = 'rgba(31, 47, 90, 0.25)'
  c.shadowBlur = 10 * s
  c.shadowOffsetY = 4 * s
  c.fillStyle = '#ffffff'
  c.fillRect(x * s, y * s, w * s, h * s)
  c.restore()
  for (let px = x; px <= x + w + 0.1; px += 18) {
    circle(a, px, y, 6, a.paper)
    circle(a, px, y + h, 6, a.paper)
  }
  for (let py = y; py <= y + h + 0.1; py += 18) {
    circle(a, x, py, 6, a.paper)
    circle(a, x + w, py, 6, a.paper)
  }
  box(a, x + 16, y + 16, w - 32, h - 32, a.accent)
  heart(a, x + w / 2, y + h * 0.42, 52, '#ffffff')
  text(a, a.t.stampName, x + w / 2, y + h - 52, { size: 22, family: 'Oswald', weight: 700, align: 'center', color: '#ffffff', spacing: 3, maxW: w - 48 })
  text(a, a.t.stampValue, x + w / 2, y + h - 28, { size: 20, family: 'Space Mono', weight: 700, align: 'center', color: '#ffffff', maxW: w - 48 })
}

function postmark(a: ArtArgs, x: number, y: number, r: number, color: string) {
  const { c, s } = a
  c.save()
  c.globalAlpha = 0.72
  c.strokeStyle = color
  c.lineWidth = 4 * s
  c.beginPath()
  c.arc(x * s, y * s, r * s, 0, Math.PI * 2)
  c.stroke()
  c.beginPath()
  c.arc(x * s, y * s, r * 0.66 * s, 0, Math.PI * 2)
  c.stroke()
  c.restore()
  c.save()
  c.globalAlpha = 0.72
  ringText(a, a.t.postmark, x, y, r * 0.82, 15, color)
  c.restore()
  const day = a.date.toLocaleDateString(a.locale, { day: '2-digit', month: 'short' }).toUpperCase()
  text(a, day, x, y + 8, { size: 22, family: 'Space Mono', weight: 700, align: 'center', color, maxW: r * 1.1 })
}

function paperPlane(a: ArtArgs, x: number, y: number, size: number, rot: number) {
  const { c, s } = a
  c.save()
  c.translate(x * s, y * s)
  c.rotate(rot)
  c.lineJoin = 'round'
  c.strokeStyle = a.ink
  c.lineWidth = size * 0.06 * s
  c.fillStyle = '#ffffff'
  c.beginPath()
  c.moveTo(-size * s, size * 0.1 * s)
  c.lineTo(size * s, -size * 0.1 * s)
  c.lineTo(-size * 0.3 * s, size * 0.5 * s)
  c.closePath()
  c.fill()
  c.stroke()
  c.fillStyle = '#d7e3f7'
  c.beginPath()
  c.moveTo(-size * s, size * 0.1 * s)
  c.lineTo(-size * 0.15 * s, size * 0.2 * s)
  c.lineTo(-size * 0.3 * s, size * 0.5 * s)
  c.closePath()
  c.fill()
  c.stroke()
  c.restore()
}

function speech(a: ArtArgs, x: number, y: number, w: number, h: number, tail: 'left' | 'right', line: string, sub: string, fill: string) {
  const { c, s } = a
  c.save()
  c.fillStyle = fill
  c.strokeStyle = a.ink
  c.lineWidth = 5 * s
  c.lineJoin = 'round'
  c.beginPath()
  c.roundRect(x * s, y * s, w * s, h * s, 34 * s)
  c.fill()
  c.stroke()
  const tx = tail === 'left' ? x + 52 : x + w - 52
  const dir = tail === 'left' ? -1 : 1
  c.beginPath()
  c.moveTo((tx - 18) * s, (y + h - 2) * s)
  c.lineTo((tx + dir * 22) * s, (y + h + 42) * s)
  c.lineTo((tx + 22) * s, (y + h - 2) * s)
  c.closePath()
  c.fill()
  c.stroke()
  c.fillRect((tx - 15) * s, (y + h - 7) * s, 35 * s, 11 * s)
  c.restore()
  text(a, line, x + w / 2, y + h * 0.48, { size: 38, family: 'Fredoka', weight: 700, align: 'center', color: a.ink, maxW: w - 44 })
  text(a, sub, x + w / 2, y + h * 0.82, { size: 32, family: 'Caveat', weight: 700, align: 'center', color: a.accent, maxW: w - 44 })
}

function melonSlice(a: ArtArgs, cx: number, cy: number, r: number) {
  const { c, s } = a
  circle(a, cx, cy, r + 80, '#2f9e44')
  c.save()
  c.fillStyle = '#237a35'
  for (let i = 0; i < 24; i += 2) {
    c.beginPath()
    c.moveTo(cx * s, cy * s)
    c.arc(cx * s, cy * s, (r + 80) * s, (i * Math.PI) / 12, ((i + 1) * Math.PI) / 12)
    c.closePath()
    c.fill()
  }
  c.restore()
  circle(a, cx, cy, r + 48, '#e9fac8')
  circle(a, cx, cy, r + 32, '#ff5d73')
  c.save()
  c.fillStyle = '#2b1d1d'
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2 + 0.2
    c.save()
    c.translate((cx + Math.cos(ang) * (r + 16)) * s, (cy + Math.sin(ang) * (r + 16)) * s)
    c.rotate(ang + Math.PI / 2)
    c.beginPath()
    c.ellipse(0, 0, 5 * s, 10 * s, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
  c.restore()
}

function twinkles(a: ArtArgs, count: number, seed: number, y1: number, y2: number) {
  let n = seed
  const rnd = () => {
    n = (n * 9301 + 49297) % 233280
    return n / 233280
  }
  for (let i = 0; i < count; i++) {
    const x = 30 + rnd() * 1140
    const y = y1 + rnd() * (y2 - y1)
    if (rnd() > 0.82) sparkle4(a, x, y, 12 + rnd() * 14, '#fff6c8', '#fff6c8')
    else circle(a, x, y, 1.5 + rnd() * 3, `rgba(255, 246, 200, ${0.5 + rnd() * 0.5})`)
  }
}

function spotBeam(a: ArtArgs, x: number, topW: number, tx: number, ty: number, bottomW: number) {
  const { c, s } = a
  c.save()
  const g = c.createLinearGradient(0, 0, 0, ty * s)
  g.addColorStop(0, 'rgba(255, 246, 214, 0.3)')
  g.addColorStop(1, 'rgba(255, 246, 214, 0)')
  c.fillStyle = g
  c.beginPath()
  c.moveTo((x - topW / 2) * s, 0)
  c.lineTo((x + topW / 2) * s, 0)
  c.lineTo((tx + bottomW / 2) * s, ty * s)
  c.lineTo((tx - bottomW / 2) * s, ty * s)
  c.closePath()
  c.fill()
  c.restore()
}

function equalizer(a: ArtArgs, y: number, colors: string[]) {
  const W = a.w / a.s
  const heights = [26, 54, 38, 70, 44, 82, 30, 60, 48, 76, 34, 64]
  for (let i = 0, x = 6; x < W; i++, x += 36) box(a, x, y - heights[i % heights.length], 24, heights[i % heights.length] + 200, colors[i % colors.length], 6)
}

const monthYear = (a: ArtArgs) => a.date.toLocaleDateString(a.locale, { month: 'long', year: 'numeric' }).toUpperCase()
const shortDate = (a: ArtArgs) => a.date.toLocaleDateString(a.locale, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
const clock = (a: ArtArgs) => a.date.toLocaleTimeString(a.locale, { hour: '2-digit', minute: '2-digit' })

export const templateArt: Record<string, TemplateArt> = {
  newspaper: {
    under: (a) => {
      rule(a, 50, 46, 420, 2)
      rule(a, 780, 46, 1150, 2)
      text(a, a.t.special, 600, 57, { size: 28, family: 'Playfair Display', weight: 700, align: 'center', spacing: 3 })
      text(a, a.t.vol, 50, 160, { size: 26, family: 'Playfair Display', weight: 700, maxW: 250 })
      text(a, '*', 335, 182, { size: 74, family: 'Playfair Display', weight: 900, align: 'center' })
      text(a, a.t.masthead, 600, 182, { size: 120, family: 'UnifrakturMaguntia', align: 'center', maxW: 480 })
      text(a, '*', 865, 182, { size: 74, family: 'Playfair Display', weight: 900, align: 'center' })
      text(a, monthYear(a), 1150, 160, { size: 26, family: 'Playfair Display', weight: 700, align: 'right', maxW: 250 })
      rule(a, 50, 210, 1150, 6)
      rule(a, 50, 222, 1150, 2)
      box(a, 50, 245, 280, 130, a.ink)
      text(a, a.t.story1, 190, 300, { size: 40, family: 'Oswald', weight: 700, color: a.paper, align: 'center', maxW: 250 })
      text(a, a.t.story2, 190, 350, { size: 40, family: 'Oswald', weight: 700, color: a.paper, align: 'center', maxW: 250 })
      paragraph(a, a.t.paragraph, 50, 424, 280, 38, { size: 27, family: 'Playfair Display', italic: true }, 10)
      rule(a, 50, 790, 330, 2)
      box(a, 50, 810, 280, 320, a.ink)
      for (let i = 0; i < 5; i++) text(a, a.t.exclusive, 190, 872 + i * 58, { size: 46, family: 'Oswald', weight: 700, color: a.paper, align: 'center', maxW: 250 })
      text(a, (a.caption || 'Snapo').toUpperCase(), 360, 345, { size: 140, family: 'Playfair Display', weight: 900, maxW: 790 })
      paragraph(a, a.t.subhead.toUpperCase(), 360, 418, 790, 58, { size: 54, family: 'Playfair Display', weight: 900 }, 2)
      rule(a, 360, 506, 1150, 5)
      rule(a, 360, 518, 1150, 2)
      rule(a, 50, 1152, 1150, 4)
      rule(a, 50, 1163, 1150, 1.5)
      text(a, a.t.ticker, 600, 1212, { size: 38, family: 'Oswald', weight: 700, align: 'center', spacing: 2, maxW: 1100 })
      rule(a, 50, 1233, 1150, 1.5)
      rule(a, 50, 1244, 1150, 4)
      paragraph(a, a.t.footer, 440, 1300, 320, 31, { size: 22, family: 'Playfair Display', italic: true, align: 'center' }, 8)
    },
  },
  magazine: {
    over: (a) => {
      text(a, a.t.issue(monthYear(a)), 60, 74, { size: 26, family: 'Oswald', weight: 500, color: '#ffffff', spacing: 3, shadow: true })
      text(a, 'SNAPO', 600, 330, { size: 300, family: 'Playfair Display', weight: 900, color: '#ffffff', align: 'center', shadow: true, maxW: 1100 })
      text(a, a.caption || 'Cover Star', 60, 960, { size: 104, family: 'Playfair Display', weight: 900, color: '#ffffff', shadow: true, maxW: 600 })
      const lines = [a.t.cover1, a.t.cover2, a.t.cover3]
      lines.forEach((ln, i) => {
        const y = 1050 + i * 78
        const { c, s } = a
        c.save()
        c.font = `500 ${36 * s}px "Oswald"`
        const width = Math.min(560, c.measureText(ln.toUpperCase()).width / s + 28)
        c.restore()
        box(a, 60, y - 46, width, 60, a.accent, 6)
        text(a, ln.toUpperCase(), 74, y, { size: 36, family: 'Oswald', weight: 500, color: '#1b1a18', maxW: 530 })
      })
      box(a, 60, 1390, 270, 160, '#ffffff', 8)
      barcode(a, 82, 1408, 226, 100, '#111111')
      text(a, '0 07 2026 SNAPO', 195, 1535, { size: 18, family: 'Space Mono', color: '#111111', align: 'center' })
    },
  },
  kitty: {
    under: (a) => {
      for (const [x, y, r] of [
        [120, 120, 60],
        [1080, 140, 70],
        [140, 1690, 56],
        [1060, 1700, 64],
        [600, 70, 40],
      ])
        paw(a, x, y, r, 'rgba(255,255,255,0.75)')
      text(a, a.t.kitty, 600, 255, { size: 130, family: 'Fredoka', weight: 700, align: 'center', color: a.ink, stroke: '#ffffff', strokeW: 22, maxW: 900 })
    },
    over: (a) => {
      for (const sl of a.slots) {
        bow(a, sl.x + 40, sl.y + 36, 96, '#ff6f91')
        paw(a, sl.x + sl.w - 46, sl.y + sl.h - 40, 48, 'rgba(255,255,255,0.9)')
      }
    },
  },
  mochi: {
    under: (a) => {
      mochi(a, 230, 232, 280, mochiPals[0], a.ink)
      text(a, a.t.mochi, 740, 250, { size: 128, family: 'Fredoka', weight: 700, align: 'center', color: a.ink, stroke: '#ffffff', strokeW: 24, maxW: 760 })
      text(a, a.t.mochiTag, 740, 330, { size: 46, family: 'Caveat', weight: 700, align: 'center', color: '#7a52c7', maxW: 700 })
      box(a, 110, 1545, 980, 200, 'rgba(255, 255, 255, 0.9)', 60)
      for (const [x, y, r] of [
        [1110, 110, 16],
        [1150, 400, 10],
        [70, 470, 12],
      ])
        star(a, x, y, r, '#ffffff')
    },
    over: (a) => {
      a.slots.forEach((sl, i) => {
        const pal = mochiPals[i % mochiPals.length]
        const x = i % 2 ? sl.x + sl.w * 0.7 : sl.x + sl.w * 0.3
        peek(a, x, sl.y, 170, pal, a.ink)
      })
    },
  },
  bunny: {
    under: (a) => {
      text(a, a.t.bunny, 600, 230, { size: 120, family: 'Fredoka', weight: 700, align: 'center', color: a.ink, stroke: '#ffffff', strokeW: 22, maxW: 1000 })
      const { c, s } = a
      c.save()
      c.fillStyle = '#ffffff'
      c.fillRect(0, 1120 * s, a.w, a.h - 1120 * s)
      c.fillStyle = 'rgba(232, 88, 110, 0.32)'
      for (let x = 0; x < 1200; x += 80) c.fillRect(x * s, 1120 * s, 40 * s, 680 * s)
      for (let y = 1120; y < 1800; y += 80) c.fillRect(0, y * s, a.w, 40 * s)
      c.restore()
      box(a, 110, 1260, 980, 260, 'rgba(255,255,255,0.92)', 40)
    },
    over: (a) => {
      for (const sl of a.slots) ears(a, sl.x + sl.w / 2, sl.y + 20, 150)
    },
  },
  bear: {
    under: (a) => {
      box(a, 70, 60, 1060, 260, '#8a5a2b', 28)
      box(a, 84, 74, 1032, 232, '#2f4a3c', 20)
      text(a, a.t.bearCafe, 600, 180, { size: 100, family: 'Caveat', weight: 700, align: 'center', color: '#ffffff', maxW: 960 })
      text(a, `${a.t.todays}: ${a.caption || 'honey latte'}`, 600, 268, { size: 54, family: 'Caveat', weight: 700, align: 'center', color: '#ffe8b0', maxW: 960 })
      text(a, a.t.bearFooter, 600, 1540, { size: 58, family: 'Caveat', weight: 700, align: 'center', color: a.ink, maxW: 1000 })
    },
    over: (a) => {
      for (const sl of a.slots) {
        box(a, sl.x + 18, sl.y + sl.h - 70, 130, 52, '#fff7e8', 10)
        outline(a, sl.x + 18, sl.y + sl.h - 70, 130, 52, '#8a5a2b', 3, 10)
        text(a, `No. ${sl.index + 1}`, sl.x + 83, sl.y + sl.h - 32, { size: 36, family: 'Caveat', weight: 700, align: 'center', color: '#6b4318' })
      }
    },
  },
  photocard: {
    over: (a) => {
      text(a, a.t.photocard, 110, 140, { size: 30, family: 'Oswald', weight: 700, color: '#ffffff', spacing: 4, shadow: true })
      text(a, a.caption || 'Bestie', 550, 1530, { size: 92, family: 'Fredoka', weight: 700, align: 'center', color: a.ink, maxW: 960 })
      text(a, a.t.member(shortDate(a)), 550, 1610, { size: 28, family: 'Space Mono', weight: 700, align: 'center', color: a.ink, maxW: 960 })
      const { c, s } = a
      c.save()
      const g = c.createLinearGradient(870 * s, 1220 * s, 1030 * s, 1380 * s)
      g.addColorStop(0, '#ffd6ec')
      g.addColorStop(0.35, '#c7e4ff')
      g.addColorStop(0.7, '#d8ffe8')
      g.addColorStop(1, '#fff1a6')
      c.fillStyle = g
      c.beginPath()
      c.arc(950 * s, 1300 * s, 80 * s, 0, Math.PI * 2)
      c.fill()
      c.lineWidth = 4 * s
      c.strokeStyle = '#ffffff'
      c.stroke()
      c.restore()
      star(a, 950, 1290, 40, '#ffffff')
      text(a, 'SNAPO', 950, 1350, { size: 20, family: 'Oswald', weight: 700, align: 'center', color: '#5a3a7a', spacing: 2 })
    },
  },
  camcorder: {
    over: (a) => {
      const white = '#ffffff'
      a.slots.forEach((sl, i) => {
        const L = 34
        const inset = 18
        for (const [cx, cy, dx, dy] of [
          [sl.x + inset, sl.y + inset, 1, 1],
          [sl.x + sl.w - inset, sl.y + inset, -1, 1],
          [sl.x + inset, sl.y + sl.h - inset, 1, -1],
          [sl.x + sl.w - inset, sl.y + sl.h - inset, -1, -1],
        ]) {
          rule(a, Math.min(cx, cx + dx * L), cy, Math.max(cx, cx + dx * L), 4, white)
          const { c, s } = a
          c.save()
          c.fillStyle = white
          c.fillRect((cx - 2) * s, Math.min(cy, cy + dy * L) * s, 4 * s, L * s)
          c.restore()
        }
        circle(a, sl.x + 52, sl.y + 56, 10, '#ff3b3b')
        text(a, 'REC', sl.x + 70, sl.y + 65, { size: 26, family: 'Space Mono', weight: 700, color: white, shadow: true })
        outline(a, sl.x + sl.w - 116, sl.y + 40, 64, 28, white, 3, 3)
        box(a, sl.x + sl.w - 52, sl.y + 48, 6, 12, white)
        for (let k = 0; k < 3; k++) box(a, sl.x + sl.w - 110 + k * 19, sl.y + 46, 14, 16, white)
        const sec = String((17 + i * 13) % 60).padStart(2, '0')
        text(a, `00:0${i}:${sec}`, sl.x + 44, sl.y + sl.h - 40, { size: 22, family: 'Space Mono', weight: 700, color: white, shadow: true })
        text(a, shortDate(a), sl.x + sl.w - 44, sl.y + sl.h - 40, { size: 22, family: 'Space Mono', weight: 700, color: white, align: 'right', shadow: true })
      })
      text(a, (a.caption || 'home video').toUpperCase(), 300, 1720, { size: 44, family: 'Silkscreen', align: 'center', maxW: 520 })
      text(a, `${a.t.play}  >  SP`, 300, 1800, { size: 28, family: 'Space Mono', weight: 700, align: 'center' })
    },
  },
  negative: {
    under: (a) => {
      for (let y = 26; y + 26 < 1900; y += 62) {
        box(a, 22, y, 34, 26, a.accent, 6)
        box(a, 584, y, 34, 26, a.accent, 6)
      }
      const { c, s } = a
      for (let i = 0; i < 5; i++) {
        c.save()
        c.translate(84 * s, (300 + i * 300) * s)
        c.rotate(-Math.PI / 2)
        c.font = `700 ${20 * s}px "Space Mono"`
        c.fillStyle = a.ink
        c.textAlign = 'center'
        c.fillText(a.t.roll, 0, 0)
        c.restore()
      }
      a.slots.forEach((sl) => {
        c.save()
        c.translate(566 * s, (sl.y + sl.h / 2) * s)
        c.rotate(-Math.PI / 2)
        c.font = `700 ${22 * s}px "Space Mono"`
        c.fillStyle = a.ink
        c.textAlign = 'center'
        c.fillText(`${sl.index + 1}   >   ${sl.index + 1}A`, 0, 0)
        c.restore()
      })
      text(a, a.caption || 'roll one', 320, 1740, { size: 46, family: 'Space Mono', weight: 700, align: 'center', maxW: 440 })
      text(a, a.t.roll, 320, 1800, { size: 22, family: 'Space Mono', align: 'center' })
    },
  },
  pocket: {
    under: (a) => {
      outline(a, 40, 40, 1120, 1720, a.accent, 6, 70)
      box(a, 150, 140, 900, 720, '#4b4560', 28)
      text(a, a.t.pocketLabel, 600, 186, { size: 24, family: 'Oswald', weight: 500, color: '#c9c3dc', align: 'center', spacing: 3, maxW: 800 })
      circle(a, 190, 470, 12, '#ff4d6d')
      text(a, a.t.battery, 190, 510, { size: 15, family: 'Oswald', weight: 500, color: '#c9c3dc', align: 'center' })
      text(a, 'Snapo', 360, 980, { size: 78, family: 'Playfair Display', weight: 900, italic: false, color: a.ink })
      text(a, 'POCKET', 640, 980, { size: 54, family: 'Oswald', weight: 700, color: '#c2185b', spacing: 4 })
      text(a, a.caption || 'level up', 600, 1060, { size: 34, family: 'Silkscreen', align: 'center', maxW: 900 })
      box(a, 285, 1170, 90, 260, '#2f2a3a', 12)
      box(a, 200, 1255, 260, 90, '#2f2a3a', 12)
      circle(a, 330, 1300, 18, '#4b4560')
      circle(a, 860, 1340, 64, '#c2185b')
      circle(a, 1010, 1250, 64, '#c2185b')
      text(a, 'B', 860, 1450, { size: 34, family: 'Oswald', weight: 700, align: 'center' })
      text(a, 'A', 1010, 1360, { size: 34, family: 'Oswald', weight: 700, align: 'center' })
      const { c, s } = a
      for (const [x, label] of [
        [470, 'SELECT'],
        [650, 'START'],
      ] as const) {
        c.save()
        c.translate(x * s, 1560 * s)
        c.rotate(-0.45)
        c.fillStyle = '#8e88a3'
        c.beginPath()
        c.roundRect(-60 * s, -15 * s, 120 * s, 30 * s, 15 * s)
        c.fill()
        c.restore()
        text(a, label, x + 10, 1625, { size: 22, family: 'Oswald', weight: 500, align: 'center', spacing: 2 })
      }
      c.save()
      c.strokeStyle = a.accent
      c.lineWidth = 10 * s
      c.lineCap = 'round'
      for (let i = 0; i < 6; i++) {
        c.beginPath()
        c.moveTo((900 + i * 34) * s, 1700 * s)
        c.lineTo((960 + i * 34) * s, 1560 * s)
        c.stroke()
      }
      c.restore()
    },
    over: (a) => {
      const sl = a.slots[0]
      text(a, a.t.player, sl.x + 24, sl.y + 50, { size: 26, family: 'Silkscreen', color: '#ffffff', shadow: true })
      for (let i = 0; i < 3; i++) heart(a, sl.x + sl.w - 40 - i * 46, sl.y + 40, 34, '#ff4d6d')
    },
  },
  pop: {
    under: (a) => {
      sunburst(a, 600, 190, 900, 'rgba(255, 214, 102, 0.35)', 28)
      text(a, a.t.pop, 600, 250, { size: 168, family: 'Pacifico', align: 'center', color: a.ink, stroke: '#ffffff', strokeW: 26, maxW: 1000 })
      ribbonBanner(a, 270, 300, 660, 70, a.accent)
      text(a, a.t.popTag, 600, 350, { size: 38, family: 'Oswald', weight: 700, align: 'center', color: '#ffffff', spacing: 4, maxW: 620 })
      for (const sl of a.slots.slice(1)) bottleCap(a, sl.x + sl.w / 2, sl.y + sl.h / 2, 172, a.ink, '#7a0a1c')
      const bubbles: [number, number, number][] = [
        [40, 1180, 16],
        [62, 1090, 10],
        [34, 1000, 22],
        [58, 880, 9],
        [1160, 1190, 14],
        [1140, 1080, 22],
        [1166, 960, 10],
        [1146, 860, 16],
      ]
      for (const [x, y, r] of bubbles) fizz(a, x, y, r, a.accent)
      text(a, (a.caption || 'stay fizzy').toLowerCase(), 600, 1670, { size: 92, family: 'Pacifico', align: 'center', color: a.ink, maxW: 1000 })
      rule(a, 160, 1712, 1040, 4, a.accent)
      text(a, a.t.bottling(a.date.getFullYear()), 600, 1762, { size: 30, family: 'Oswald', weight: 500, align: 'center', color: a.ink, spacing: 4, maxW: 1000 })
    },
    over: (a) => {
      const main = a.slots[0]
      burst(a, main.x + main.w - 70, main.y + 60, 120, '#ffd166', a.t.iceCold, '#ffffff')
    },
  },
  records: {
    under: (a) => {
      const disc = a.slots[4]
      const cx = disc.x + disc.w / 2
      const cy = disc.y + disc.h / 2
      vinyl(a, cx, cy, 600, a.accent, 222)
      const { c, s } = a
      c.save()
      c.shadowColor = 'rgba(40, 15, 40, 0.35)'
      c.shadowBlur = 50 * s
      c.shadowOffsetX = 14 * s
      c.shadowOffsetY = 16 * s
      box(a, 60, 50, 1200, 1200, '#fff8ee', 6)
      c.restore()
      box(a, 60, 50, 1200, 100, a.ink, 6)
      text(a, a.t.records, 110, 118, { size: 46, family: 'Oswald', weight: 700, color: '#fff8ee', spacing: 6, maxW: 700 })
      text(a, 'LP', 1210, 118, { size: 46, family: 'Oswald', weight: 700, color: a.accent, align: 'right' })
      text(a, a.caption || 'Greatest Hits', 110, 1120, { size: 110, family: 'Playfair Display', weight: 900, color: a.ink, maxW: 820 })
      text(a, a.t.recordsSub, 112, 1196, { size: 40, family: 'Playfair Display', italic: true, color: a.ink, maxW: 820 })
      text(a, a.t.recordsVol, 1210, 1110, { size: 28, family: 'Space Mono', weight: 700, color: a.ink, align: 'right', maxW: 300 })
      text(a, String(a.date.getFullYear()), 1210, 1190, { size: 64, family: 'Oswald', weight: 700, color: a.accent, align: 'right' })
      ringText(a, `${a.t.sideA}  *  ${a.t.rpm}  *  ${a.t.records}  *  `, cx, cy, 196, 22, '#ffffff')
    },
    over: (a) => {
      const disc = a.slots[4]
      circle(a, disc.x + disc.w / 2, disc.y + disc.h / 2, 14, '#151219')
      circle(a, 1180, 140, 96, '#ffd84d')
      const { c, s } = a
      c.save()
      c.setLineDash([8 * s, 6 * s])
      c.strokeStyle = a.ink
      c.lineWidth = 3 * s
      c.beginPath()
      c.arc(1180 * s, 140 * s, 82 * s, 0, Math.PI * 2)
      c.stroke()
      c.restore()
      c.save()
      c.translate(1180 * s, 140 * s)
      c.rotate(0.22)
      text(a, a.t.limited1, 0, -4, { size: 30, family: 'Oswald', weight: 700, color: a.ink, align: 'center', maxW: 140 })
      text(a, a.t.limited2, 0, 30, { size: 30, family: 'Oswald', weight: 700, color: a.ink, align: 'center', maxW: 140 })
      c.restore()
    },
  },
  ticket: {
    under: (a) => {
      text(a, a.t.cinema, 60, 118, { size: 74, family: 'Oswald', weight: 700, spacing: 3, maxW: 900 })
      star(a, 1000, 92, 22, a.ink)
      star(a, 1050, 70, 14, a.ink)
      text(a, a.t.nowShowing(a.caption || 'Our Little Movie'), 60, 172, { size: 34, family: 'Playfair Display', italic: true, maxW: 1250 })
      text(a, a.t.seatLine(clock(a)), 60, 640, { size: 30, family: 'Space Mono', weight: 700, maxW: 1250 })
      box(a, 1360, -30, 40, 60, a.accent, 20)
      box(a, 1360, 670, 40, 60, a.accent, 20)
      dashed(a, 1380, 40, 1380, 660, a.ink, 4, 16)
      const { c, s } = a
      c.save()
      c.translate(1500 * s, 350 * s)
      c.rotate(-Math.PI / 2)
      text(a, a.t.admit, 0, 28, { size: 84, family: 'Oswald', weight: 700, align: 'center', maxW: 600 })
      text(a, 'No. 000777', 0, 100, { size: 26, family: 'Space Mono', weight: 700, align: 'center' })
      c.restore()
      barcode(a, 1660, 120, 90, 460, a.ink, true)
    },
  },
  receipt: {
    under: (a) => {
      const { c, s } = a
      c.save()
      c.fillStyle = a.accent
      for (let x = 0; x < 700; x += 28) {
        c.beginPath()
        c.moveTo(x * s, 0)
        c.lineTo((x + 14) * s, 18 * s)
        c.lineTo((x + 28) * s, 0)
        c.fill()
        c.beginPath()
        c.moveTo(x * s, 2150 * s)
        c.lineTo((x + 14) * s, 2132 * s)
        c.lineTo((x + 28) * s, 2150 * s)
        c.fill()
      }
      c.restore()
      text(a, a.t.mart, 350, 112, { size: 58, family: 'Space Mono', weight: 700, align: 'center', maxW: 600 })
      text(a, a.t.address, 350, 154, { size: 22, family: 'Space Mono', align: 'center', maxW: 600 })
      text(a, `${shortDate(a)}  ${clock(a)}`, 350, 190, { size: 22, family: 'Space Mono', align: 'center' })
      dashed(a, 40, 222, 660, 222, a.ink, 3, 10)
      dashed(a, 40, 1600, 660, 1600, a.ink, 3, 10)
      a.t.items(a.caption || 'Bestie').forEach(([label, price], i) => {
        const y = 1652 + i * 46
        text(a, label, 60, y, { size: 26, family: 'Space Mono', maxW: 430 })
        text(a, price, 640, y, { size: 26, family: 'Space Mono', align: 'right' })
      })
      dashed(a, 40, 1790, 660, 1790, a.ink, 3, 10)
      text(a, a.t.total, 60, 1840, { size: 32, family: 'Space Mono', weight: 700 })
      text(a, a.t.priceless, 640, 1840, { size: 32, family: 'Space Mono', weight: 700, align: 'right', maxW: 360 })
      dashed(a, 40, 1872, 660, 1872, a.ink, 3, 10)
      text(a, a.t.thanks, 350, 1920, { size: 24, family: 'Space Mono', weight: 700, align: 'center', maxW: 620 })
      barcode(a, 110, 1950, 480, 90, a.ink)
      text(a, '#SNAPO-000777', 350, 2086, { size: 22, family: 'Space Mono', align: 'center' })
    },
  },
  boarding: {
    under: (a) => {
      box(a, 0, 0, 1800, 120, a.accent)
      text(a, a.t.airline, 60, 84, { size: 60, family: 'Oswald', weight: 700, color: '#ffffff', spacing: 3 })
      text(a, a.t.boardingPass, 1180, 80, { size: 34, family: 'Oswald', weight: 500, color: '#ffffff', align: 'right', spacing: 3 })
      text(a, a.t.airline, 1270, 80, { size: 40, family: 'Oswald', weight: 700, color: '#ffffff', spacing: 2 })
      text(a, a.t.from, 60, 176, { size: 24, family: 'Oswald', weight: 500, spacing: 2 })
      text(a, 'JKT', 60, 296, { size: 124, family: 'Oswald', weight: 700 })
      rule(a, 330, 246, 460, 6)
      const { c, s } = a
      c.save()
      c.fillStyle = a.ink
      c.beginPath()
      c.moveTo(480 * s, 246 * s)
      c.lineTo(450 * s, 226 * s)
      c.lineTo(450 * s, 266 * s)
      c.closePath()
      c.fill()
      c.restore()
      text(a, a.t.to, 520, 176, { size: 24, family: 'Oswald', weight: 500, spacing: 2 })
      text(a, 'FUN', 520, 296, { size: 124, family: 'Oswald', weight: 700 })
      const fields: [string, string, number, number][] = [
        [a.t.passenger, a.caption || 'You & Me', 860, 186],
        [a.t.flight, 'SN 007', 860, 310],
        [a.t.gate, 'B7', 1050, 310],
        [a.t.seat, '7A', 1140, 310],
      ]
      for (const [label, value, x, y] of fields) {
        text(a, label, x, y - 40, { size: 20, family: 'Oswald', weight: 500, spacing: 2 })
        text(a, value, x, y, { size: 40, family: 'Space Mono', weight: 700, maxW: 320 })
      }
      text(a, `${a.t.boarding} ${clock(a)}`, 860, 380, { size: 26, family: 'Space Mono', weight: 700 })
      dashed(a, 1230, 140, 1230, 740, a.ink, 4, 16)
      text(a, 'JKT  >  FUN', 1270, 220, { size: 52, family: 'Oswald', weight: 700 })
      text(a, `${a.t.seat} 7A   ${a.t.gate} B7`, 1270, 290, { size: 30, family: 'Space Mono', weight: 700 })
      text(a, shortDate(a), 1270, 340, { size: 26, family: 'Space Mono' })
      barcode(a, 1270, 560, 470, 140, a.ink)
    },
  },
  comic: {
    over: (a) => {
      for (const sl of a.slots) outline(a, sl.x, sl.y, sl.w, sl.h, '#111111', 14)
      const { c, s } = a
      c.save()
      c.fillStyle = '#ffffff'
      c.strokeStyle = '#111111'
      c.lineWidth = 8 * s
      c.beginPath()
      c.ellipse(340 * s, 175 * s, 240 * s, 90 * s, 0, 0, Math.PI * 2)
      c.fill()
      c.stroke()
      c.beginPath()
      c.moveTo(380 * s, 255 * s)
      c.lineTo(450 * s, 330 * s)
      c.lineTo(450 * s, 248 * s)
      c.closePath()
      c.fill()
      c.stroke()
      c.restore()
      text(a, (a.caption || 'Best day ever!').toUpperCase(), 340, 192, { size: 52, family: 'Fredoka', weight: 700, align: 'center', color: '#111111', maxW: 400 })
      burst(a, 1050, 760, 120, '#ffd84d', a.t.pow, '#e2231a')
      burst(a, 140, 1330, 110, '#8fd3ff', a.t.wow, '#ffffff')
      box(a, 60, 1400, 1080, 240, '#ffe066')
      outline(a, 60, 1400, 1080, 240, '#111111', 10)
      text(a, a.t.continued, 600, 1545, { size: 72, family: 'Oswald', weight: 700, align: 'center', color: '#111111', maxW: 1000 })
    },
  },
  letter: {
    under: (a) => {
      const { c, s } = a
      c.save()
      c.fillStyle = a.accent
      c.beginPath()
      c.moveTo(0, 0)
      c.lineTo(600 * s, 540 * s)
      c.lineTo(1200 * s, 0)
      c.closePath()
      c.fill()
      c.strokeStyle = 'rgba(255,255,255,0.7)'
      c.lineWidth = 4 * s
      c.stroke()
      c.restore()
      text(a, a.t.letterTo, 600, 250, { size: 70, family: 'Caveat', weight: 700, align: 'center', color: '#ffffff', maxW: 900 })
      circle(a, 600, 540, 74, '#c2334d')
      circle(a, 600, 540, 58, '#d9455f')
      heart(a, 600, 542, 56, '#ffffff')
    },
  },
  cereal: {
    under: (a) => {
      const os: [number, number, number, string][] = [
        [80, 300, 34, '#ff4f79'],
        [190, 345, 26, '#7ad3ff'],
        [1010, 330, 30, '#8be07a'],
        [1120, 290, 24, '#ffffff'],
        [330, 60, 22, '#8be07a'],
        [880, 52, 26, '#ff4f79'],
      ]
      for (const [x, y, r, col] of os) cerealO(a, x, y, r, col)
      const { c, s } = a
      c.save()
      c.translate(600 * s, 215 * s)
      c.rotate(-0.04)
      text(a, a.t.cereal, 0, 0, { size: 176, family: 'Fredoka', weight: 700, align: 'center', color: '#ffffff', stroke: a.ink, strokeW: 34, maxW: 780 })
      c.restore()
      ribbonBanner(a, 250, 270, 700, 80, a.accent)
      text(a, (a.caption || 'breakfast of besties').toUpperCase(), 600, 326, { size: 40, family: 'Oswald', weight: 700, align: 'center', color: '#ffffff', spacing: 3, maxW: 660 })
      box(a, 80, 1230, 600, 420, '#ffffff', 10)
      outline(a, 80, 1230, 600, 420, '#111111', 6, 10)
      text(a, a.t.nutrition, 104, 1300, { size: 56, family: 'Oswald', weight: 700, color: '#111111', maxW: 550 })
      rule(a, 104, 1322, 656, 3, '#111111')
      text(a, a.t.serving, 104, 1362, { size: 26, family: 'Space Mono', color: '#111111', maxW: 550 })
      rule(a, 104, 1385, 656, 12, '#111111')
      a.t.facts.forEach(([label, value], i) => {
        const y = 1442 + i * 56
        text(a, label, 104, y, { size: 32, family: 'Oswald', weight: 700, color: '#111111', maxW: 380 })
        text(a, value, 656, y, { size: 32, family: 'Space Mono', weight: 700, color: '#111111', align: 'right' })
        if (i < a.t.facts.length - 1) rule(a, 104, y + 18, 656, 2, '#111111')
      })
      const prize = a.slots[1]
      burst(a, prize.x + prize.w / 2, prize.y + prize.h / 2, 250, '#ffffff', '', '#ffffff')
    },
    over: (a) => {
      const prize = a.slots[1]
      ribbonBanner(a, prize.x + 10, prize.y + prize.h - 40, prize.w - 20, 64, a.ink)
      text(a, a.t.prize, prize.x + prize.w / 2, prize.y + prize.h + 6, { size: 30, family: 'Oswald', weight: 700, align: 'center', color: '#ffffff', spacing: 1, maxW: prize.w - 40 })
      burst(a, 150, 140, 95, '#ff4f79', a.t.newBadge, '#ffffff')
      mochi(a, 1098, 190, 165, mochiPals[3], '#1d3fbb')
    },
  },
  birthday: {
    under: (a) => {
      bunting(a, 0, 1200, 30, 70, ['#ff7fa0', '#ffd166', '#6cc4f0', '#7bdcb5', '#c08bff'], 70)
      text(a, a.t.wish, 600, 1690, { size: 64, family: 'Fredoka', weight: 700, align: 'center', color: a.ink, stroke: '#ffffff', strokeW: 16 })
    },
  },
  graduation: {
    under: (a) => {
      text(a, a.t.classOf, 600, 92, { size: 44, family: 'Oswald', weight: 500, align: 'center', color: a.ink, spacing: 8 })
      text(a, String(a.date.getFullYear()), 600, 196, { size: 112, family: 'Playfair Display', weight: 900, align: 'center', color: a.ink })
      const { c, s } = a
      c.save()
      c.fillStyle = a.ink
      c.beginPath()
      c.moveTo(150 * s, 220 * s)
      c.lineTo(1050 * s, 220 * s)
      c.lineTo(1100 * s, 260 * s)
      c.lineTo(1050 * s, 300 * s)
      c.lineTo(150 * s, 300 * s)
      c.lineTo(100 * s, 260 * s)
      c.closePath()
      c.fill()
      c.restore()
      text(a, (a.caption || 'Congratulations!').toUpperCase(), 600, 280, { size: 52, family: 'Oswald', weight: 700, align: 'center', color: a.paper, spacing: 2, maxW: 880 })
      text(a, a.t.gradFooter, 600, 1480, { size: 44, family: 'Playfair Display', italic: true, align: 'center', color: a.ink, maxW: 1080 })
      for (const [x, y, r] of [
        [120, 1500, 18],
        [1080, 1470, 22],
        [200, 1560, 10],
        [1000, 1560, 12],
      ])
        star(a, x, y, r, a.ink)
    },
  },
  merdeka: {
    under: (a) => {
      bunting(a, 0, 600, 20, 40, ['#e2231a', '#ffffff'], 46)
      text(a, a.t.dirgahayu, 300, 200, { size: 74, family: 'Oswald', weight: 700, align: 'center', color: a.ink, spacing: 2, maxW: 540 })
      text(a, a.t.republic, 300, 246, { size: 32, family: 'Oswald', weight: 500, align: 'center', color: a.ink, spacing: 4, maxW: 540 })
      text(a, `17 . 08 . ${a.date.getFullYear()}`, 300, 284, { size: 26, family: 'Space Mono', weight: 700, align: 'center', color: a.ink })
      const { c, s } = a
      c.save()
      c.translate(300 * s, 1760 * s)
      c.rotate(-0.1)
      c.strokeStyle = a.ink
      c.lineWidth = 8 * s
      c.beginPath()
      c.roundRect(-210 * s, -70 * s, 420 * s, 140 * s, 18 * s)
      c.stroke()
      c.restore()
      text(a, (a.caption || 'Merdeka!').toUpperCase(), 300, 1784, { size: 72, family: 'Oswald', weight: 700, align: 'center', color: a.ink, maxW: 380 })
    },
  },
  lebaran: {
    under: (a) => {
      box(a, 90, 50, 1020, 250, 'rgba(255, 255, 255, 0.82)', 60)
      box(a, 70, 1180, 1060, 300, 'rgba(255, 255, 255, 0.82)', 60)
      text(a, a.t.raya, 600, 180, { size: 96, family: 'Pacifico', align: 'center', color: a.ink, stroke: '#ffffff', strokeW: 18, maxW: 1080 })
      text(a, a.t.idulFitri, 600, 262, { size: 40, family: 'Oswald', weight: 500, align: 'center', color: a.ink, spacing: 10 })
    },
    over: (a) => {
      for (const sl of a.slots) {
        crescent(a, sl.x + sl.w / 2, sl.y - 26, 26, '#e8b53a')
        star(a, sl.x + sl.w / 2 + 40, sl.y - 44, 12, '#e8b53a')
      }
    },
  },
  timeslip: {
    under: (a) => {
      for (const [x, y, r] of [
        [150, 40, 50],
        [420, 20, 34],
        [860, 30, 44],
        [1100, 70, 30],
      ])
        circle(a, x, y, r, 'rgba(255, 255, 255, 0.7)')
      cassette(a, 230, 60, 740, 360, a.caption || 'our summer band', a.t.mixtape)
      text(a, a.t.timeslip, 600, 1618, { size: 96, family: 'Oswald', weight: 700, align: 'center', color: a.ink, spacing: 10, maxW: 700 })
      text(a, a.t.slipFooter(a.date.getFullYear()), 600, 1700, { size: 46, family: 'Space Mono', weight: 700, align: 'center', color: a.accent })
      text(a, a.t.slipNote, 600, 1762, { size: 44, family: 'Caveat', weight: 700, align: 'center', color: a.ink, maxW: 900 })
      watermelon(a, 110, 1600, 110, -0.35)
      watermelon(a, 1090, 1610, 110, 0.35)
    },
  },
  firstsnow: {
    under: (a) => {
      snowfall(a, 140, 11, 0.75, 6)
      text(a, a.t.firstSnow, 600, 190, { size: 124, family: 'Playfair Display', italic: true, align: 'center', color: a.ink, maxW: 1000, shadow: true })
      text(a, a.t.winterStory, 600, 260, { size: 30, family: 'Oswald', weight: 500, align: 'center', color: a.accent, spacing: 10, maxW: 900 })
      for (const [x, y, r] of [
        [140, 110, 34],
        [1060, 150, 28],
        [190, 860, 22],
        [1030, 760, 30],
      ])
        snowflake(a, x, y, r, 'rgba(255, 255, 255, 0.85)')
      text(a, a.caption || 'make a wish on the first snow', 600, 1650, { size: 60, family: 'Playfair Display', italic: true, align: 'center', color: a.ink, maxW: 780 })
      text(a, shortDate(a), 600, 1720, { size: 26, family: 'Space Mono', weight: 700, align: 'center', color: a.accent })
      candle(a, 120, 1760, 120)
      candle(a, 1080, 1760, 150)
    },
    over: (a) => {
      snowfall(a, 50, 29, 0.55, 4)
    },
  },
  subtitle: {
    under: (a) => {
      text(a, a.t.original, 600, 90, { size: 26, family: 'Oswald', weight: 500, align: 'center', color: a.accent, spacing: 8, maxW: 1000 })
      text(a, a.caption || 'Lost in Translation', 600, 200, { size: 96, family: 'Playfair Display', italic: true, align: 'center', color: a.ink, maxW: 1080 })
      text(a, a.t.finale, 60, 2026, { size: 26, family: 'Space Mono', weight: 700, color: a.ink })
      text(a, shortDate(a), 1140, 2026, { size: 26, family: 'Space Mono', weight: 700, color: a.ink, align: 'right' })
    },
    over: (a) => {
      a.slots.forEach((sl, i) => {
        const [line, roman] = a.t.subs[i % a.t.subs.length]
        const cue = a.t.cues[i % a.t.cues.length]
        text(a, cue, sl.x + 30, sl.y + 56, { size: 30, family: 'Nunito', weight: 800, color: '#ffffff', stroke: 'rgba(0, 0, 0, 0.75)', strokeW: 8, maxW: sl.w - 60 })
        text(a, line, sl.x + sl.w / 2, sl.y + sl.h - 82, { size: 46, family: 'Nunito', weight: 800, align: 'center', color: '#ffffff', stroke: 'rgba(0, 0, 0, 0.8)', strokeW: 10, maxW: sl.w - 80 })
        text(a, roman, sl.x + sl.w / 2, sl.y + sl.h - 30, { size: 36, family: 'Nunito', weight: 800, align: 'center', color: a.accent, stroke: 'rgba(0, 0, 0, 0.8)', strokeW: 9, maxW: sl.w - 80 })
      })
    },
  },
  poster: {
    under: (a) => {
      text(a, a.t.posterTag, 600, 110, { size: 34, family: 'Oswald', weight: 500, align: 'center', color: a.ink, spacing: 9, maxW: 1000 })
      box(a, 480, 140, 240, 50, a.ink, 25)
      text(a, a.t.episodes, 600, 175, { size: 24, family: 'Oswald', weight: 700, align: 'center', color: '#ffffff', spacing: 4, maxW: 210 })
    },
    over: (a) => {
      const { c, s } = a
      c.save()
      const g = c.createLinearGradient(0, 900 * s, 0, 1265 * s)
      g.addColorStop(0, 'rgba(255, 230, 231, 0)')
      g.addColorStop(0.6, 'rgba(255, 234, 230, 0.7)')
      g.addColorStop(1, 'rgba(255, 236, 232, 1)')
      c.fillStyle = g
      c.fillRect(60 * s, 900 * s, 1080 * s, 366 * s)
      c.restore()
      for (const [x, y, r] of [
        [110, 1120, 22],
        [1090, 1060, 18],
        [180, 1220, 14],
        [1010, 1200, 16],
      ])
        heart(a, x, y, r, 'rgba(255, 122, 162, 0.7)')
      text(a, a.caption || 'Love, Rewritten', 600, 1330, { size: 128, family: 'Playfair Display', weight: 900, align: 'center', color: a.ink, stroke: '#ffffff', strokeW: 14, maxW: 1080 })
      text(a, a.t.starring, 600, 1410, { size: 58, family: 'Caveat', weight: 700, align: 'center', color: a.accent, maxW: 900 })
      paragraph(a, a.t.credits, 140, 1480, 920, 30, { size: 22, family: 'Oswald', weight: 500, align: 'center', color: 'rgba(90, 33, 64, 0.75)', spacing: 1 }, 3)
      text(a, a.t.premiere(shortDate(a)), 600, 1640, { size: 40, family: 'Oswald', weight: 700, align: 'center', color: a.ink, spacing: 6, maxW: 1000 })
    },
  },
  manga: {
    under: (a) => {
      text(a, a.t.comics, 60, 1650, { size: 34, family: 'Oswald', weight: 700, color: a.ink, spacing: 4 })
      text(a, a.t.chapter, 600, 1650, { size: 28, family: 'Space Mono', weight: 700, align: 'center', color: a.ink, maxW: 520 })
      text(a, a.t.volume, 1140, 1650, { size: 34, family: 'Oswald', weight: 700, align: 'right', color: a.ink, spacing: 4 })
    },
    over: (a) => {
      const [top, tall, mid, low] = a.slots
      focusLines(a, top.x, top.y, top.w, top.h, 90, 'rgba(17, 17, 17, 0.85)')
      for (const sl of a.slots) outline(a, sl.x, sl.y, sl.w, sl.h, '#111111', 10)
      const { c, s } = a
      c.save()
      c.fillStyle = '#ffffff'
      c.strokeStyle = '#111111'
      c.lineWidth = 6 * s
      c.beginPath()
      c.ellipse(330 * s, 190 * s, 230 * s, 96 * s, 0, 0, Math.PI * 2)
      c.fill()
      c.stroke()
      c.beginPath()
      c.moveTo(420 * s, 270 * s)
      c.lineTo(500 * s, 340 * s)
      c.lineTo(480 * s, 262 * s)
      c.closePath()
      c.fill()
      c.stroke()
      c.restore()
      const bubble = { size: 38, family: 'Patrick Hand', align: 'center' as const, color: '#111111' }
      const said = a.caption || 'my heart just went doki doki'
      const lines = Math.min(2, wrapLines(a, said, 400, bubble).length)
      paragraph(a, said, 130, 203 - (lines - 1) * 23, 400, 46, bubble, 2)
      for (const [x, y, r, col] of [
        [1040, 140, 44, '#ffffff'],
        [1090, 230, 22, '#ffe066'],
        [980, 230, 18, '#ffffff'],
        [tall.x + tall.w - 60, tall.y + 80, 40, '#ffffff'],
        [tall.x + tall.w - 120, tall.y + 150, 20, '#ff8fb8'],
        [tall.x + 70, tall.y + tall.h - 120, 34, '#ffffff'],
        [low.x + low.w - 70, low.y + 70, 30, '#ffe066'],
      ] as [number, number, number, string][])
        sparkle4(a, x, y, r, col)
      c.save()
      c.translate((mid.x + mid.w / 2) * s, (mid.y + mid.h - 36) * s)
      c.rotate(-0.12)
      text(a, a.t.doki, 0, 0, { size: 96, family: 'Oswald', weight: 700, align: 'center', color: a.accent, stroke: '#111111', strokeW: 14, maxW: mid.w - 60 })
      c.restore()
      c.save()
      c.translate((low.x + 120) * s, (low.y + 100) * s)
      c.rotate(0.18)
      text(a, a.t.kyaa, 0, 0, { size: 64, family: 'Oswald', weight: 700, align: 'center', color: '#ffffff', stroke: '#111111', strokeW: 12 })
      c.restore()
    },
  },
  bakery: {
    under: (a) => {
      awning(a, 34, 150, 100, ['#e63950', '#ffffff'])
      box(a, 0, 0, 1200, 34, '#b0152f')
      box(a, 200, 250, 800, 170, '#fffaf0', 44)
      outline(a, 200, 250, 800, 170, '#e63950', 8, 44)
      text(a, a.t.bakery, 600, 355, { size: 104, family: 'Pacifico', align: 'center', color: '#b0152f', maxW: 720 })
      text(a, a.t.bakeryTag, 600, 398, { size: 26, family: 'Oswald', weight: 500, align: 'center', color: '#e63950', spacing: 6, maxW: 700 })
      box(a, 110, 1565, 980, 180, '#fffaf0', 50)
      outline(a, 110, 1565, 980, 180, '#e63950', 6, 50)
      for (const [x, y, r] of [
        [160, 440, 18],
        [1040, 440, 18],
        [90, 1545, 14],
        [1110, 1545, 14],
      ])
        heart(a, x, y, r, '#ff8fa3')
    },
    over: (a) => {
      bow(a, 600, 232, 110, '#e63950')
      a.slots.forEach((sl, i) => bow(a, i === 2 ? sl.x + sl.w - 34 : sl.x + 34, sl.y + 30, 90, '#e63950'))
    },
  },
  haori: {
    under: (a) => {
      moonGlow(a, 950, 210, 100)
      bamboo(a, 60, 0, 1800, 42, '#14452f')
      bamboo(a, 150, 0, 1800, 26, '#1b5a3b')
      bamboo(a, 1140, 0, 1800, 42, '#14452f')
      bamboo(a, 1052, 0, 1800, 26, '#1b5a3b')
      wisteria(a, 150, 60, 250, 7)
      wisteria(a, 240, 56, 170, 19)
      text(a, a.t.haoriTag, 600, 138, { size: 28, family: 'Oswald', weight: 500, align: 'center', color: a.accent, spacing: 10, maxW: 900 })
      text(a, a.t.haori, 600, 292, { size: 156, family: 'Playfair Display', weight: 900, align: 'center', color: a.ink, stroke: '#0a1520', strokeW: 16, maxW: 960 })
      text(a, a.t.haoriSub, 600, 352, { size: 32, family: 'Playfair Display', italic: true, align: 'center', color: 'rgba(246, 236, 210, 0.85)', maxW: 900 })
      slash(a, 100, 420, 600, 372, 1100, 430, '229, 83, 61')
      box(a, 110, 1520, 980, 125, 'rgba(10, 21, 32, 0.78)', 16)
      outline(a, 110, 1520, 980, 125, a.accent, 5, 16)
      seigaiha(a, 0, 1668, 1200, 6, 52, ['#14405a', '#1f6e8c', '#0b2433'])
    },
    over: (a) => {
      for (const sl of a.slots) outline(a, sl.x - 8, sl.y - 8, sl.w + 16, sl.h + 16, a.accent, 5)
      embers(a, 46, 5, 1100, 1700, '255, 140, 70')
      embers(a, 26, 41, 120, 1000, '210, 255, 150')
      checkerBorder(a, 40, '#1e8a5a', '#0b0f0e')
    },
  },
  sayit: {
    under: (a) => {
      text(a, a.t.airmail, 90, 128, { size: 30, family: 'Oswald', weight: 700, color: a.accent, spacing: 8 })
      rule(a, 90, 150, 400, 4, a.accent)
      rule(a, 90, 162, 400, 4, a.ink)
      text(a, a.t.sayTitle, 90, 290, { size: 150, family: 'Pacifico', color: a.ink, maxW: 650 })
      text(a, a.t.sayTag, 96, 362, { size: 58, family: 'Caveat', weight: 700, color: a.accent, maxW: 720 })
      const { c, s } = a
      c.save()
      c.setLineDash([16 * s, 14 * s])
      c.strokeStyle = a.ink
      c.globalAlpha = 0.5
      c.lineWidth = 4 * s
      c.beginPath()
      c.moveTo(120 * s, 1500 * s)
      c.bezierCurveTo(40 * s, 1200 * s, 520 * s, 1000 * s, 330 * s, 700 * s)
      c.stroke()
      c.restore()
      stamp(a, 930, 96, 180, 220)
      postmark(a, 890, 290, 84, a.ink)
      box(a, 110, 1565, 980, 120, 'rgba(255, 255, 255, 0.8)', 28)
      outline(a, 110, 1565, 980, 120, a.accent, 4, 28)
      text(a, a.t.sayTo, 600, 1735, { size: 24, family: 'Space Mono', weight: 700, align: 'center', color: a.ink, maxW: 960 })
    },
    over: (a) => {
      paperPlane(a, 760, 150, 54, -0.3)
      const [one, two, three] = a.t.sayPairs
      speech(a, 690, 385, 420, 100, 'left', one[0], one[1], '#ffffff')
      speech(a, 40, 1070, 250, 108, 'right', two[0], two[1], '#fff1f3')
      speech(a, 910, 1120, 250, 108, 'left', three[0], three[1], '#e8f1ff')
      airmailBorder(a, 30, [a.accent, '#ffffff', a.ink, '#ffffff'])
    },
  },
  melon: {
    under: (a) => {
      twinkles(a, 70, 13, 20, 1250)
      spotBeam(a, 150, 60, 380, 760, 260)
      spotBeam(a, 1050, 60, 820, 760, 260)
      spotBeam(a, 600, 90, 600, 760, 380)
      equalizer(a, 1790, [a.accent, '#ff5d73'])
      text(a, a.t.melonTag, 600, 82, { size: 28, family: 'Oswald', weight: 500, align: 'center', color: a.accent, spacing: 8, maxW: 1000 })
      text(a, a.t.melon, 600, 232, { size: 160, family: 'Oswald', weight: 700, align: 'center', color: a.ink, stroke: '#2a1561', strokeW: 22, spacing: 6, maxW: 1000 })
      text(a, a.t.melonSub, 600, 312, { size: 54, family: 'Caveat', weight: 700, align: 'center', color: '#ff8fa3', maxW: 900 })
      melonSlice(a, 600, 800, 360)
      box(a, 110, 1635, 980, 125, 'rgba(20, 15, 61, 0.82)', 30)
      outline(a, 110, 1635, 980, 125, a.accent, 5, 30)
    },
    over: (a) => {
      for (const [x, y, r] of [
        [215, 500, 26],
        [1000, 560, 22],
        [170, 1130, 20],
        [1030, 1170, 26],
      ])
        sparkle4(a, x, y, r, '#ffe066', '#ffe066')
    },
  },
}

export function artPaper(fill: Fill) {
  if (fill.kind === 'solid') return fill.color
  if (fill.kind === 'gradient') return fill.colors[0]
  return fill.base
}
