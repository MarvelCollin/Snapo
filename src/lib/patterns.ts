export type PatternId =
  | 'dots'
  | 'polka'
  | 'gingham'
  | 'stripes'
  | 'diagonal'
  | 'checker'
  | 'grid'
  | 'lines'
  | 'hearts'
  | 'stars'
  | 'sparkle'
  | 'clouds'
  | 'flowers'
  | 'sprinkles'
  | 'confetti'
  | 'waves'
  | 'scallop'
  | 'leopard'
  | 'cow'
  | 'terrazzo'
  | 'plaid'
  | 'snow'
  | 'petals'
  | 'zigzag'
  | 'kawung'
  | 'parang'
  | 'ketupat'
  | 'bunting'
  | 'lantern'
  | 'moons'

export const patternList: PatternId[] = [
  'dots',
  'polka',
  'gingham',
  'plaid',
  'stripes',
  'diagonal',
  'checker',
  'zigzag',
  'grid',
  'lines',
  'hearts',
  'stars',
  'sparkle',
  'clouds',
  'flowers',
  'petals',
  'sprinkles',
  'confetti',
  'snow',
  'waves',
  'scallop',
  'leopard',
  'cow',
  'terrazzo',
  'kawung',
  'parang',
  'ketupat',
  'bunting',
  'lantern',
  'moons',
]

const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

export const heartPath = (ctx: CanvasRenderingContext2D | Path2D, x: number, y: number, w: number, h: number) => {
  const p = ctx
  p.moveTo(x + w / 2, y + h * 0.28)
  p.bezierCurveTo(x + w / 2, y + h * 0.1, x + w * 0.38, y, x + w * 0.24, y)
  p.bezierCurveTo(x + w * 0.06, y, x, y + h * 0.16, x, y + h * 0.32)
  p.bezierCurveTo(x, y + h * 0.56, x + w * 0.24, y + h * 0.74, x + w / 2, y + h)
  p.bezierCurveTo(x + w * 0.76, y + h * 0.74, x + w, y + h * 0.56, x + w, y + h * 0.32)
  p.bezierCurveTo(x + w, y + h * 0.16, x + w * 0.94, y, x + w * 0.76, y)
  p.bezierCurveTo(x + w * 0.62, y, x + w / 2, y + h * 0.1, x + w / 2, y + h * 0.28)
  p.closePath()
}

export const starPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points = 5, inner = 0.48) => {
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner
    const a = (Math.PI * i) / points - Math.PI / 2
    const px = cx + Math.cos(a) * rad
    const py = cy + Math.sin(a) * rad
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

const roundedStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.moveTo(cx, cy - r)
  ctx.quadraticCurveTo(cx + r * 0.14, cy - r * 0.14, cx + r, cy)
  ctx.quadraticCurveTo(cx + r * 0.14, cy + r * 0.14, cx, cy + r)
  ctx.quadraticCurveTo(cx - r * 0.14, cy + r * 0.14, cx - r, cy)
  ctx.quadraticCurveTo(cx - r * 0.14, cy - r * 0.14, cx, cy - r)
  ctx.closePath()
}

const flower = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, petal: string, center: string, n = 5) => {
  ctx.fillStyle = petal
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n
    ctx.beginPath()
    ctx.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.5, r * 0.36, a, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = center
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2)
  ctx.fill()
}

const cloud = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.beginPath()
  ctx.arc(x, y, s * 0.32, Math.PI * 0.5, Math.PI * 1.5)
  ctx.arc(x + s * 0.32, y - s * 0.3, s * 0.38, Math.PI, Math.PI * 1.85)
  ctx.arc(x + s * 0.78, y - s * 0.12, s * 0.3, Math.PI * 1.3, Math.PI * 0.5)
  ctx.closePath()
  ctx.fill()
}

const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

type Draw = (ctx: CanvasRenderingContext2D, s: number, ink: string, base: string, extra: string) => void

const T = 120

const draws: Record<PatternId, { tile: number; draw: Draw }> = {
  dots: {
    tile: 40,
    draw: (c, s, ink) => {
      c.fillStyle = ink
      for (const [x, y] of [
        [0.25, 0.25],
        [0.75, 0.75],
      ]) {
        c.beginPath()
        c.arc(x * s, y * s, s * 0.07, 0, Math.PI * 2)
        c.fill()
      }
    },
  },
  polka: {
    tile: 110,
    draw: (c, s, ink) => {
      c.fillStyle = ink
      for (const [x, y] of [
        [0.25, 0.25],
        [0.75, 0.75],
      ]) {
        c.beginPath()
        c.arc(x * s, y * s, s * 0.14, 0, Math.PI * 2)
        c.fill()
      }
    },
  },
  gingham: {
    tile: 64,
    draw: (c, s, ink) => {
      c.fillStyle = alpha(ink, 0.45)
      c.fillRect(0, 0, s / 2, s)
      c.fillRect(0, 0, s, s / 2)
      c.fillStyle = alpha(ink, 0.45)
      c.fillRect(0, 0, s / 2, s / 2)
    },
  },
  plaid: {
    tile: 120,
    draw: (c, s, ink, _b, extra) => {
      c.fillStyle = alpha(ink, 0.32)
      c.fillRect(s * 0.1, 0, s * 0.3, s)
      c.fillRect(0, s * 0.1, s, s * 0.3)
      c.fillStyle = alpha(extra, 0.75)
      c.fillRect(s * 0.68, 0, s * 0.05, s)
      c.fillRect(0, s * 0.68, s, s * 0.05)
      c.fillStyle = alpha(ink, 0.5)
      c.fillRect(s * 0.24, 0, s * 0.02, s)
      c.fillRect(0, s * 0.24, s, s * 0.02)
    },
  },
  stripes: {
    tile: 60,
    draw: (c, s, ink) => {
      c.fillStyle = ink
      c.fillRect(0, 0, s / 2, s)
    },
  },
  diagonal: {
    tile: 72,
    draw: (c, s, ink) => {
      c.strokeStyle = ink
      c.lineWidth = s * 0.25
      c.beginPath()
      for (const k of [-1, 0, 1]) {
        c.moveTo(k * s - s * 0.2, s + s * 0.2)
        c.lineTo(k * s + s + s * 0.2, -s * 0.2)
      }
      c.stroke()
    },
  },
  checker: {
    tile: 80,
    draw: (c, s, ink) => {
      c.fillStyle = ink
      c.fillRect(0, 0, s / 2, s / 2)
      c.fillRect(s / 2, s / 2, s / 2, s / 2)
    },
  },
  zigzag: {
    tile: 80,
    draw: (c, s, ink) => {
      c.strokeStyle = ink
      c.lineWidth = s * 0.12
      c.lineJoin = 'round'
      for (const y of [0.25, 0.75]) {
        c.beginPath()
        c.moveTo(-s * 0.25, y * s + s * 0.12)
        c.lineTo(0, y * s - s * 0.12)
        c.lineTo(s * 0.25, y * s + s * 0.12)
        c.lineTo(s * 0.5, y * s - s * 0.12)
        c.lineTo(s * 0.75, y * s + s * 0.12)
        c.lineTo(s, y * s - s * 0.12)
        c.lineTo(s * 1.25, y * s + s * 0.12)
        c.stroke()
      }
    },
  },
  grid: {
    tile: 48,
    draw: (c, s, ink) => {
      c.strokeStyle = alpha(ink, 0.55)
      c.lineWidth = 2
      c.beginPath()
      c.moveTo(0, 1)
      c.lineTo(s, 1)
      c.moveTo(1, 0)
      c.lineTo(1, s)
      c.stroke()
    },
  },
  lines: {
    tile: 54,
    draw: (c, s, ink) => {
      c.strokeStyle = alpha(ink, 0.6)
      c.lineWidth = 2
      c.beginPath()
      c.moveTo(0, s - 2)
      c.lineTo(s, s - 2)
      c.stroke()
    },
  },
  hearts: {
    tile: T,
    draw: (c, s, ink) => {
      c.fillStyle = ink
      for (const [x, y, z] of [
        [0.12, 0.1, 0.3],
        [0.6, 0.58, 0.3],
      ]) {
        c.beginPath()
        heartPath(c, x * s, y * s, z * s, z * s * 0.9)
        c.fill()
      }
    },
  },
  stars: {
    tile: T,
    draw: (c, s, ink) => {
      c.fillStyle = ink
      c.lineJoin = 'round'
      for (const [x, y, r] of [
        [0.25, 0.25, 0.14],
        [0.75, 0.72, 0.1],
        [0.78, 0.2, 0.05],
        [0.2, 0.8, 0.05],
      ]) {
        c.beginPath()
        starPath(c, x * s, y * s, r * s)
        c.fill()
      }
    },
  },
  sparkle: {
    tile: T,
    draw: (c, s, ink) => {
      c.fillStyle = ink
      for (const [x, y, r] of [
        [0.25, 0.3, 0.13],
        [0.72, 0.7, 0.09],
        [0.8, 0.22, 0.05],
        [0.3, 0.82, 0.04],
      ]) {
        c.beginPath()
        roundedStar(c, x * s, y * s, r * s)
        c.fill()
      }
    },
  },
  clouds: {
    tile: 160,
    draw: (c, s, ink) => {
      c.fillStyle = ink
      cloud(c, s * 0.12, s * 0.3, s * 0.32)
      cloud(c, s * 0.58, s * 0.78, s * 0.28)
    },
  },
  flowers: {
    tile: 140,
    draw: (c, s, ink, _b, extra) => {
      flower(c, s * 0.27, s * 0.27, s * 0.17, ink, extra)
      flower(c, s * 0.77, s * 0.75, s * 0.13, ink, extra)
    },
  },
  petals: {
    tile: 150,
    draw: (c, s, ink, _b, extra) => {
      const r = rng(7)
      for (let i = 0; i < 7; i++) {
        c.save()
        c.translate(r() * s, r() * s)
        c.rotate(r() * Math.PI * 2)
        c.fillStyle = i % 3 === 0 ? extra : ink
        c.beginPath()
        heartPath(c, -s * 0.04, -s * 0.045, s * 0.08, s * 0.09)
        c.fill()
        c.restore()
      }
    },
  },
  sprinkles: {
    tile: 140,
    draw: (c, s, ink, _b, extra) => {
      const r = rng(3)
      const colors = [ink, extra, '#ffffff', '#ffd66b', '#9ad9c8']
      c.lineCap = 'round'
      c.lineWidth = s * 0.035
      for (let i = 0; i < 16; i++) {
        const x = r() * s
        const y = r() * s
        const a = r() * Math.PI
        c.strokeStyle = colors[i % colors.length]
        c.beginPath()
        c.moveTo(x - Math.cos(a) * s * 0.035, y - Math.sin(a) * s * 0.035)
        c.lineTo(x + Math.cos(a) * s * 0.035, y + Math.sin(a) * s * 0.035)
        c.stroke()
      }
    },
  },
  confetti: {
    tile: 160,
    draw: (c, s, ink, _b, extra) => {
      const r = rng(11)
      const colors = [ink, extra, '#ffd66b', '#8fd3ff', '#ff9eb5']
      for (let i = 0; i < 14; i++) {
        c.save()
        c.translate(r() * s, r() * s)
        c.rotate(r() * Math.PI)
        c.fillStyle = colors[i % colors.length]
        if (i % 3 === 0) {
          c.beginPath()
          c.arc(0, 0, s * 0.022, 0, Math.PI * 2)
          c.fill()
        } else if (i % 3 === 1) {
          c.fillRect(-s * 0.03, -s * 0.012, s * 0.06, s * 0.024)
        } else {
          c.beginPath()
          c.moveTo(0, -s * 0.03)
          c.lineTo(s * 0.028, s * 0.02)
          c.lineTo(-s * 0.028, s * 0.02)
          c.closePath()
          c.fill()
        }
        c.restore()
      }
    },
  },
  snow: {
    tile: 140,
    draw: (c, s, ink) => {
      const r = rng(5)
      c.strokeStyle = ink
      c.lineCap = 'round'
      for (let i = 0; i < 5; i++) {
        const x = r() * s
        const y = r() * s
        const size = s * (0.03 + r() * 0.05)
        c.lineWidth = Math.max(2, size * 0.25)
        c.beginPath()
        for (let k = 0; k < 3; k++) {
          const a = (Math.PI / 3) * k
          c.moveTo(x - Math.cos(a) * size, y - Math.sin(a) * size)
          c.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size)
        }
        c.stroke()
      }
      c.fillStyle = ink
      for (let i = 0; i < 8; i++) {
        c.beginPath()
        c.arc(r() * s, r() * s, s * 0.012, 0, Math.PI * 2)
        c.fill()
      }
    },
  },
  waves: {
    tile: 90,
    draw: (c, s, ink) => {
      c.strokeStyle = ink
      c.lineWidth = s * 0.08
      c.lineCap = 'round'
      for (const y of [0.25, 0.75]) {
        c.beginPath()
        c.moveTo(0, y * s)
        c.bezierCurveTo(s * 0.25, y * s - s * 0.14, s * 0.25, y * s - s * 0.14, s * 0.5, y * s)
        c.bezierCurveTo(s * 0.75, y * s + s * 0.14, s * 0.75, y * s + s * 0.14, s, y * s)
        c.stroke()
      }
    },
  },
  scallop: {
    tile: 70,
    draw: (c, s, ink) => {
      c.strokeStyle = ink
      c.lineWidth = s * 0.06
      for (const [ox, oy] of [
        [0, 0],
        [0.5, 0.5],
        [-0.5, 0.5],
        [0, 1],
      ]) {
        c.beginPath()
        c.arc(ox * s + s / 2, oy * s, s / 2, 0, Math.PI)
        c.stroke()
      }
    },
  },
  leopard: {
    tile: 160,
    draw: (c, s, ink, _b, extra) => {
      const r = rng(21)
      for (let i = 0; i < 9; i++) {
        const x = r() * s
        const y = r() * s
        const rad = s * (0.04 + r() * 0.035)
        c.fillStyle = extra
        c.beginPath()
        c.ellipse(x, y, rad, rad * 0.8, r() * 3, 0, Math.PI * 2)
        c.fill()
        c.strokeStyle = ink
        c.lineWidth = rad * 0.45
        c.lineCap = 'round'
        c.beginPath()
        c.arc(x, y, rad * 1.15, r() * 6, r() * 6 + 3.6)
        c.stroke()
      }
    },
  },
  cow: {
    tile: 200,
    draw: (c, s, ink) => {
      const r = rng(9)
      c.fillStyle = ink
      for (let i = 0; i < 4; i++) {
        const cx = r() * s
        const cy = r() * s
        const rad = s * (0.08 + r() * 0.07)
        c.beginPath()
        const n = 9
        for (let k = 0; k <= n; k++) {
          const a = (Math.PI * 2 * k) / n
          const rr = rad * (0.75 + r() * 0.45)
          const px = cx + Math.cos(a) * rr
          const py = cy + Math.sin(a) * rr
          if (k === 0) c.moveTo(px, py)
          else c.quadraticCurveTo(cx + Math.cos(a - 0.35) * rr * 1.25, cy + Math.sin(a - 0.35) * rr * 1.25, px, py)
        }
        c.closePath()
        c.fill()
      }
    },
  },
  terrazzo: {
    tile: 180,
    draw: (c, s, ink, _b, extra) => {
      const r = rng(17)
      const colors = [ink, extra, '#ffd9a8', '#b9e4d6']
      for (let i = 0; i < 18; i++) {
        const cx = r() * s
        const cy = r() * s
        const rad = s * (0.015 + r() * 0.035)
        c.fillStyle = colors[i % colors.length]
        c.beginPath()
        const n = 5
        for (let k = 0; k < n; k++) {
          const a = (Math.PI * 2 * k) / n + r()
          const px = cx + Math.cos(a) * rad * (0.6 + r() * 0.6)
          const py = cy + Math.sin(a) * rad * (0.6 + r() * 0.6)
          if (k === 0) c.moveTo(px, py)
          else c.lineTo(px, py)
        }
        c.closePath()
        c.fill()
      }
    },
  },
  kawung: {
    tile: 120,
    draw: (c, s, ink, _b, extra) => {
      const bloom = (cx: number, cy: number) => {
        for (let k = 0; k < 4; k++) {
          const a = (Math.PI / 2) * k + Math.PI / 4
          const px = cx + Math.cos(a) * s * 0.18
          const py = cy + Math.sin(a) * s * 0.18
          c.fillStyle = ink
          c.beginPath()
          c.ellipse(px, py, s * 0.17, s * 0.1, a, 0, Math.PI * 2)
          c.fill()
          c.fillStyle = extra
          c.beginPath()
          c.ellipse(px, py, s * 0.06, s * 0.024, a, 0, Math.PI * 2)
          c.fill()
        }
        c.fillStyle = extra
        c.beginPath()
        c.arc(cx, cy, s * 0.03, 0, Math.PI * 2)
        c.fill()
      }
      for (const [x, y] of [
        [0, 0],
        [s, 0],
        [0, s],
        [s, s],
        [s / 2, s / 2],
      ])
        bloom(x, y)
    },
  },
  parang: {
    tile: 96,
    draw: (c, s, ink, _b, extra) => {
      const n = Math.SQRT1_2
      c.strokeStyle = ink
      c.lineCap = 'round'
      for (const ox of [-s, 0, s]) {
        c.lineWidth = s * 0.035
        for (const shift of [0, s / 2]) {
          c.beginPath()
          c.moveTo(ox + shift - s * 0.2, s + s * 0.2)
          c.lineTo(ox + shift + s * 1.2, -s * 0.2)
          c.stroke()
        }
        c.lineWidth = s * 0.06
        c.beginPath()
        for (let t = -0.2; t <= 1.2001; t += 0.02) {
          const off = s * (0.177 + 0.1 * Math.sin(Math.PI * 4 * t))
          const x = ox + t * s + off * n
          const y = s - t * s + off * n
          if (t === -0.2) c.moveTo(x, y)
          else c.lineTo(x, y)
        }
        c.stroke()
        c.fillStyle = extra
        for (const t of [0.125, 0.375, 0.625, 0.875]) {
          const off = s * 0.53
          c.beginPath()
          c.arc(ox + t * s + off * n, s - t * s + off * n, s * 0.035, 0, Math.PI * 2)
          c.fill()
        }
      }
    },
  },
  ketupat: {
    tile: 110,
    draw: (c, s, ink, base, extra) => {
      const diamond = (cx: number, cy: number, r: number) => {
        c.beginPath()
        c.moveTo(cx, cy - r)
        c.lineTo(cx + r, cy)
        c.lineTo(cx, cy + r)
        c.lineTo(cx - r, cy)
        c.closePath()
      }
      const cx = s / 2
      const cy = s / 2
      const r = s * 0.3
      c.fillStyle = ink
      diamond(cx, cy, r)
      c.fill()
      c.save()
      diamond(cx, cy, r)
      c.clip()
      c.strokeStyle = base
      c.lineWidth = s * 0.024
      const h = r / Math.SQRT2
      const k = Math.SQRT1_2
      for (const o of [-h / 3, h / 3]) {
        c.beginPath()
        c.moveTo(cx + (o - h) * k, cy + (-o - h) * k)
        c.lineTo(cx + (o + h) * k, cy + (-o + h) * k)
        c.moveTo(cx + (o - h) * k, cy + (o + h) * k)
        c.lineTo(cx + (o + h) * k, cy + (o - h) * k)
        c.stroke()
      }
      c.restore()
      c.strokeStyle = ink
      c.lineWidth = s * 0.02
      c.lineCap = 'round'
      c.beginPath()
      c.moveTo(cx, cy + r)
      c.quadraticCurveTo(cx - s * 0.06, cy + r + s * 0.08, cx - s * 0.1, cy + r + s * 0.1)
      c.moveTo(cx, cy + r)
      c.quadraticCurveTo(cx + s * 0.05, cy + r + s * 0.09, cx + s * 0.06, cy + r + s * 0.13)
      c.stroke()
      c.fillStyle = extra
      for (const [x, y] of [
        [0, 0],
        [s, 0],
        [0, s],
        [s, s],
      ]) {
        diamond(x, y, s * 0.07)
        c.fill()
      }
    },
  },
  bunting: {
    tile: 140,
    draw: (c, s, ink, _b, extra) => {
      for (const [row, phase] of [
        [0.06, 0],
        [0.56, 0.5],
      ]) {
        const y0 = row * s
        const sag = s * 0.12
        const at = (u: number) => {
          const t = (((u + phase) % 1) + 1) % 1
          return y0 + sag * 4 * t * (1 - t)
        }
        c.strokeStyle = ink
        c.lineWidth = Math.max(1.5, s * 0.012)
        c.beginPath()
        for (let u = 0; u <= 1.0001; u += 0.02) {
          if (u === 0) c.moveTo(u * s, at(u))
          else c.lineTo(u * s, at(u))
        }
        c.stroke()
        for (let i = 0; i < 4; i++) {
          const u0 = (i + 0.12 - phase) / 4
          const u1 = (i + 0.88 - phase) / 4
          for (const shift of [0, 1]) {
            const a = u0 + shift
            const b = u1 + shift
            if (b < 0 || a > 1) continue
            const mid = (a + b) / 2
            c.beginPath()
            c.moveTo(a * s, at(a))
            c.lineTo(b * s, at(b))
            c.lineTo(mid * s, at(mid) + s * 0.16)
            c.closePath()
            c.fillStyle = i % 2 ? extra : ink
            c.fill()
            if (i % 2) {
              c.lineWidth = Math.max(1, s * 0.01)
              c.stroke()
            }
          }
        }
      }
    },
  },
  lantern: {
    tile: 150,
    draw: (c, s, ink, _b, extra) => {
      const lantern = (x: number, y: number, r: number) => {
        c.strokeStyle = extra
        c.lineWidth = Math.max(1.5, r * 0.08)
        c.beginPath()
        c.moveTo(x, y - r * 1.9)
        c.lineTo(x, y - r * 0.9)
        c.stroke()
        c.fillStyle = ink
        c.beginPath()
        c.ellipse(x, y, r * 1.15, r * 0.95, 0, 0, Math.PI * 2)
        c.fill()
        c.strokeStyle = alpha('#000000', 0.18)
        c.lineWidth = Math.max(1, r * 0.06)
        c.beginPath()
        c.ellipse(x, y, r * 0.6, r * 0.95, 0, 0, Math.PI * 2)
        c.moveTo(x, y - r * 0.95)
        c.lineTo(x, y + r * 0.95)
        c.stroke()
        c.fillStyle = extra
        c.fillRect(x - r * 0.5, y - r * 1.08, r, r * 0.24)
        c.fillRect(x - r * 0.5, y + r * 0.84, r, r * 0.24)
        c.strokeStyle = extra
        c.lineWidth = Math.max(1.5, r * 0.1)
        c.beginPath()
        for (const dx of [-0.18, 0, 0.18]) {
          c.moveTo(x + dx * r, y + r * 1.08)
          c.lineTo(x + dx * r * 1.4, y + r * 1.75)
        }
        c.stroke()
      }
      lantern(s * 0.27, s * 0.3, s * 0.11)
      lantern(s * 0.77, s * 0.78, s * 0.09)
      c.fillStyle = extra
      for (const [x, y] of [
        [0.72, 0.18],
        [0.2, 0.8],
        [0.5, 0.55],
      ]) {
        c.beginPath()
        roundedStar(c, x * s, y * s, s * 0.03)
        c.fill()
      }
    },
  },
  moons: {
    tile: 130,
    draw: (c, s, ink, base, extra) => {
      const moon = (x: number, y: number, r: number) => {
        c.fillStyle = ink
        c.beginPath()
        c.arc(x, y, r, 0, Math.PI * 2)
        c.fill()
        c.fillStyle = base
        c.beginPath()
        c.arc(x + r * 0.4, y - r * 0.2, r * 0.86, 0, Math.PI * 2)
        c.fill()
      }
      moon(s * 0.28, s * 0.3, s * 0.13)
      moon(s * 0.78, s * 0.78, s * 0.08)
      c.fillStyle = extra
      for (const [x, y, r] of [
        [0.72, 0.22, 0.045],
        [0.2, 0.78, 0.035],
        [0.52, 0.56, 0.025],
        [0.92, 0.5, 0.02],
      ]) {
        c.beginPath()
        starPath(c, x * s, y * s, r * s)
        c.fill()
      }
    },
  },
}

const tileCache = new Map<string, HTMLCanvasElement>()

export function patternTile(id: PatternId, base: string, ink: string, extra: string, scale = 1) {
  const key = `${id}|${base}|${ink}|${extra}|${scale.toFixed(3)}`
  const hit = tileCache.get(key)
  if (hit) return hit
  const def = draws[id]
  const s = Math.max(8, Math.round(def.tile * scale))
  const canvas = document.createElement('canvas')
  canvas.width = s
  canvas.height = s
  const c = canvas.getContext('2d')!
  c.fillStyle = base
  c.fillRect(0, 0, s, s)
  def.draw(c, s, ink, base, extra)
  if (tileCache.size > 200) tileCache.clear()
  tileCache.set(key, canvas)
  return canvas
}
