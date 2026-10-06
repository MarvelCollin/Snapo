import { filters } from './filters'
import { coverCrop, sharedEngine } from './filterEngine'

const W = 96
const H = 112

export function makeThumbs(source: TexImageSource, srcW: number, srcH: number, mirror = false) {
  const engine = sharedEngine()
  const crop = coverCrop(srcW, srcH, W, H)
  const out: Record<string, string> = {}
  for (const f of filters) {
    engine.render(source, f, { width: W, height: H, crop, mirror, seed: 1.3 })
    out[f.id] = engine.canvas.toDataURL('image/jpeg', 0.82)
  }
  return out
}
