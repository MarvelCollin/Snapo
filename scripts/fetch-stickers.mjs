import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const packs = {
  love: ['Sparkling heart', 'Growing heart', 'Heart with ribbon', 'Two hearts', 'Revolving hearts', 'Pink heart', 'Red heart', 'Light blue heart', 'Yellow heart', 'White heart', 'Heart with arrow', 'Heart decoration', 'Heart exclamation', 'Love letter', 'Kiss mark', 'Heart on fire', 'Beating heart'],
  faces: ['Smiling face with hearts', 'Face blowing a kiss', 'Smiling face with heart-eyes', 'Star-struck', 'Partying face', 'Winking face', 'Winking face with tongue', 'Face holding back tears', 'Pleading face', 'Smiling face with halo', 'Hugging face', 'Melting face', 'Face with hand over mouth', 'Shushing face', 'Zany face', 'Smiling face with sunglasses', 'Nerd face', 'Disguised face', 'Woozy face', 'Sleeping face', 'Relieved face', 'Beaming face with smiling eyes', 'Face savoring food', 'Cowboy hat face'],
  critters: ['Cat face', 'Grinning cat', 'Smiling cat with heart-eyes', 'Kissing cat', 'Dog face', 'Rabbit face', 'Bear', 'Panda', 'Hamster', 'Mouse face', 'Fox', 'Koala', 'Front-facing baby chick', 'Hatching chick', 'Baby chick', 'Penguin', 'Frog', 'Unicorn', 'Butterfly', 'Lady beetle', 'Honeybee', 'Tropical fish', 'Spouting whale', 'Octopus', 'Hedgehog', 'Otter', 'Duck', 'Turtle', 'Snail', 'Teddy bear', 'Ghost', 'Alien monster', 'Robot', 'See-no-evil monkey', 'Dove'],
  sweets: ['Strawberry', 'Cherries', 'Peach', 'Shortcake', 'Birthday cake', 'Cupcake', 'Doughnut', 'Cookie', 'Lollipop', 'Candy', 'Ice cream', 'Soft ice cream', 'Shaved ice', 'Bubble tea', 'Hot beverage', 'Watermelon', 'Lemon', 'Tangerine', 'Grapes', 'Pancakes', 'Custard', 'Dango', 'Rice ball', 'Sushi', 'Popcorn', 'Chocolate bar', 'Honey pot', 'Glass of milk', 'Beverage box', 'Tropical drink', 'Teacup without handle'],
  sky: ['Sparkles', 'Star', 'Glowing star', 'Dizzy', 'Shooting star', 'Rainbow', 'Cloud', 'Sun with face', 'Crescent moon', 'Full moon face', 'Ringed planet', 'Comet', 'Milky way', 'Snowflake', 'Cherry blossom', 'Tulip', 'Sunflower', 'Hibiscus', 'Blossom', 'Rose', 'Bouquet', 'Four leaf clover', 'Mushroom', 'Herb', 'Cactus', 'Bubbles', 'Droplet', 'Umbrella'],
  party: ['Ribbon', 'Wrapped gift', 'Balloon', 'Party popper', 'Confetti ball', 'Crown', 'Gem stone', 'Ring', 'Magic wand', 'Crystal ball', 'Mirror ball', 'Camera with flash', 'Musical notes', 'Microphone', 'Headphone', 'Lipstick', 'Nail polish', 'Sunglasses', 'Glasses', 'Top hat', 'Womans hat', 'Graduation cap', 'Trophy', 'Fireworks', 'Sparkler', 'Video game', 'Game die', 'Kite', 'Artist palette'],
  hands: ['Victory hand', 'Heart hands', 'Love-you gesture', 'Hand with index finger and thumb crossed', 'Thumbs up', 'Waving hand', 'Ok hand', 'Speech balloon', 'Thought balloon', 'Hundred points', 'Collision', 'Zzz', 'Sweat droplets', 'Anger symbol', 'Dashing away'],
}

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const list = (await readFile(join(root, 'scripts', '.fluent3d.txt'), 'utf8')).split('\n').filter(Boolean)
const outDir = join(root, 'public', 'stickers')
await mkdir(outDir, { recursive: true })

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const findPath = (name) => {
  const prefix = `assets/${name}/`
  const direct = list.find((p) => p.startsWith(`${prefix}3D/`))
  if (direct) return direct
  return list.find((p) => p.startsWith(`${prefix}Default/3D/`))
}

const manifest = []
const missing = []

for (const [pack, names] of Object.entries(packs)) {
  for (const name of names) {
    const path = findPath(name)
    if (!path) {
      missing.push(name)
      continue
    }
    const id = slug(name)
    const file = join(outDir, `${id}.webp`)
    const exists = await access(file).then(() => true, () => false)
    if (!exists) {
      const url = `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/${path.split('/').map(encodeURIComponent).join('/')}`
      const res = await fetch(url)
      if (!res.ok) {
        missing.push(name)
        continue
      }
      await sharp(Buffer.from(await res.arrayBuffer())).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(file)
    }
    manifest.push({ id, name: name.replace(/^Womans/, "Woman's"), pack })
  }
}

await writeFile(join(root, 'src', 'data', 'stickerManifest.json'), JSON.stringify(manifest, null, 2))
console.log(`saved ${manifest.length} stickers`)
if (missing.length) console.log(`missing: ${missing.join(', ')}`)
