export type SlotShape = 'rect' | 'circle' | 'heart' | 'arch' | 'flower'

export type Rect = { x: number; y: number; w: number; h: number }

export type Slot = Rect & {
  photo: number
  shape?: SlotShape
  radius?: number
  rotate?: number
  card?: boolean
}

export type LayoutGroup = 'template' | 'strip' | 'grid' | 'postcard' | 'single' | 'fun' | 'mine'

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
  overlay?: string
  art?: string
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
    id: 'tpl-newspaper',
    name: 'Snapo Times',
    group: 'template',
    art: 'newspaper',
    size: { w: 1200, h: 1600 },
    sizeLabel: '4 x 5.3 in',
    slots: [
      { x: 360, y: 530, w: 790, h: 590, photo: 0 },
      { x: 50, y: 1265, w: 360, h: 290, photo: 1 },
      { x: 790, y: 1265, w: 360, h: 290, photo: 2 },
    ],
    captions: [],
  },
  {
    id: 'tpl-magazine',
    name: 'Cover Story',
    group: 'template',
    art: 'magazine',
    size: { w: 1200, h: 1600 },
    sizeLabel: 'Magazine',
    slots: [
      { x: 0, y: 0, w: 1200, h: 1600, photo: 0 },
      { x: 700, y: 1170, w: 200, h: 200, photo: 1, card: true, rotate: -6 },
      { x: 950, y: 1130, w: 200, h: 200, photo: 2, card: true, rotate: 5 },
    ],
    captions: [],
  },
  {
    id: 'tpl-kitty',
    name: 'Kitty Club',
    group: 'template',
    art: 'kitty',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: grid({ w: 1200, h: 1800, cols: 2, rows: 2, left: 70, top: 330, bottom: 280, gap: 40, radius: 0.08 }),
    captions: [{ x: 70, y: 1560, w: 1060, h: 200 }],
  },
  {
    id: 'tpl-mochi',
    name: 'Mochi Club',
    group: 'template',
    art: 'mochi',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: grid({ w: 1200, h: 1800, cols: 2, rows: 2, left: 80, top: 480, bottom: 300, gap: 50, gapY: 110, radius: 0.08 }),
    captions: [{ x: 120, y: 1560, w: 960, h: 170 }],
  },
  {
    id: 'tpl-bunny',
    name: 'Bunny Picnic',
    group: 'template',
    art: 'bunny',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: [
      { x: 70, y: 400, w: 330, h: 640, photo: 0, shape: 'arch' },
      { x: 435, y: 400, w: 330, h: 640, photo: 1, shape: 'arch' },
      { x: 800, y: 400, w: 330, h: 640, photo: 2, shape: 'arch' },
    ],
    captions: [{ x: 140, y: 1280, w: 920, h: 220 }],
  },
  {
    id: 'tpl-bear',
    name: 'Bear Cafe',
    group: 'template',
    art: 'bear',
    size: { w: 1200, h: 1600 },
    sizeLabel: '4 x 5.3 in',
    slots: grid({ w: 1200, h: 1600, cols: 2, rows: 2, left: 70, top: 360, bottom: 190, gap: 36, radius: 0.05 }),
    captions: [],
  },
  {
    id: 'tpl-photocard',
    name: 'Idol Photocard',
    group: 'template',
    art: 'photocard',
    size: { w: 1100, h: 1700 },
    sizeLabel: '55 x 85 mm',
    slots: [{ x: 60, y: 60, w: 980, h: 1340, photo: 0, radius: 0.05 }],
    captions: [],
  },
  {
    id: 'tpl-camcorder',
    name: 'Camcorder',
    group: 'template',
    art: 'camcorder',
    size: { w: 600, h: 1900 },
    sizeLabel: '2 x 6.3 in',
    slots: grid({ w: 600, h: 1900, cols: 1, rows: 4, left: 34, top: 34, bottom: 300, gap: 22 }),
    captions: [],
  },
  {
    id: 'tpl-negative',
    name: 'Film Roll 400',
    group: 'template',
    art: 'negative',
    size: { w: 640, h: 1900 },
    sizeLabel: '35mm strip',
    slots: grid({ w: 640, h: 1900, cols: 1, rows: 4, left: 110, top: 70, bottom: 260, gap: 40 }),
    captions: [],
  },
  {
    id: 'tpl-pocket',
    name: 'Pocket Player',
    group: 'template',
    art: 'pocket',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: [{ x: 230, y: 220, w: 740, h: 560, photo: 0, radius: 0.02 }],
    captions: [],
  },
  {
    id: 'tpl-pop',
    name: 'Snapo Pop',
    group: 'template',
    art: 'pop',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: [
      { x: 90, y: 420, w: 1020, h: 700, photo: 0, radius: 0.03 },
      { x: 100, y: 1250, w: 280, h: 280, photo: 1, shape: 'circle' },
      { x: 460, y: 1250, w: 280, h: 280, photo: 2, shape: 'circle' },
      { x: 820, y: 1250, w: 280, h: 280, photo: 3, shape: 'circle' },
    ],
    captions: [],
  },
  {
    id: 'tpl-records',
    name: 'Snapo Records',
    group: 'template',
    art: 'records',
    size: { w: 2000, h: 1300 },
    sizeLabel: 'LP sleeve',
    slots: [
      { x: 110, y: 170, w: 535, h: 400, photo: 0 },
      { x: 675, y: 170, w: 535, h: 400, photo: 1 },
      { x: 110, y: 600, w: 535, h: 400, photo: 2 },
      { x: 675, y: 600, w: 535, h: 400, photo: 3 },
      { x: 1340, y: 480, w: 340, h: 340, photo: 0, shape: 'circle' },
    ],
    captions: [],
  },
  {
    id: 'tpl-ticket',
    name: 'Movie Night',
    group: 'template',
    art: 'ticket',
    size: { w: 1800, h: 700 },
    sizeLabel: 'Ticket',
    slots: [
      { x: 60, y: 200, w: 400, h: 360, photo: 0 },
      { x: 485, y: 200, w: 400, h: 360, photo: 1 },
      { x: 910, y: 200, w: 400, h: 360, photo: 2 },
    ],
    captions: [],
  },
  {
    id: 'tpl-receipt',
    name: 'Snapo Mart',
    group: 'template',
    art: 'receipt',
    size: { w: 700, h: 2150 },
    sizeLabel: 'Receipt',
    slots: [
      { x: 60, y: 250, w: 580, h: 420, photo: 0 },
      { x: 60, y: 700, w: 580, h: 420, photo: 1 },
      { x: 60, y: 1150, w: 580, h: 420, photo: 2 },
    ],
    captions: [],
  },
  {
    id: 'tpl-boarding',
    name: 'Snapo Air',
    group: 'template',
    art: 'boarding',
    size: { w: 1800, h: 760 },
    sizeLabel: 'Boarding pass',
    slots: [
      { x: 60, y: 430, w: 360, h: 280, photo: 0, radius: 0.04 },
      { x: 440, y: 430, w: 360, h: 280, photo: 1, radius: 0.04 },
      { x: 820, y: 430, w: 360, h: 280, photo: 2, radius: 0.04 },
    ],
    captions: [],
  },
  {
    id: 'tpl-comic',
    name: 'Comic Pop',
    group: 'template',
    art: 'comic',
    size: { w: 1200, h: 1700 },
    sizeLabel: '4 x 5.7 in',
    slots: [
      { x: 60, y: 60, w: 1080, h: 640, photo: 0 },
      { x: 60, y: 730, w: 520, h: 620, photo: 1 },
      { x: 620, y: 730, w: 520, h: 620, photo: 2 },
    ],
    captions: [],
  },
  {
    id: 'tpl-letter',
    name: 'Love Letter',
    group: 'template',
    art: 'letter',
    size: { w: 1200, h: 1600 },
    sizeLabel: '4 x 5.3 in',
    slots: [
      { x: 160, y: 640, w: 400, h: 400, photo: 0, card: true, rotate: -7 },
      { x: 640, y: 660, w: 400, h: 400, photo: 1, card: true, rotate: 6 },
    ],
    captions: [{ x: 100, y: 1250, w: 1000, h: 260 }],
  },
  {
    id: 'tpl-cereal',
    name: "Snapo O's",
    group: 'template',
    art: 'cereal',
    size: { w: 1200, h: 1700 },
    sizeLabel: '4 x 5.7 in',
    slots: [
      { x: 80, y: 400, w: 1040, h: 780, photo: 0, radius: 0.03 },
      { x: 750, y: 1250, w: 340, h: 340, photo: 1, shape: 'circle' },
    ],
    captions: [],
  },
  {
    id: 'tpl-birthday',
    name: 'Birthday Bash',
    group: 'template',
    art: 'birthday',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: grid({ w: 1200, h: 1800, cols: 2, rows: 2, left: 70, top: 360, bottom: 240, gap: 36, radius: 0.04 }),
    captions: [{ x: 70, y: 180, w: 1060, h: 150 }],
  },
  {
    id: 'tpl-graduation',
    name: 'Class Of',
    group: 'template',
    art: 'graduation',
    size: { w: 1200, h: 1600 },
    sizeLabel: '4 x 5.3 in',
    slots: [
      { x: 60, y: 330, w: 1080, h: 600, photo: 0, radius: 0.02 },
      { x: 60, y: 960, w: 525, h: 430, photo: 1, radius: 0.02 },
      { x: 615, y: 960, w: 525, h: 430, photo: 2, radius: 0.02 },
    ],
    captions: [],
  },
  {
    id: 'tpl-merdeka',
    name: 'Dirgahayu',
    group: 'template',
    art: 'merdeka',
    size: { w: 600, h: 1900 },
    sizeLabel: '2 x 6.3 in',
    slots: grid({ w: 600, h: 1900, cols: 1, rows: 4, left: 40, top: 300, bottom: 280, gap: 22 }),
    captions: [],
  },
  {
    id: 'tpl-lebaran',
    name: 'Lebaran Day',
    group: 'template',
    art: 'lebaran',
    size: { w: 1200, h: 1600 },
    sizeLabel: '4 x 5.3 in',
    slots: [
      { x: 80, y: 360, w: 320, h: 640, photo: 0, shape: 'arch' },
      { x: 440, y: 360, w: 320, h: 640, photo: 1, shape: 'arch' },
      { x: 800, y: 360, w: 320, h: 640, photo: 2, shape: 'arch' },
    ],
    captions: [{ x: 80, y: 1200, w: 1040, h: 260 }],
  },
  {
    id: 'tpl-timeslip',
    name: 'Time Slip 98',
    group: 'template',
    art: 'timeslip',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: [
      { x: 120, y: 480, w: 430, h: 400, photo: 0, card: true, rotate: -4 },
      { x: 650, y: 500, w: 430, h: 400, photo: 1, card: true, rotate: 3 },
      { x: 120, y: 1010, w: 430, h: 400, photo: 2, card: true, rotate: 3 },
      { x: 650, y: 1030, w: 430, h: 400, photo: 3, card: true, rotate: -3 },
    ],
    captions: [],
  },
  {
    id: 'tpl-firstsnow',
    name: 'First Snow',
    group: 'template',
    art: 'firstsnow',
    size: { w: 1200, h: 1800 },
    sizeLabel: '4 x 6 in',
    slots: [
      { x: 290, y: 330, w: 620, h: 760, photo: 0, shape: 'arch' },
      { x: 90, y: 1150, w: 495, h: 380, photo: 1, radius: 0.04 },
      { x: 615, y: 1150, w: 495, h: 380, photo: 2, radius: 0.04 },
    ],
    captions: [],
  },
  {
    id: 'tpl-subtitle',
    name: 'Subtitled',
    group: 'template',
    art: 'subtitle',
    size: { w: 1200, h: 2060 },
    sizeLabel: '4 x 6.9 in',
    slots: [
      { x: 60, y: 250, w: 1080, h: 540, photo: 0 },
      { x: 60, y: 840, w: 1080, h: 540, photo: 1 },
      { x: 60, y: 1430, w: 1080, h: 540, photo: 2 },
    ],
    captions: [],
  },
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

export const layoutGroups: (LayoutGroup | 'all')[] = ['template', 'all', 'strip', 'grid', 'postcard', 'single', 'fun', 'mine']

const custom = new Map<string, Layout>()

export function setCustomLayouts(list: Layout[]) {
  custom.clear()
  for (const l of list) custom.set(l.id, l)
}

const fallback = layouts.find((l) => l.id === 'classic-4') ?? layouts[0]

export const layoutById = (id: string) => custom.get(id) ?? layouts.find((l) => l.id === id) ?? fallback
