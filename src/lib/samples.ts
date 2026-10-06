import { loadImage, stickerSrc } from './stickers'

type Scene = { bg: [string, string]; hero: string; buddy: string; dots: string }

const scenes: Scene[] = [
  { bg: ['#ffd3df', '#fff0f4'], hero: 'rabbit-face', buddy: 'sparkling-heart', dots: '#ffffff' },
  { bg: ['#cfe6ff', '#f0f7ff'], hero: 'cat-face', buddy: 'sparkles', dots: '#ffffff' },
  { bg: ['#fff0b0', '#fffae3'], hero: 'front-facing-baby-chick', buddy: 'sunflower', dots: '#ffffff' },
  { bg: ['#d4f2e2', '#f1fcf6'], hero: 'bear', buddy: 'four-leaf-clover', dots: '#ffffff' },
  { bg: ['#ffe0cc', '#fff4ec'], hero: 'hamster', buddy: 'strawberry', dots: '#ffffff' },
  { bg: ['#e7defa', '#f7f2ff'], hero: 'panda', buddy: 'bubble-tea', dots: '#ffffff' },
  { bg: ['#ffd9e8', '#fff2f7'], hero: 'unicorn', buddy: 'rainbow', dots: '#ffffff' },
  { bg: ['#d9f4ff', '#f2fbff'], hero: 'penguin', buddy: 'snowflake', dots: '#ffffff' },
  { bg: ['#ffe9c7', '#fff7e8'], hero: 'fox', buddy: 'mushroom', dots: '#ffffff' },
]

const cache = new Map<number, Promise<string>>()

export function samplePhoto(index: number) {
  const i = index % scenes.length
  const hit = cache.get(i)
  if (hit) return hit
  const p = (async () => {
    const s = scenes[i]
    const W = 900
    const H = 700
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, W * 0.4, H)
    g.addColorStop(0, s.bg[0])
    g.addColorStop(1, s.bg[1])
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 0.55
    ctx.fillStyle = s.dots
    for (const [x, y, r] of [
      [0.12, 0.2, 60],
      [0.86, 0.16, 90],
      [0.9, 0.82, 50],
      [0.08, 0.86, 80],
      [0.5, 0.06, 30],
    ]) {
      ctx.beginPath()
      ctx.arc(x * W, y * H, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    const hero = await loadImage(stickerSrc(s.hero))
    const size = H * 0.78
    ctx.save()
    ctx.shadowColor = 'rgba(80, 30, 40, 0.18)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 18
    ctx.translate(W / 2, H * 0.56)
    ctx.rotate(((i % 2 ? 1 : -1) * 6 * Math.PI) / 180)
    ctx.drawImage(hero, -size / 2, -size / 2, size, size)
    ctx.restore()
    const buddy = await loadImage(stickerSrc(s.buddy)).catch(() => null)
    if (buddy) {
      const b = H * 0.28
      ctx.save()
      ctx.translate(W * (i % 2 ? 0.2 : 0.8), H * 0.24)
      ctx.rotate(((i % 2 ? -1 : 1) * 14 * Math.PI) / 180)
      ctx.drawImage(buddy, -b / 2, -b / 2, b, b)
      ctx.restore()
    }
    return c.toDataURL('image/jpeg', 0.9)
  })()
  cache.set(i, p)
  return p
}

export async function samplePhotos(count: number, offset = 0) {
  return Promise.all(Array.from({ length: count }, (_, k) => samplePhoto(k + offset)))
}
