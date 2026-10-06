export type SlotShape = 'rect' | 'circle' | 'heart' | 'arch' | 'flower'

export type Rect = { x: number; y: number; w: number; h: number }

export type Slot = Rect & {
  photo: number
  shape?: SlotShape
  radius?: number
  rotate?: number
  card?: boolean
}

export type LayoutGroup = 'strip' | 'grid' | 'postcard' | 'single' | 'fun'

export type Layout = {
  id: string
  name: string
  group: LayoutGroup
  size: { w: number; h: number }
  sizeLabel: string
  slots: Slot[]
  captions: Rect[]
  captionOverlay?: boolean
  decoration?: 'film' | 'film-wide'
  shots: number
}

type GridOpts = {
  w: number
  h: number
  cols: number
  rows: number
  left: number
  right?: number
  top: number
  bottom: number
  gap: number
  gapY?: number
  startPhoto?: number
  photoMap?: number[]
  shape?: SlotShape
  radius?: number
}

const grid = (o: GridOpts): Slot[] => {
  const right = o.right ?? o.left
  const gapY = o.gapY ?? o.gap
  const cw = (o.w - o.left - right - o.gap * (o.cols - 1)) / o.cols
  const ch = (o.h - o.top - o.bottom - gapY * (o.rows - 1)) / o.rows
  const slots: Slot[] = []
  for (let r = 0; r < o.rows; r++) {
    for (let c = 0; c < o.cols; c++) {
      const i = r * o.cols + c
      slots.push({
        x: o.left + c * (cw + o.gap),
        y: o.top + r * (ch + gapY),
        w: cw,
        h: ch,
        photo: o.photoMap ? o.photoMap[i] : (o.startPhoto ?? 0) + i,
        shape: o.shape,
        radius: o.radius,
      })
    }
  }
  return slots
}

type Def = Omit<Layout, 'shots'>

const defs: Def[] = [
  {
    id: 'classic-4',
    name: 'Classic Four',
    group: 'strip',
    size: { w: 600, h: 1800 },
    sizeLabel: '2 x 6 in',
    slots: grid({ w: 600, h: 1800, cols: 1, rows: 4, left: 36, top: 36, bottom: 230, gap: 22 }),
    captions: [{ x: 36, y: 1590, w: 528, h: 180 }],
  },
  {
    id: 'trio',
    name: 'Trio Strip',
    group: 'strip',
    size: { w: 600, h: 1800 },
    sizeLabel: '2 x 6 in',
    slots: grid({ w: 600, h: 1800, cols: 1, rows: 3, left: 36, top: 36, bottom: 250, gap: 24 }),
    captions: [{ x: 36, y: 1575, w: 528, h: 200 }],
  },
  {
    id: 'duo',
    name: 'Duo Strip',
    group: 'strip',
    size: { w: 600, h: 1800 },
    sizeLabel: '2 x 6 in',
    slots: grid({ w: 600, h: 1800, cols: 1, rows: 2, left: 36, top: 36, bottom: 280, gap: 26, radius: 0.06 }),
    captions: [{ x: 36, y: 1545, w: 528, h: 230 }],
  },
  {
    id: 'six-strip',
    name: 'Six Snaps',
    group: 'strip',
    size: { w: 600, h: 1800 },
    sizeLabel: '2 x 6 in',
    slots: grid({ w: 600, h: 1800, cols: 1, rows: 6, left: 40, top: 40, bottom: 190, gap: 16 }),
    captions: [{ x: 40, y: 1630, w: 520, h: 150 }],
  },
  {
    id: 'square-strip',
    name: 'Square Four',
    group: 'strip',
    size: { w: 600, h: 2200 },
    sizeLabel: '2 x 7.3 in',
    slots: grid({ w: 600, h: 2200, cols: 1, rows: 4, left: 48, top: 48, bottom: 160, gap: 28, radius: 0.04 }),
    captions: [{ x: 48, y: 2050, w: 504, h: 130 }],
  },
  {
    id: 'film-4',
    name: 'Film Roll',
    group: 'strip',
    size: { w: 640, h: 1800 },
    sizeLabel: '35mm strip',
    slots: grid({ w: 640, h: 1800, cols: 1, rows: 4, left: 92, top: 70, bottom: 200, gap: 34 }),
    captions: [{ x: 92, y: 1610, w: 456, h: 160 }],
    decoration: 'film',
  },
  {
    id: 'arch-3',
    name: 'Arches',
    group: 'strip',
    size: { w: 600, h: 1800 },
    sizeLabel: '2 x 6 in',
    slots: grid({ w: 600, h: 1800, cols: 1, rows: 3, left: 70, top: 50, bottom: 240, gap: 40, shape: 'arch' }),
    captions: [{ x: 50, y: 1580, w: 500, h: 190 }],
  },
  {
    id: 'twin-4',
    name: 'Twin Strips',
    group: 'grid',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: [
      ...grid({ w: 600, h: 1800, cols: 1, rows: 4, left: 36, right: 24, top: 36, bottom: 230, gap: 22 }),
      ...grid({ w: 600, h: 1800, cols: 1, rows: 4, left: 24, right: 36, top: 36, bottom: 230, gap: 22 }).map((s) => ({ ...s, x: s.x + 600 })),
    ],
    captions: [
      { x: 36, y: 1590, w: 540, h: 180 },
      { x: 624, y: 1590, w: 540, h: 180 },
    ],
  },
  {
    id: 'eight-cut',
    name: 'Eight Cut',
    group: 'grid',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: grid({ w: 1200, h: 1800, cols: 2, rows: 4, left: 40, top: 40, bottom: 230, gap: 24 }),
    captions: [{ x: 40, y: 1590, w: 1120, h: 180 }],
  },
  {
    id: 'grid-2x2',
    name: 'Four Grid',
    group: 'grid',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: grid({ w: 1200, h: 1800, cols: 2, rows: 2, left: 50, top: 50, bottom: 330, gap: 30, radius: 0.04 }),
    captions: [{ x: 50, y: 1500, w: 1100, h: 270 }],
  },
  {
    id: 'grid-2x3',
    name: 'Six Grid',
    group: 'grid',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: grid({ w: 1200, h: 1800, cols: 2, rows: 3, left: 44, top: 44, bottom: 240, gap: 26 }),
    captions: [{ x: 44, y: 1580, w: 1112, h: 190 }],
  },
  {
    id: 'grid-3x3',
    name: 'Nine Grid',
    group: 'grid',
    size: { w: 1500, h: 1650 },
    sizeLabel: 'Square plus',
    slots: grid({ w: 1500, h: 1650, cols: 3, rows: 3, left: 40, top: 40, bottom: 190, gap: 20 }),
    captions: [{ x: 40, y: 1480, w: 1420, h: 150 }],
  },
  {
    id: 'square-4',
    name: 'Insta Square',
    group: 'grid',
    size: { w: 1500, h: 1500 },
    sizeLabel: '1 : 1',
    slots: grid({ w: 1500, h: 1500, cols: 2, rows: 2, left: 50, top: 50, bottom: 190, gap: 30, radius: 0.05 }),
    captions: [{ x: 50, y: 1330, w: 1400, h: 150 }],
  },
  {
    id: 'postcard-duo',
    name: 'Postcard Duo',
    group: 'postcard',
    size: { w: 1800, h: 1200 },
    sizeLabel: '6 x 4 in',
    slots: grid({ w: 1800, h: 1200, cols: 2, rows: 1, left: 50, top: 50, bottom: 230, gap: 34, radius: 0.03 }),
    captions: [{ x: 50, y: 990, w: 1700, h: 180 }],
  },
  {
    id: 'postcard-trio',
    name: 'Postcard Trio',
    group: 'postcard',
    size: { w: 1800, h: 1200 },
    sizeLabel: '6 x 4 in',
    slots: grid({ w: 1800, h: 1200, cols: 3, rows: 1, left: 46, top: 46, bottom: 230, gap: 26 }),
    captions: [{ x: 46, y: 990, w: 1708, h: 180 }],
  },
  {
    id: 'postcard-side',
    name: 'Side Note',
    group: 'postcard',
    size: { w: 1800, h: 1200 },
    sizeLabel: '6 x 4 in',
    slots: grid({ w: 1800, h: 1200, cols: 2, rows: 2, left: 46, right: 560, top: 46, bottom: 46, gap: 24 }),
    captions: [{ x: 1270, y: 46, w: 484, h: 1108 }],
  },
  {
    id: 'film-wide',
    name: 'Wide Film',
    group: 'postcard',
    size: { w: 1800, h: 760 },
    sizeLabel: 'Panorama',
    slots: grid({ w: 1800, h: 760, cols: 4, rows: 1, left: 40, top: 100, bottom: 200, gap: 28 }),
    captions: [{ x: 40, y: 590, w: 1720, h: 90 }],
    decoration: 'film-wide',
  },
  {
    id: 'polaroid',
    name: 'Instant',
    group: 'single',
    size: { w: 1080, h: 1300 },
    sizeLabel: '3.5 x 4.2 in',
    slots: [{ x: 60, y: 60, w: 960, h: 960, photo: 0 }],
    captions: [{ x: 60, y: 1050, w: 960, h: 220 }],
  },
  {
    id: 'mini',
    name: 'Mini Film',
    group: 'single',
    size: { w: 1080, h: 1720 },
    sizeLabel: '54 x 86 mm',
    slots: [{ x: 80, y: 130, w: 920, h: 1240, photo: 0, radius: 0.02 }],
    captions: [{ x: 80, y: 1400, w: 920, h: 280 }],
  },
  {
    id: 'photocard',
    name: 'Photocard',
    group: 'single',
    size: { w: 1100, h: 1700 },
    sizeLabel: '55 x 85 mm',
    slots: [{ x: 40, y: 40, w: 1020, h: 1440, photo: 0, radius: 0.07 }],
    captions: [{ x: 40, y: 1500, w: 1020, h: 170 }],
  },
  {
    id: 'cover',
    name: 'Cover Star',
    group: 'single',
    size: { w: 1200, h: 1600 },
    sizeLabel: 'Magazine',
    slots: [{ x: 0, y: 0, w: 1200, h: 1600, photo: 0 }],
    captions: [{ x: 60, y: 50, w: 1080, h: 260 }],
    captionOverlay: true,
  },
  {
    id: 'hero-3',
    name: 'Big and Three',
    group: 'fun',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: [
      { x: 50, y: 50, w: 1100, h: 880, photo: 0, radius: 0.03 },
      ...grid({ w: 1200, h: 1800, cols: 3, rows: 1, left: 50, top: 960, bottom: 320, gap: 25, startPhoto: 1, radius: 0.04 }),
    ],
    captions: [{ x: 50, y: 1510, w: 1100, h: 260 }],
  },
  {
    id: 'hero-side',
    name: 'Feature Pair',
    group: 'fun',
    size: { w: 1800, h: 1200 },
    sizeLabel: '6 x 4 in',
    slots: [
      { x: 46, y: 46, w: 1080, h: 1108, photo: 0, radius: 0.02 },
      { x: 1152, y: 46, w: 602, h: 420, photo: 1, radius: 0.03 },
      { x: 1152, y: 490, w: 602, h: 420, photo: 2, radius: 0.03 },
    ],
    captions: [{ x: 1152, y: 934, w: 602, h: 220 }],
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    group: 'fun',
    size: { w: 1200, h: 1600 },
    sizeLabel: '4 x 5.3 in',
    slots: [
      { x: 90, y: 70, w: 620, h: 620, photo: 0, shape: 'circle' },
      { x: 700, y: 330, w: 420, h: 420, photo: 1, shape: 'circle' },
      { x: 120, y: 730, w: 470, h: 470, photo: 2, shape: 'circle' },
      { x: 600, y: 800, w: 520, h: 520, photo: 3, shape: 'circle' },
    ],
    captions: [{ x: 60, y: 1360, w: 1080, h: 200 }],
  },
  {
    id: 'hearts',
    name: 'Sweethearts',
    group: 'fun',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: [
      { x: 80, y: 60, w: 640, h: 590, photo: 0, shape: 'heart' },
      { x: 520, y: 520, w: 600, h: 550, photo: 1, shape: 'heart' },
      { x: 90, y: 960, w: 620, h: 570, photo: 2, shape: 'heart' },
    ],
    captions: [{ x: 60, y: 1560, w: 1080, h: 200 }],
  },
  {
    id: 'blooms',
    name: 'Blooms',
    group: 'fun',
    size: { w: 1200, h: 1500 },
    sizeLabel: '4 x 5 in',
    slots: grid({ w: 1200, h: 1500, cols: 2, rows: 2, left: 70, top: 70, bottom: 250, gap: 60, shape: 'flower' }),
    captions: [{ x: 60, y: 1280, w: 1080, h: 190 }],
  },
  {
    id: 'scrapbook',
    name: 'Scrapbook',
    group: 'fun',
    size: { w: 1200, h: 1600 },
    sizeLabel: '4 x 5.3 in',
    slots: [
      { x: 110, y: 110, w: 440, h: 440, photo: 0, card: true, rotate: -6 },
      { x: 650, y: 170, w: 440, h: 440, photo: 1, card: true, rotate: 5 },
      { x: 140, y: 740, w: 440, h: 440, photo: 2, card: true, rotate: 4 },
      { x: 660, y: 700, w: 440, h: 440, photo: 3, card: true, rotate: -4 },
    ],
    captions: [{ x: 60, y: 1360, w: 1080, h: 200 }],
  },
]

export const layouts: Layout[] = defs.map((d) => ({
  ...d,
  shots: d.slots.reduce((m, s) => Math.max(m, s.photo + 1), 0),
}))

export const layoutGroups: (LayoutGroup | 'all')[] = ['all', 'strip', 'grid', 'postcard', 'single', 'fun']

export const layoutById = (id: string) => layouts.find((l) => l.id === id) ?? layouts[0]
