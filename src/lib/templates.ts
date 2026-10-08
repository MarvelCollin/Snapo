import type { CanvasEl, Design } from '../store/design'
import type { Fill, Frame } from './frames'

export type TemplateGroup = 'cute' | 'editorial' | 'retro' | 'party' | 'drama' | 'local'

type Sticker = { ref: string; x: number; y: number; w: number; rot?: number }

export type Template = {
  id: string
  group: TemplateGroup
  frame: Frame
  filterId: string
  caption: string
  captionFont?: string
  showDate?: boolean
  showLogo?: boolean
  photoOutline?: Design['photoOutline']
  stickers?: Sticker[]
}

const uid = () => Math.random().toString(36).slice(2, 10)

const solid = (color: string): Fill => ({ kind: 'solid', color })

const frame = (id: string, fill: Fill, text: string, accent: string, photoOutline: string | null = null, paper = false): Frame => ({
  id: `tpl-${id}`,
  name: id,
  group: 'classic',
  fill,
  text,
  accent,
  photoOutline,
  paper,
})

export const templates: Template[] = [
  {
    id: 'tpl-kitty',
    group: 'cute',
    frame: frame('kitty', { kind: 'pattern', pattern: 'polka', base: '#ffd3e0', ink: '#ffffff', extra: '#ffffff', scale: 0.7 }, '#c2335c', '#ffc0cf', '#ffffff'),
    filterId: 'strawberry-milk',
    caption: 'purr fect day',
    captionFont: 'fredoka',
    showDate: true,
    showLogo: false,
    photoOutline: 'frame',
    stickers: [
      { ref: 'cat-face', x: 0.1, y: 0.075, w: 0.13, rot: -10 },
      { ref: 'heart-with-ribbon', x: 0.91, y: 0.95, w: 0.1, rot: 12 },
    ],
  },
  {
    id: 'tpl-mochi',
    group: 'cute',
    frame: frame('mochi', { kind: 'pattern', pattern: 'clouds', base: '#ece4ff', ink: '#ffffff', extra: '#ffffff', scale: 0.8 }, '#4a2a5c', '#ffffff', '#ffffff'),
    filterId: 'strawberry-milk',
    caption: 'soft and squishy',
    captionFont: 'fredoka',
    showDate: true,
    showLogo: false,
    photoOutline: 'frame',
    stickers: [
      { ref: 'sparkles', x: 0.93, y: 0.05, w: 0.09, rot: 12 },
      { ref: 'strawberry', x: 0.07, y: 0.955, w: 0.09, rot: -12 },
      { ref: 'bubble-tea', x: 0.93, y: 0.955, w: 0.09, rot: 10 },
    ],
  },
  {
    id: 'tpl-newspaper',
    group: 'editorial',
    frame: frame('newspaper', solid('#f3efe6'), '#1b1a18', '#d9d2c3', null, true),
    filterId: 'life4',
    caption: 'Best Day Ever',
    photoOutline: 'none',
  },
  {
    id: 'tpl-photocard',
    group: 'cute',
    frame: frame('photocard', { kind: 'gradient', colors: ['#ffd6ec', '#c7e4ff'], angle: 160 }, '#5a3a7a', '#f0d7f1'),
    filterId: 'idol',
    caption: 'Bestie',
    photoOutline: 'none',
    stickers: [{ ref: 'sparkles', x: 0.86, y: 0.085, w: 0.13, rot: 8 }],
  },
  {
    id: 'tpl-bunny',
    group: 'cute',
    frame: frame('bunny', solid('#e3f4e8'), '#a3243b', '#cfe9d6', '#ffffff'),
    filterId: 'peach',
    caption: 'some bunny loves you',
    captionFont: 'caveat',
    showDate: true,
    showLogo: false,
    photoOutline: 'frame',
    stickers: [
      { ref: 'rabbit-face', x: 0.1, y: 0.07, w: 0.12, rot: -8 },
      { ref: 'strawberry', x: 0.08, y: 0.9, w: 0.1, rot: -14 },
      { ref: 'tulip', x: 0.92, y: 0.9, w: 0.1, rot: 10 },
    ],
  },
  {
    id: 'tpl-magazine',
    group: 'editorial',
    frame: frame('magazine', solid('#1b1a18'), '#ffffff', '#ffd84d'),
    filterId: 'idol',
    caption: 'Main Character',
    photoOutline: 'none',
  },
  {
    id: 'tpl-bear',
    group: 'cute',
    frame: frame('bear', solid('#f6ead8'), '#5a3a1f', '#ead6b8', '#ffffff', true),
    filterId: 'honey',
    caption: 'honey latte',
    photoOutline: 'frame',
    stickers: [
      { ref: 'teddy-bear', x: 0.09, y: 0.955, w: 0.11, rot: -8 },
      { ref: 'hot-beverage', x: 0.91, y: 0.955, w: 0.1, rot: 8 },
    ],
  },
  {
    id: 'tpl-comic',
    group: 'party',
    frame: frame('comic', { kind: 'pattern', pattern: 'dots', base: '#fff1a8', ink: '#ffb37a', extra: '#ffffff', scale: 0.6 }, '#111111', '#ffe066'),
    filterId: 'pop-art',
    caption: 'Best day ever!',
    photoOutline: 'none',
    stickers: [{ ref: 'collision', x: 0.86, y: 0.08, w: 0.14, rot: 10 }],
  },
  {
    id: 'tpl-letter',
    group: 'cute',
    frame: frame('letter', solid('#ffe3ea'), '#a3244d', '#ffc2d1', '#ffffff'),
    filterId: 'cherry-blossom',
    caption: 'with love, always',
    captionFont: 'caveat',
    showDate: true,
    showLogo: false,
    photoOutline: 'frame',
    stickers: [
      { ref: 'sparkling-heart', x: 0.9, y: 0.36, w: 0.1, rot: 12 },
      { ref: 'love-letter', x: 0.09, y: 0.72, w: 0.11, rot: -14 },
    ],
  },
  {
    id: 'tpl-camcorder',
    group: 'retro',
    frame: frame('camcorder', solid('#1f1a1c'), '#fff7f2', '#3a3134'),
    filterId: 'vhs',
    caption: 'home video',
    photoOutline: 'none',
  },
  {
    id: 'tpl-negative',
    group: 'retro',
    frame: frame('negative', solid('#2a2420'), '#f6c66a', '#f4ede4'),
    filterId: 'portra',
    caption: 'roll one',
    photoOutline: 'none',
  },
  {
    id: 'tpl-pop',
    group: 'retro',
    frame: frame('pop', solid('#fff3dc'), '#c8102e', '#22b8b0', '#ffffff', true),
    filterId: 'golden-hour',
    caption: 'stay fizzy',
    photoOutline: 'frame',
    stickers: [{ ref: 'cherries', x: 0.9, y: 0.07, w: 0.1, rot: 14 }],
  },
  {
    id: 'tpl-records',
    group: 'retro',
    frame: frame('records', solid('#ffe3d3'), '#2b1d3a', '#ff6b9a', null, true),
    filterId: 'portra',
    caption: 'Greatest Hits',
    photoOutline: 'none',
    stickers: [{ ref: 'musical-notes', x: 0.94, y: 0.1, w: 0.07, rot: 12 }],
  },
  {
    id: 'tpl-ticket',
    group: 'retro',
    frame: frame('ticket', solid('#ffd76e'), '#4a1c10', '#e9a93a'),
    filterId: 'golden-hour',
    caption: 'Our Little Movie',
    photoOutline: 'none',
    stickers: [{ ref: 'popcorn', x: 0.66, y: 0.15, w: 0.065, rot: 10 }],
  },
  {
    id: 'tpl-receipt',
    group: 'retro',
    frame: frame('receipt', solid('#fbfaf6'), '#222222', '#e2ddd3', null, true),
    filterId: 'silver',
    caption: 'Bestie',
    photoOutline: 'none',
  },
  {
    id: 'tpl-boarding',
    group: 'retro',
    frame: frame('boarding', solid('#f4f8ff'), '#1f3b6b', '#3f7fd6'),
    filterId: 'clear',
    caption: 'You & Me',
    photoOutline: 'none',
    stickers: [{ ref: 'desert-island', x: 0.93, y: 0.57, w: 0.06, rot: 6 }],
  },
  {
    id: 'tpl-pocket',
    group: 'retro',
    frame: frame('pocket', solid('#dcd7ea'), '#2f2a3a', '#b8b0cf'),
    filterId: 'y2k',
    caption: 'level up',
    photoOutline: 'none',
  },
  {
    id: 'tpl-cereal',
    group: 'party',
    frame: frame('cereal', { kind: 'pattern', pattern: 'sprinkles', base: '#ffd23f', ink: '#ff8fb1', extra: '#7ad3ff', scale: 0.9 }, '#1d3fbb', '#ff4f79', '#ffffff'),
    filterId: 'fresh',
    caption: 'breakfast of besties',
    photoOutline: 'frame',
  },
  {
    id: 'tpl-birthday',
    group: 'party',
    frame: frame('birthday', { kind: 'pattern', pattern: 'confetti', base: '#fffaf0', ink: '#ff7fa0', extra: '#6cc4f0', scale: 1 }, '#c2335c', '#ffeccc', '#ffffff'),
    filterId: 'fresh',
    caption: 'Happy Birthday!',
    captionFont: 'fredoka',
    showDate: false,
    showLogo: false,
    photoOutline: 'frame',
    stickers: [
      { ref: 'birthday-cake', x: 0.1, y: 0.935, w: 0.12, rot: -8 },
      { ref: 'balloon', x: 0.9, y: 0.93, w: 0.11, rot: 10 },
    ],
  },
  {
    id: 'tpl-graduation',
    group: 'party',
    frame: frame('graduation', solid('#1b2a55'), '#f2d48a', '#2a3b70', '#f2d48a'),
    filterId: 'portra',
    caption: 'Congratulations!',
    photoOutline: 'frame',
    stickers: [
      { ref: 'graduation-cap', x: 0.13, y: 0.07, w: 0.14, rot: -12 },
      { ref: 'sparkles', x: 0.87, y: 0.07, w: 0.11, rot: 10 },
    ],
  },
  {
    id: 'tpl-merdeka',
    group: 'local',
    frame: frame('merdeka', solid('#ffffff'), '#c4161c', '#ffe1dc', '#e2231a'),
    filterId: 'clear',
    caption: 'Merdeka!',
    photoOutline: 'frame',
  },
  {
    id: 'tpl-lebaran',
    group: 'local',
    frame: frame('lebaran', { kind: 'pattern', pattern: 'ketupat', base: '#e6f4e3', ink: '#2f8f4e', extra: '#e8b53a', scale: 0.8 }, '#1f5e34', '#cfe9cb', '#ffffff'),
    filterId: 'fresh',
    caption: 'Mohon Maaf Lahir dan Batin',
    captionFont: 'serif',
    showDate: true,
    showLogo: false,
    photoOutline: 'frame',
    stickers: [
      { ref: 'mosque', x: 0.09, y: 0.93, w: 0.11, rot: -6 },
      { ref: 'sparkles', x: 0.92, y: 0.93, w: 0.09, rot: 10 },
    ],
  },
  {
    id: 'tpl-timeslip',
    group: 'drama',
    frame: frame('timeslip', { kind: 'gradient', colors: ['#bfeaff', '#e8fbe9'], angle: 180 }, '#1f5a3a', '#ff5d73', null),
    filterId: 'golden-hour',
    caption: 'our summer band',
    photoOutline: 'none',
    stickers: [
      { ref: 'headphone', x: 0.92, y: 0.255, w: 0.1, rot: 14 },
      { ref: 'sunflower', x: 0.08, y: 0.26, w: 0.09, rot: -12 },
    ],
  },
  {
    id: 'tpl-firstsnow',
    group: 'drama',
    frame: frame('firstsnow', { kind: 'gradient', colors: ['#17204a', '#4a2b62'], angle: 180 }, '#fff7ef', '#f2c46d', '#fff7ef'),
    filterId: 'portra',
    caption: 'make a wish on the first snow',
    photoOutline: 'frame',
  },
  {
    id: 'tpl-subtitle',
    group: 'drama',
    frame: frame('subtitle', solid('#0e0d10'), '#ffffff', '#ffd84d'),
    filterId: 'portra',
    caption: 'Lost in Translation',
    photoOutline: 'none',
  },
]

export const templateGroups: (TemplateGroup | 'all')[] = ['all', 'cute', 'editorial', 'retro', 'party', 'drama', 'local']

export const templateById = (id: string) => templates.find((t) => t.id === id)

export const starterTemplate = templates[0]

const looks = ['frame', 'filterId', 'caption', 'captionFont', 'captionColor', 'showDate', 'dateStyle', 'showLogo', 'photoOutline', 'photoRadius', 'elements', 'strokes'] as const

const clearEditFilters = (edits: Design['edits']) => Object.fromEntries(Object.entries(edits).map(([key, edit]) => [key, { ...edit, filterId: undefined }]))

export function templateDesign(base: Design, tpl: Template, caption = tpl.caption): Design {
  const elements: CanvasEl[] = (tpl.stickers ?? []).map((s) => ({
    id: uid(),
    kind: 'sticker',
    ref: s.ref,
    outline: true,
    x: s.x,
    y: s.y,
    w: s.w,
    rot: s.rot ?? 0,
    flip: false,
  }))
  return {
    ...base,
    template: tpl.id,
    frame: { ...tpl.frame },
    filterId: tpl.filterId,
    caption,
    captionFont: tpl.captionFont ?? 'fredoka',
    captionColor: null,
    showDate: tpl.showDate ?? false,
    dateStyle: 'dots',
    showLogo: tpl.showLogo ?? false,
    photoOutline: tpl.photoOutline ?? 'frame',
    photoRadius: 0,
    elements,
    strokes: [],
    edits: clearEditFilters(base.edits),
  }
}

export function plainDesign(base: Design, fresh: Design): Design {
  const next: Design = { ...base, template: undefined }
  for (const key of looks) Object.assign(next, { [key]: fresh[key] })
  return next
}
