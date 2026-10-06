import '@fontsource/fredoka/400.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/700.css'
import '@fontsource/pacifico/400.css'
import '@fontsource/gaegu/400.css'
import '@fontsource/gaegu/700.css'
import '@fontsource/silkscreen/400.css'
import '@fontsource/dm-serif-display/400.css'
import '@fontsource/patrick-hand/400.css'
import '@fontsource/unifrakturmaguntia/400.css'
import '@fontsource/playfair-display/400-italic.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/900.css'
import '@fontsource/oswald/500.css'
import '@fontsource/oswald/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'

export type FontOption = {
  id: string
  family: string
  weight: number
  scale: number
}

export const captionFonts: FontOption[] = [
  { id: 'fredoka', family: 'Fredoka', weight: 600, scale: 1 },
  { id: 'caveat', family: 'Caveat', weight: 700, scale: 1.25 },
  { id: 'pacifico', family: 'Pacifico', weight: 400, scale: 0.92 },
  { id: 'gaegu', family: 'Gaegu', weight: 700, scale: 1.2 },
  { id: 'patrick', family: 'Patrick Hand', weight: 400, scale: 1.12 },
  { id: 'serif', family: 'DM Serif Display', weight: 400, scale: 1 },
  { id: 'pixel', family: 'Silkscreen', weight: 400, scale: 0.78 },
  { id: 'nunito', family: 'Nunito', weight: 800, scale: 0.95 },
]

export const fontById = (id: string) => captionFonts.find((f) => f.id === id) ?? captionFonts[0]

export const fontString = (font: FontOption, px: number) =>
  `${font.weight} ${Math.round(px * font.scale)}px "${font.family}"`

export async function ensureFonts(fonts: FontOption[] = captionFonts) {
  if (!('fonts' in document)) return
  await Promise.all(fonts.map((f) => document.fonts.load(fontString(f, 40)).catch(() => [])))
}

export const artFonts = [
  '400 40px "UnifrakturMaguntia"',
  'italic 400 40px "Playfair Display"',
  '700 40px "Playfair Display"',
  '900 40px "Playfair Display"',
  '500 40px "Oswald"',
  '700 40px "Oswald"',
  '400 40px "Space Mono"',
  '700 40px "Space Mono"',
  '400 40px "Silkscreen"',
  '700 40px "Caveat"',
  '600 40px "Fredoka"',
  '700 40px "Fredoka"',
  '400 40px "Pacifico"',
]
