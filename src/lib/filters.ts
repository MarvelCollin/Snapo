export type Blend = 'multiply' | 'screen' | 'overlay' | 'softlight' | 'color'

export type FilterDef = {
  id: string
  name: string
  group: FilterGroup
  brightness?: number
  contrast?: number
  saturate?: number
  hue?: number
  sepia?: number
  grayscale?: number
  warmth?: number
  tint?: number
  fade?: number
  shadows?: [number, number, number]
  highlights?: [number, number, number]
  overlay?: { color: string; amount: number; blend: Blend }
  duotone?: [string, string]
  posterize?: number
  vignette?: number
  grain?: number
  glow?: number
  rgbShift?: number
  pixelate?: number
}

export type FilterGroup = 'natural' | 'booth' | 'film' | 'mono' | 'dreamy' | 'fun'

export const filterGroups: { id: FilterGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'natural', label: 'Natural' },
  { id: 'booth', label: 'Booth' },
  { id: 'film', label: 'Film' },
  { id: 'mono', label: 'Mono' },
  { id: 'dreamy', label: 'Dreamy' },
  { id: 'fun', label: 'Fun' },
]

export const filters: FilterDef[] = [
  { id: 'original', name: 'Original', group: 'natural' },
  { id: 'fresh', name: 'Fresh', group: 'natural', brightness: 1.06, contrast: 1.05, saturate: 1.12 },
  { id: 'milk', name: 'Milk', group: 'natural', brightness: 1.1, contrast: 0.88, saturate: 0.85, fade: 0.25, warmth: 0.1, highlights: [0.02, 0.01, 0.01] },
  { id: 'peach', name: 'Peach Skin', group: 'natural', brightness: 1.07, contrast: 0.95, saturate: 1.05, warmth: 0.35, overlay: { color: '#ffb4a2', amount: 0.25, blend: 'softlight' } },
  { id: 'glow-up', name: 'Glow Up', group: 'natural', brightness: 1.1, contrast: 0.95, saturate: 1.05, glow: 0.35 },
  { id: 'honey', name: 'Honey', group: 'natural', warmth: 0.6, saturate: 1.1, contrast: 1.05, overlay: { color: '#ffcf70', amount: 0.2, blend: 'softlight' } },
  { id: 'clear', name: 'Clear Sky', group: 'natural', brightness: 1.04, contrast: 1.12, saturate: 1.15, warmth: -0.15 },
  { id: 'porcelain', name: 'Porcelain', group: 'natural', brightness: 1.16, contrast: 0.9, saturate: 0.8, fade: 0.15, tint: 0.1, glow: 0.2 },

  { id: 'seoul', name: 'Seoul', group: 'booth', brightness: 1.1, contrast: 0.92, saturate: 0.95, fade: 0.2, overlay: { color: '#ffd1dc', amount: 0.22, blend: 'screen' }, glow: 0.15 },
  { id: 'strawberry-milk', name: 'Strawberry Milk', group: 'booth', brightness: 1.08, contrast: 0.9, saturate: 0.9, fade: 0.15, overlay: { color: '#ff9fb8', amount: 0.35, blend: 'softlight' }, highlights: [0.03, 0, 0.01] },
  { id: 'life4', name: 'Booth Classic', group: 'booth', grayscale: 1, brightness: 1.12, contrast: 1.2, glow: 0.12 },
  { id: 'cherry-blossom', name: 'Cherry Blossom', group: 'booth', brightness: 1.05, hue: -5, overlay: { color: '#ffc0d3', amount: 0.4, blend: 'softlight' }, shadows: [0.03, 0, 0.02] },
  { id: 'soft-focus', name: 'Soft Focus', group: 'booth', glow: 0.5, contrast: 0.9, brightness: 1.05 },
  { id: 'peach-fuzz', name: 'Peach Fuzz', group: 'booth', warmth: 0.3, fade: 0.1, overlay: { color: '#ffbe98', amount: 0.35, blend: 'softlight' } },
  { id: 'idol', name: 'Idol', group: 'booth', brightness: 1.12, saturate: 1.08, glow: 0.25, tint: 0.05, warmth: 0.05, vignette: 0.1 },
  { id: 'cloud', name: 'Cloudy Day', group: 'booth', brightness: 1.14, saturate: 0.75, contrast: 0.85, warmth: -0.2, fade: 0.3 },

  { id: 'golden-hour', name: 'Golden Hour', group: 'film', warmth: 0.55, contrast: 1.08, saturate: 1.15, shadows: [0.02, 0, -0.03], highlights: [0.04, 0.02, -0.02], grain: 0.25, vignette: 0.25 },
  { id: 'portra', name: 'Portrait 400', group: 'film', warmth: 0.2, contrast: 0.95, saturate: 0.92, fade: 0.12, shadows: [0, 0.01, 0.03], highlights: [0.03, 0.015, 0], grain: 0.2 },
  { id: 'matcha-film', name: 'Matcha Film', group: 'film', shadows: [-0.02, 0.04, 0.01], highlights: [0.02, 0.02, -0.02], saturate: 0.9, contrast: 1.05, fade: 0.1, grain: 0.25 },
  { id: 'night-tram', name: 'Night Tram', group: 'film', warmth: -0.15, contrast: 1.12, shadows: [-0.01, 0.02, 0.05], highlights: [0.06, 0, -0.01], glow: 0.25, grain: 0.2 },
  { id: 'expired', name: 'Expired Roll', group: 'film', hue: -8, saturate: 0.75, fade: 0.3, shadows: [-0.02, 0.04, 0.05], warmth: 0.1, grain: 0.4, vignette: 0.3 },
  { id: 'instant', name: 'Instant', group: 'film', fade: 0.2, contrast: 0.9, warmth: 0.15, highlights: [0.02, 0.03, 0], shadows: [0, 0.02, 0.04], vignette: 0.2 },
  { id: 'disposable', name: 'Disposable', group: 'film', contrast: 1.18, saturate: 1.25, warmth: 0.25, brightness: 1.05, grain: 0.45, vignette: 0.35 },
  { id: 'super8', name: 'Super 8', group: 'film', warmth: 0.5, sepia: 0.25, contrast: 1.1, grain: 0.55, vignette: 0.5, fade: 0.1 },
  { id: '1998', name: '1998', group: 'film', saturate: 1.3, contrast: 1.1, hue: 6, shadows: [0.02, 0, 0.04], grain: 0.3, rgbShift: 0.0015 },

  { id: 'noir', name: 'Noir', group: 'mono', grayscale: 1, contrast: 1.45, brightness: 0.95, vignette: 0.4, grain: 0.2 },
  { id: 'silver', name: 'Silver', group: 'mono', grayscale: 1, contrast: 0.95, brightness: 1.08, fade: 0.15 },
  { id: 'high-key', name: 'High Key', group: 'mono', grayscale: 1, brightness: 1.22, contrast: 1.15 },
  { id: 'sepia', name: 'Sepia', group: 'mono', sepia: 0.85, contrast: 1.05, fade: 0.1, vignette: 0.25 },
  { id: 'selenium', name: 'Selenium', group: 'mono', grayscale: 1, contrast: 1.1, shadows: [0, 0.01, 0.05], highlights: [0.03, 0.02, 0] },
  { id: 'charcoal', name: 'Charcoal', group: 'mono', grayscale: 1, contrast: 1.6, brightness: 1.05, grain: 0.6 },

  { id: 'cotton-candy', name: 'Cotton Candy', group: 'dreamy', shadows: [0, 0.02, 0.08], highlights: [0.08, 0.02, 0.04], brightness: 1.06, contrast: 0.92, glow: 0.25, fade: 0.1 },
  { id: 'mermaid', name: 'Mermaid', group: 'dreamy', shadows: [-0.03, 0.06, 0.07], highlights: [0.06, 0.02, 0.05], saturate: 1.1 },
  { id: 'sunset', name: 'Sunset', group: 'dreamy', warmth: 0.4, shadows: [0.04, 0, 0.05], overlay: { color: '#ff8f6b', amount: 0.3, blend: 'softlight' }, vignette: 0.2 },
  { id: 'moonlight', name: 'Moonlight', group: 'dreamy', warmth: -0.5, brightness: 0.95, saturate: 0.7, shadows: [0, 0.02, 0.07], glow: 0.2, vignette: 0.3 },
  { id: 'fairy', name: 'Fairy Dust', group: 'dreamy', glow: 0.45, brightness: 1.08, highlights: [0.06, 0.03, 0.06], saturate: 1.05 },
  { id: 'lilac', name: 'Lilac', group: 'dreamy', overlay: { color: '#c9b6ff', amount: 0.35, blend: 'softlight' }, shadows: [0.02, 0, 0.05], fade: 0.15 },
  { id: 'daydream', name: 'Daydream', group: 'dreamy', fade: 0.3, brightness: 1.08, saturate: 0.85, glow: 0.3, highlights: [0.04, 0.04, 0] },

  { id: 'pink-duo', name: 'Pink Duo', group: 'fun', duotone: ['#5b1f3a', '#ffd6e4'] },
  { id: 'mint-duo', name: 'Mint Duo', group: 'fun', duotone: ['#16423c', '#d9fff2'] },
  { id: 'ocean-duo', name: 'Ocean Duo', group: 'fun', duotone: ['#132a5c', '#bfe7ff'] },
  { id: 'sunny-duo', name: 'Sunny Duo', group: 'fun', duotone: ['#7a2e0e', '#fff1a6'] },
  { id: 'pop-art', name: 'Pop Art', group: 'fun', saturate: 1.8, contrast: 1.3, posterize: 5 },
  { id: 'y2k', name: 'Y2K', group: 'fun', rgbShift: 0.002, glow: 0.3, saturate: 1.25, highlights: [0.03, 0, 0.06], shadows: [0, 0, 0.04], brightness: 1.05 },
  { id: 'vhs', name: 'VHS', group: 'fun', rgbShift: 0.004, fade: 0.15, saturate: 0.9, grain: 0.5, warmth: 0.1, vignette: 0.3 },
  { id: 'glitch', name: 'Glitch', group: 'fun', rgbShift: 0.008, contrast: 1.1, saturate: 1.2, grain: 0.2 },
  { id: 'pixel', name: 'Pixel', group: 'fun', pixelate: 72, saturate: 1.2, posterize: 8 },
  { id: 'retro-game', name: 'Retro Game', group: 'fun', pixelate: 44, posterize: 4, saturate: 1.3, contrast: 1.1 },
  { id: 'manga', name: 'Manga', group: 'fun', grayscale: 1, posterize: 4, contrast: 1.3, grain: 0.2 },
  { id: 'alien', name: 'Alien', group: 'fun', hue: 120, saturate: 1.4, contrast: 1.05 },
]

export const filterById = (id: string) => filters.find((f) => f.id === id) ?? filters[0]

type M = { m: number[]; o: number[] }

const identity = (): M => ({ m: [1, 0, 0, 0, 1, 0, 0, 0, 1], o: [0, 0, 0] })

const compose = (a: M, b: M): M => {
  const m = new Array(9).fill(0)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      m[r * 3 + c] = a.m[r * 3] * b.m[c] + a.m[r * 3 + 1] * b.m[3 + c] + a.m[r * 3 + 2] * b.m[6 + c]
    }
  }
  const o = [0, 1, 2].map((r) => a.m[r * 3] * b.o[0] + a.m[r * 3 + 1] * b.o[1] + a.m[r * 3 + 2] * b.o[2] + a.o[r])
  return { m, o }
}

const diag = (r: number, g: number, b: number, o: number[] = [0, 0, 0]): M => ({ m: [r, 0, 0, 0, g, 0, 0, 0, b], o })

const saturateM = (s: number): M => ({
  m: [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ],
  o: [0, 0, 0],
})

const hueM = (deg: number): M => {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return {
    m: [
      0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
      0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
      0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
    ],
    o: [0, 0, 0],
  }
}

const sepiaM = (amount: number): M => {
  const k = 1 - amount
  return {
    m: [
      0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k,
      0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k,
      0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k,
    ],
    o: [0, 0, 0],
  }
}

const grayM = (amount: number): M => {
  const k = 1 - amount
  return {
    m: [
      0.2126 + 0.7874 * k, 0.7152 - 0.7152 * k, 0.0722 - 0.0722 * k,
      0.2126 - 0.2126 * k, 0.7152 + 0.2848 * k, 0.0722 - 0.0722 * k,
      0.2126 - 0.2126 * k, 0.7152 - 0.7152 * k, 0.0722 + 0.9278 * k,
    ],
    o: [0, 0, 0],
  }
}

export function colorMatrix(f: FilterDef): M {
  let out = identity()
  const push = (next: M) => {
    out = compose(next, out)
  }
  if (f.warmth) push(diag(1 + 0.12 * f.warmth, 1 + 0.02 * f.warmth, 1 - 0.12 * f.warmth))
  if (f.tint) push(diag(1 + 0.03 * f.tint, 1 - 0.08 * f.tint, 1 + 0.03 * f.tint))
  if (f.brightness !== undefined) push(diag(f.brightness, f.brightness, f.brightness))
  if (f.contrast !== undefined) {
    const c = f.contrast
    const o = 0.5 - 0.5 * c
    push(diag(c, c, c, [o, o, o]))
  }
  if (f.saturate !== undefined) push(saturateM(f.saturate))
  if (f.hue) push(hueM(f.hue))
  if (f.sepia) push(sepiaM(f.sepia))
  if (f.grayscale) push(grayM(f.grayscale))
  return out
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
