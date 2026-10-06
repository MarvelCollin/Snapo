import { heartPath, starPath } from './patterns'

export type PenStyle = 'pen' | 'neon' | 'outline' | 'rainbow' | 'sparkle'

export type Stroke = { id: string; pen: PenStyle; color: string; size: number; points: number[] }

export const penStyles: PenStyle[] = ['pen', 'neon', 'outline', 'rainbow', 'sparkle']

export const penSizes = [
  { id: 's', size: 0.008 },
  { id: 'm', size: 0.014 },
  { id: 'l', size: 0.024 },
] as const

export type PenSizeId = (typeof penSizes)[number]['id']

export const penSize = (id: PenSizeId) => penSizes.find((s) => s.id === id)?.size ?? 0.014

export const penColors = ['#ff5c8a', '#ff8fab', '#ffd166', '#7bdcb5', '#62c6e8', '#8ec5ff', '#c08bff', '#ffffff', '#3b2230', '#e2231a', '#f6a35b', '#9be15d']

const mixWhite = (hex: string, t: number) => {
  const n = parseInt(hex.replace('#', ''), 16)
  const ch = (v: number) => Math.round(v + (255 - v) * t)
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`
}

function trace(ctx: CanvasRenderingContext2D, pts: number[], W: number, H: number) {
  const n = pts.length / 2
  ctx.beginPath()
  ctx.moveTo(pts[0] * W, pts[1] * H)
  if (n === 1) {
    ctx.lineTo(pts[0] * W + 0.01, pts[1] * H)
    return
  }
  for (let i = 1; i < n - 1; i++) {
    const x = pts[i * 2] * W
    const y = pts[i * 2 + 1] * H
    const mx = (x + pts[i * 2 + 2] * W) / 2
    const my = (y + pts[i * 2 + 3] * H) / 2
    ctx.quadraticCurveTo(x, y, mx, my)
  }
  ctx.lineTo(pts[(n - 1) * 2] * W, pts[(n - 1) * 2 + 1] * H)
}

function walk(pts: number[], W: number, H: number, gap: number, at: (x: number, y: number, i: number) => void) {
  let carry = 0
  let count = 0
  at(pts[0] * W, pts[1] * H, count++)
  for (let i = 2; i < pts.length; i += 2) {
    const ax = pts[i - 2] * W
    const ay = pts[i - 1] * H
    const bx = pts[i] * W
    const by = pts[i + 1] * H
    const len = Math.hypot(bx - ax, by - ay)
    let d = gap - carry
    while (d <= len) {
      const t = d / len
      at(ax + (bx - ax) * t, ay + (by - ay) * t, count++)
      d += gap
    }
    carry = len - (d - gap)
  }
}

export function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, W: number, H: number) {
  if (!s.points.length) return
  const lw = Math.max(1, s.size * W)
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  switch (s.pen) {
    case 'outline':
      trace(ctx, s.points, W, H)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = lw * 2
      ctx.stroke()
      ctx.strokeStyle = s.color
      ctx.lineWidth = lw
      ctx.stroke()
      break
    case 'neon':
      trace(ctx, s.points, W, H)
      ctx.shadowColor = s.color
      ctx.shadowBlur = lw * 2.4
      ctx.strokeStyle = s.color
      ctx.lineWidth = lw * 1.15
      ctx.stroke()
      ctx.stroke()
      ctx.shadowBlur = lw * 0.6
      ctx.strokeStyle = mixWhite(s.color, 0.78)
      ctx.lineWidth = lw * 0.45
      ctx.stroke()
      break
    case 'rainbow': {
      ctx.lineWidth = lw
      const n = s.points.length / 2
      let dist = 0
      if (n === 1) {
        trace(ctx, s.points, W, H)
        ctx.strokeStyle = 'hsl(340, 95%, 68%)'
        ctx.stroke()
        break
      }
      for (let i = 1; i < n; i++) {
        const ax = s.points[i * 2 - 2] * W
        const ay = s.points[i * 2 - 1] * H
        const bx = s.points[i * 2] * W
        const by = s.points[i * 2 + 1] * H
        dist += Math.hypot(bx - ax, by - ay)
        ctx.strokeStyle = `hsl(${(340 + (dist / (lw * 5)) * 30) % 360}, 95%, 68%)`
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }
      break
    }
    case 'sparkle': {
      const r = lw * 1.25
      walk(s.points, W, H, r * 2.3, (x, y, i) => {
        ctx.beginPath()
        if (i % 3 === 2) heartPath(ctx, x - r, y - r * 0.95, r * 2, r * 1.9)
        else starPath(ctx, x, y, i % 3 === 0 ? r * 1.15 : r * 0.8)
        ctx.lineWidth = r * 0.4
        ctx.strokeStyle = '#ffffff'
        ctx.stroke()
        ctx.fillStyle = s.color
        ctx.fill()
      })
      break
    }
    default:
      trace(ctx, s.points, W, H)
      ctx.strokeStyle = s.color
      ctx.lineWidth = lw
      ctx.stroke()
  }
  ctx.restore()
}

export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], W: number, H: number) {
  for (const s of strokes) drawStroke(ctx, s, W, H)
}

export function strokeDistance(s: Stroke, x: number, y: number, W: number, H: number) {
  let best = Infinity
  const n = s.points.length / 2
  for (let i = 0; i < n; i++) {
    const ax = s.points[i * 2] * W
    const ay = s.points[i * 2 + 1] * H
    if (i === n - 1) {
      best = Math.min(best, Math.hypot(x - ax, y - ay))
      break
    }
    const bx = s.points[i * 2 + 2] * W
    const by = s.points[i * 2 + 3] * H
    const dx = bx - ax
    const dy = by - ay
    const len2 = dx * dx + dy * dy
    const t = len2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2)) : 0
    best = Math.min(best, Math.hypot(x - (ax + dx * t), y - (ay + dy * t)))
  }
  return best
}
