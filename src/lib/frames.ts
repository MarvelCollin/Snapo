import type { PatternId } from './patterns'

export type Fill =
  | { kind: 'solid'; color: string }
  | { kind: 'gradient'; colors: string[]; angle: number }
  | { kind: 'pattern'; base: string; ink: string; extra: string; pattern: PatternId; scale: number }

export type FrameGroup = 'classic' | 'pastel' | 'pattern' | 'gradient' | 'season'

export type Frame = {
  id: string
  name: string
  group: FrameGroup
  fill: Fill
  text: string
  accent: string
  photoOutline: string | null
  paper?: boolean
}

const solid = (color: string): Fill => ({ kind: 'solid', color })
const grad = (angle: number, ...colors: string[]): Fill => ({ kind: 'gradient', colors, angle })
const pat = (pattern: PatternId, base: string, ink: string, extra = '#ffffff', scale = 1): Fill => ({
  kind: 'pattern',
  pattern,
  base,
  ink,
  extra,
  scale,
})

export const frames: Frame[] = [
  { id: 'midnight', name: 'Midnight', group: 'classic', fill: solid('#1f1a1c'), text: '#fff7f2', accent: '#3a3134', photoOutline: null },
  { id: 'milk', name: 'Milk', group: 'classic', fill: solid('#ffffff'), text: '#3b2a30', accent: '#f2e6ea', photoOutline: null },
  { id: 'film', name: 'Negative', group: 'classic', fill: solid('#2a2420'), text: '#f6c66a', accent: '#f4ede4', photoOutline: null },
  { id: 'kraft', name: 'Kraft Paper', group: 'classic', fill: solid('#d7b48c'), text: '#4a2f1d', accent: '#c49c72', photoOutline: '#fff8ee', paper: true },
  { id: 'oat', name: 'Oat Latte', group: 'classic', fill: solid('#efe3d3'), text: '#5a4030', accent: '#e2d1bd', photoOutline: null, paper: true },
  { id: 'cocoa', name: 'Cocoa', group: 'classic', fill: solid('#5b3b2f'), text: '#ffe9d6', accent: '#7a5241', photoOutline: '#ffe9d6' },

  { id: 'strawberry-milk', name: 'Strawberry Milk', group: 'pastel', fill: solid('#ffd6df'), text: '#8a2e48', accent: '#ffc0cf', photoOutline: '#ffffff' },
  { id: 'matcha', name: 'Matcha Latte', group: 'pastel', fill: solid('#d5ead2'), text: '#2f5b3a', accent: '#bfdcbb', photoOutline: '#ffffff' },
  { id: 'blueberry', name: 'Blueberry Yogurt', group: 'pastel', fill: solid('#d6e4ff'), text: '#2a4378', accent: '#c1d4fb', photoOutline: '#ffffff' },
  { id: 'lemon', name: 'Lemon Tart', group: 'pastel', fill: solid('#fff2b3'), text: '#7a5a00', accent: '#ffe78a', photoOutline: '#ffffff' },
  { id: 'taro', name: 'Taro Bubble', group: 'pastel', fill: solid('#e6dcf5'), text: '#4b3670', accent: '#d8caee', photoOutline: '#ffffff' },
  { id: 'peach', name: 'Peach Soda', group: 'pastel', fill: solid('#ffdcc8'), text: '#8a3f1e', accent: '#ffc7a8', photoOutline: '#ffffff' },
  { id: 'mint-choco', name: 'Mint Choco', group: 'pastel', fill: solid('#c9f0e1'), text: '#4a2c22', accent: '#b0e6d1', photoOutline: '#4a2c22' },
  { id: 'butter', name: 'Butter Cookie', group: 'pastel', fill: solid('#fbe7c6'), text: '#6b4318', accent: '#f6d7a4', photoOutline: '#ffffff' },

  { id: 'picnic', name: 'Picnic', group: 'pattern', fill: pat('gingham', '#ffffff', '#e8586e'), text: '#a3243b', accent: '#ffe0e5', photoOutline: '#ffffff' },
  { id: 'pink-gingham', name: 'Pink Gingham', group: 'pattern', fill: pat('gingham', '#fff5f7', '#ff9fb5'), text: '#9b3552', accent: '#ffe0e7', photoOutline: '#ffffff' },
  { id: 'blue-gingham', name: 'Sky Gingham', group: 'pattern', fill: pat('gingham', '#f6fbff', '#8db8ee'), text: '#24487f', accent: '#dcebff', photoOutline: '#ffffff' },
  { id: 'polka-pop', name: 'Polka Pop', group: 'pattern', fill: pat('polka', '#ff9fb5', '#ffffff', '#ffffff', 0.7), text: '#ffffff', accent: '#ff8aa5', photoOutline: '#ffffff' },
  { id: 'cherry-dots', name: 'Cherry Dots', group: 'pattern', fill: pat('dots', '#fff3f0', '#e2445c'), text: '#b0283f', accent: '#ffdcd6', photoOutline: null },
  { id: 'candy-stripe', name: 'Candy Stripe', group: 'pattern', fill: pat('diagonal', '#ffffff', '#ffc2d1', '#ffffff', 0.8), text: '#a3315a', accent: '#ffe1ea', photoOutline: '#ffffff' },
  { id: 'sprinkles', name: 'Sprinkle Cake', group: 'pattern', fill: pat('sprinkles', '#fff7fb', '#ff8fb0', '#7bc8f6'), text: '#a3315a', accent: '#ffe6ef', photoOutline: null },
  { id: 'love-letter', name: 'Love Letter', group: 'pattern', fill: pat('hearts', '#ffe3ea', '#ffb3c6', '#ffffff', 0.6), text: '#a3244d', accent: '#ffd0dc', photoOutline: '#ffffff' },
  { id: 'starry', name: 'Starry Night', group: 'pattern', fill: pat('stars', '#1e2a52', '#ffe48a', '#ffffff', 0.7), text: '#ffe48a', accent: '#2c3a6b', photoOutline: '#fff7d6' },
  { id: 'twinkle', name: 'Twinkle', group: 'pattern', fill: pat('sparkle', '#fff8e6', '#f5c451', '#ffffff', 0.7), text: '#8a5a00', accent: '#ffeec2', photoOutline: '#ffffff' },
  { id: 'cloud-nine', name: 'Cloud Nine', group: 'pattern', fill: pat('clouds', '#bfe3ff', '#ffffff', '#ffffff', 0.8), text: '#24507f', accent: '#a8d6fb', photoOutline: '#ffffff' },
  { id: 'daisy', name: 'Daisy Field', group: 'pattern', fill: pat('flowers', '#cfe8c4', '#ffffff', '#ffd45c', 0.7), text: '#2f5b2a', accent: '#bfdfb1', photoOutline: '#ffffff' },
  { id: 'notebook', name: 'Notebook', group: 'pattern', fill: pat('lines', '#fffdf6', '#9cc3e8'), text: '#2b4a74', accent: '#eef4fb', photoOutline: null, paper: true },
  { id: 'graph', name: 'Graph Paper', group: 'pattern', fill: pat('grid', '#f8fbff', '#a7c6e6', '#ffffff', 0.8), text: '#2b4a74', accent: '#e8f0fa', photoOutline: null },
  { id: 'checker', name: 'Y2K Checker', group: 'pattern', fill: pat('checker', '#ffffff', '#1f1a1c', '#ffffff', 0.6), text: '#1f1a1c', accent: '#f1f1f1', photoOutline: '#ffffff' },
  { id: 'pastel-checker', name: 'Sorbet Checker', group: 'pattern', fill: pat('checker', '#fff1f5', '#cdebdc', '#ffffff', 0.7), text: '#3d5e4f', accent: '#ffe1ea', photoOutline: '#ffffff' },
  { id: 'moo', name: 'Moo Moo', group: 'pattern', fill: pat('cow', '#ffffff', '#2a2224', '#ffffff', 0.9), text: '#2a2224', accent: '#ffd6df', photoOutline: '#ffd6df' },
  { id: 'leopard', name: 'Pink Leopard', group: 'pattern', fill: pat('leopard', '#ffd9e2', '#8a3a52', '#f7a8bd', 0.8), text: '#7a2a44', accent: '#ffc7d4', photoOutline: '#ffffff' },
  { id: 'terrazzo', name: 'Terrazzo', group: 'pattern', fill: pat('terrazzo', '#fbf6f1', '#f4a6a0', '#7aa6c2', 0.9), text: '#5a3b33', accent: '#f1e7dd', photoOutline: null },
  { id: 'waves', name: 'Seaside', group: 'pattern', fill: pat('waves', '#e3f4fb', '#9fd3ea', '#ffffff', 0.7), text: '#1f5a73', accent: '#cdeaf6', photoOutline: '#ffffff' },
  { id: 'scallop', name: 'Seashell', group: 'pattern', fill: pat('scallop', '#fff1e8', '#f6b9a0', '#ffffff', 0.7), text: '#8a4128', accent: '#ffe1d1', photoOutline: '#ffffff' },
  { id: 'zigzag', name: 'Zigzag', group: 'pattern', fill: pat('zigzag', '#fff6d8', '#ff9f8a', '#ffffff', 0.6), text: '#8a3a28', accent: '#ffe9b0', photoOutline: '#ffffff' },
  { id: 'tartan', name: 'Tartan', group: 'pattern', fill: pat('plaid', '#f7e9e2', '#c9475e', '#2b4a74', 0.9), text: '#7a1f33', accent: '#efd9cf', photoOutline: '#ffffff' },

  { id: 'sunset', name: 'Sunset', group: 'gradient', fill: grad(160, '#ffd3a5', '#fd9fb3', '#c9a7eb'), text: '#ffffff', accent: '#ffc0b8', photoOutline: '#ffffff' },
  { id: 'cotton-candy', name: 'Cotton Candy', group: 'gradient', fill: grad(180, '#ffd1e3', '#c7e4ff'), text: '#5a3a7a', accent: '#f0d7f1', photoOutline: '#ffffff' },
  { id: 'aurora', name: 'Aurora', group: 'gradient', fill: grad(200, '#c4f1e0', '#d8d4ff', '#ffd6ec'), text: '#3d4a7a', accent: '#d6e6f4', photoOutline: '#ffffff' },
  { id: 'chrome', name: 'Y2K Chrome', group: 'gradient', fill: grad(170, '#f4f6fa', '#c9ced8', '#f9fbff', '#aeb6c4'), text: '#2a3140', accent: '#dfe3ea', photoOutline: '#ffffff' },
  { id: 'peachy', name: 'Peachy Keen', group: 'gradient', fill: grad(180, '#fff0c9', '#ffc4a8'), text: '#8a3f1e', accent: '#ffdcb8', photoOutline: '#ffffff' },
  { id: 'lagoon', name: 'Lagoon', group: 'gradient', fill: grad(180, '#bff0ea', '#9ec9ff'), text: '#1f4a73', accent: '#b2e2f3', photoOutline: '#ffffff' },
  { id: 'berry', name: 'Berry Jam', group: 'gradient', fill: grad(180, '#ff9db5', '#b4437a'), text: '#ffffff', accent: '#e66f98', photoOutline: '#ffffff' },
  { id: 'night-sky', name: 'Night Sky', group: 'gradient', fill: grad(180, '#1b2450', '#5b3f8c', '#e88fb0'), text: '#fff1f6', accent: '#3a3570', photoOutline: '#fff1f6' },

  { id: 'valentine', name: 'Valentine', group: 'season', fill: pat('hearts', '#e8455f', '#ff8fa3', '#ffffff', 0.55), text: '#ffffff', accent: '#ff6b81', photoOutline: '#ffffff' },
  { id: 'sakura', name: 'Sakura', group: 'season', fill: pat('petals', '#fff0f4', '#ffb7c9', '#ff8fab', 0.9), text: '#9b3552', accent: '#ffdbe4', photoOutline: '#ffffff' },
  { id: 'summer', name: 'Summer Pool', group: 'season', fill: pat('waves', '#7fd0f0', '#bfeaff', '#ffffff', 0.8), text: '#ffffff', accent: '#9adbf5', photoOutline: '#ffffff' },
  { id: 'birthday', name: 'Birthday', group: 'season', fill: pat('confetti', '#fffaf0', '#ff7fa0', '#6cc4f0'), text: '#c2335c', accent: '#ffeccc', photoOutline: null },
  { id: 'autumn', name: 'Pumpkin Spice', group: 'season', fill: pat('plaid', '#f4c48f', '#a14d1e', '#3d5e2f', 0.9), text: '#5a2a0e', accent: '#e9b57d', photoOutline: '#fff3e2' },
  { id: 'winter', name: 'First Snow', group: 'season', fill: pat('snow', '#c9e2f7', '#ffffff', '#ffffff', 0.9), text: '#24487f', accent: '#b4d4ef', photoOutline: '#ffffff' },
  { id: 'xmas', name: 'Holly Jolly', group: 'season', fill: pat('snow', '#2f6b48', '#ffffff', '#ffffff', 0.9), text: '#fff3d6', accent: '#3d7f58', photoOutline: '#fff3d6' },
]

export const frameGroups: (FrameGroup | 'all')[] = ['all', 'classic', 'pastel', 'pattern', 'gradient', 'season']

export const frameById = (id: string) => frames.find((f) => f.id === id) ?? frames[0]

export const swatches = [
  '#ffffff',
  '#fff7f2',
  '#1f1a1c',
  '#5b3b2f',
  '#d7b48c',
  '#ffd6df',
  '#ff9fb5',
  '#e8586e',
  '#ffdcc8',
  '#ffb38a',
  '#fff2b3',
  '#f5c451',
  '#d5ead2',
  '#9fd8b8',
  '#c9f0e1',
  '#bfe3ff',
  '#8db8ee',
  '#2a4378',
  '#e6dcf5',
  '#b9a3e3',
  '#f4f6fa',
  '#aeb6c4',
  '#2f6b48',
  '#8a2e48',
]
