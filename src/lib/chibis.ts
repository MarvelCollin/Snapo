export type FigureId = 'tanjiro' | 'nezuko' | 'eungyeol' | 'hyeonyool' | 'sigook' | 'sebeom' | 'hojin' | 'muhee' | 'bakerGirl' | 'bakerBoy'

type C = CanvasRenderingContext2D

const LINE = '#33202b'
const SKIN = '#ffe4d2'
const LW = 4.5

function shape(c: C, d: string, fill: string | CanvasPattern | CanvasGradient, stroke = true) {
  const p = new Path2D(d)
  c.fillStyle = fill
  c.fill(p)
  if (stroke) c.stroke(p)
}

function tube(c: C, d: string, width: number, fill: string | CanvasPattern) {
  const p = new Path2D(d)
  c.save()
  c.lineWidth = width + LW * 2
  c.strokeStyle = LINE
  c.stroke(p)
  c.lineWidth = width
  c.strokeStyle = fill
  c.stroke(p)
  c.restore()
}

function dot(c: C, x: number, y: number, r: number, fill: string, stroke = true) {
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  c.fillStyle = fill
  c.fill()
  if (stroke) c.stroke()
}

function oval(c: C, x: number, y: number, rx: number, ry: number, fill: string, stroke = true, rot = 0) {
  c.beginPath()
  c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
  c.fillStyle = fill
  c.fill()
  if (stroke) c.stroke()
}

function checker(c: C, a: string, b: string, size: number) {
  const tile = document.createElement('canvas')
  tile.width = tile.height = 64
  const g = tile.getContext('2d')!
  g.fillStyle = a
  g.fillRect(0, 0, 64, 64)
  g.fillStyle = b
  g.fillRect(0, 0, 32, 32)
  g.fillRect(32, 32, 32, 32)
  const p = c.createPattern(tile, 'repeat')!
  p.setTransform(new DOMMatrix().scale(size / 32))
  return p
}

function asanoha(c: C, base: string, ink: string, size: number) {
  const tile = document.createElement('canvas')
  tile.width = 60
  tile.height = 104
  const g = tile.getContext('2d')!
  g.fillStyle = base
  g.fillRect(0, 0, 60, 104)
  g.strokeStyle = ink
  g.lineWidth = 3
  const star = (x: number, y: number) => {
    for (let i = 0; i < 6; i++) {
      const t = (i * Math.PI) / 3 + Math.PI / 6
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + Math.cos(t) * 30, y + Math.sin(t) * 30)
      g.stroke()
    }
  }
  star(0, 0)
  star(60, 0)
  star(30, 52)
  star(0, 104)
  star(60, 104)
  const p = c.createPattern(tile, 'repeat')!
  p.setTransform(new DOMMatrix().scale(size / 60))
  return p
}

const FACE = 'M 100 34 C 141 34 168 62 168 101 C 168 138 142 166 100 166 C 58 166 32 138 32 101 C 32 62 59 34 100 34 Z'

function face(c: C, skin = SKIN) {
  shape(c, FACE, skin)
}

function ears(c: C, skin = SKIN) {
  oval(c, 33, 116, 9, 13, skin)
  oval(c, 167, 116, 9, 13, skin)
}

function fringe(c: C, d: string, fill: string) {
  const p = new Path2D(d)
  c.fillStyle = fill
  c.fill(p)
  c.save()
  c.clip(new Path2D(FACE))
  c.stroke(p)
  c.restore()
}

function eyes(c: C, iris: string, glint = '#ffffff') {
  for (const x of [71, 129]) {
    const y = 110
    c.save()
    c.beginPath()
    c.ellipse(x, y, 12.5, 16.5, 0, 0, Math.PI * 2)
    c.fillStyle = '#2a1820'
    c.fill()
    c.clip()
    c.beginPath()
    c.ellipse(x, y + 8, 11, 10, 0, 0, Math.PI * 2)
    c.fillStyle = iris
    c.fill()
    c.restore()
    oval(c, x - 4.5, y - 6, 4.8, 6, glint, false)
    dot(c, x + 5, y + 7, 2.2, glint, false)
    c.save()
    c.lineWidth = 4
    c.beginPath()
    c.moveTo(x - 14, y - 11)
    c.quadraticCurveTo(x, y - 21, x + 14, y - 11)
    c.stroke()
    c.restore()
  }
}

function blush(c: C) {
  oval(c, 52, 133, 12, 7, 'rgba(255, 112, 140, 0.42)', false)
  oval(c, 148, 133, 12, 7, 'rgba(255, 112, 140, 0.42)', false)
}

function smile(c: C, lip = '#b8344f') {
  const p = new Path2D('M 88 137 Q 100 141 112 137 Q 110 152 100 153 Q 90 152 88 137 Z')
  c.fillStyle = lip
  c.fill(p)
  c.save()
  c.clip(p)
  oval(c, 100, 153, 8, 6, '#ff8fa3', false)
  c.restore()
  c.stroke(p)
}

function bow(c: C, x: number, y: number, size: number, fill: string, knot: string, rot = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(rot)
  c.scale(size / 40, size / 40)
  shape(c, 'M 0 0 C -10 -18 -36 -22 -38 -6 C -40 8 -16 12 0 0 Z', fill)
  shape(c, 'M 0 0 C 10 -18 36 -22 38 -6 C 40 8 16 12 0 0 Z', fill)
  shape(c, 'M -2 2 L -14 26 L -6 24 L -2 30 Z', fill)
  shape(c, 'M 2 2 L 14 26 L 6 24 L 2 30 Z', fill)
  oval(c, 0, 0, 7, 8, knot)
  c.restore()
}

function shine(c: C, color: string) {
  c.save()
  c.strokeStyle = color
  c.lineWidth = 5
  c.globalAlpha = 0.7
  c.beginPath()
  c.moveTo(56, 58)
  c.quadraticCurveTo(64, 46, 78, 40)
  c.moveTo(90, 36)
  c.quadraticCurveTo(98, 35, 106, 36)
  c.stroke()
  c.restore()
}

function legs(c: C, fill: string, shoe: string) {
  shape(c, 'M 80 252 L 96 252 L 96 286 Q 88 290 80 286 Z', fill)
  shape(c, 'M 104 252 L 120 252 L 120 286 Q 112 290 104 286 Z', fill)
  oval(c, 86, 291, 14, 8, shoe)
  oval(c, 114, 291, 14, 8, shoe)
}

const TORSO = 'M 70 168 Q 100 160 130 168 C 138 196 141 228 144 258 Q 100 270 56 258 C 59 228 62 196 70 168 Z'

function tanjiro(c: C) {
  const hair = '#4b1c22'
  const tip = '#9c3038'
  const green = checker(c, '#1f8a5b', '#141414', 9)
  shape(c, 'M 30 262 L 170 214 L 174 224 L 34 272 Z', '#1d1d24')
  shape(c, 'M 150 221 L 186 209 L 190 220 L 154 232 Z', '#efe6d6')
  shape(c, 'M 146 216 L 152 238 L 158 236 L 152 214 Z', '#1d1d24')
  shape(c, 'M 28 112 C 14 90 16 58 34 42 L 22 28 L 50 30 C 58 18 68 12 80 10 L 78 -6 L 98 8 L 112 -8 L 122 10 L 144 0 L 140 18 C 156 24 166 32 172 44 L 190 38 L 180 60 C 188 78 186 98 174 112 Z', hair)
  legs(c, '#1d1d24', '#1d1d24')
  shape(c, TORSO, '#1d1d24')
  shape(c, 'M 58 230 L 142 230 L 143 242 L 57 242 Z', '#f4efe4')
  shape(c, 'M 70 168 Q 84 165 96 168 L 90 266 Q 70 266 54 260 C 58 230 62 196 70 168 Z', green)
  shape(c, 'M 130 168 Q 116 165 104 168 L 110 266 Q 130 266 146 260 C 142 230 138 196 130 168 Z', green)
  tube(c, 'M 74 178 C 58 194 52 214 52 238', 24, green)
  tube(c, 'M 126 178 C 142 194 148 214 148 238', 24, green)
  dot(c, 52, 246, 10, SKIN)
  dot(c, 148, 246, 10, SKIN)
  ears(c)
  face(c)
  shape(c, 'M 66 74 C 72 70 80 72 82 78 C 86 82 84 90 78 92 C 80 86 76 82 72 84 C 70 80 66 78 66 74 Z', '#a8323a', false)
  eyes(c, '#b8434a')
  blush(c)
  smile(c)
  fringe(c, 'M 26 108 C 20 60 54 26 100 26 C 146 26 182 60 174 108 C 168 98 164 88 162 76 C 154 96 142 98 134 84 C 128 100 114 104 106 88 C 100 104 92 104 88 92 C 86 82 88 72 92 64 C 80 70 66 66 60 58 C 52 74 44 86 40 92 C 36 100 30 104 26 108 Z', hair)
  shape(c, 'M 28 100 C 26 124 32 144 42 154 C 40 134 42 116 46 98 Z', hair)
  shape(c, 'M 172 100 C 174 124 168 144 158 154 C 160 134 158 116 154 98 Z', hair)
  shine(c, tip)
  for (const x of [34, 166]) {
    shape(c, `M ${x - 5} 136 L ${x + 5} 136 L ${x + 5} 160 L ${x - 5} 160 Z`, '#f6f1e6')
    dot(c, x, 143, 3.4, '#d6342f', false)
    c.beginPath()
    c.moveTo(x - 5, 152)
    c.lineTo(x + 5, 152)
    c.stroke()
  }
}

function nezuko(c: C) {
  const g = c.createLinearGradient(0, 170, 0, 290)
  g.addColorStop(0, '#1e1418')
  g.addColorStop(0.55, '#3a1a1c')
  g.addColorStop(1, '#ec7a3c')
  shape(c, 'M 100 22 C 154 22 186 56 182 112 C 180 170 188 230 178 282 Q 140 294 100 288 Q 60 294 22 282 C 12 230 20 170 18 112 C 14 56 46 22 100 22 Z', g)
  legs(c, '#f2ece2', '#4a2a2a')
  const kimono = asanoha(c, '#f7a9c4', '#e2789c', 26)
  shape(c, TORSO, kimono)
  shape(c, 'M 59 222 L 141 222 L 143 240 L 57 240 Z', '#8e2b3a')
  c.save()
  c.strokeStyle = '#f4d35e'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(60, 231)
  c.lineTo(140, 231)
  c.stroke()
  c.restore()
  shape(c, 'M 70 168 Q 82 165 92 168 L 86 266 Q 68 266 54 260 C 58 230 62 196 70 168 Z', '#5a3326')
  shape(c, 'M 130 168 Q 118 165 108 168 L 114 266 Q 132 266 146 260 C 142 230 138 196 130 168 Z', '#5a3326')
  tube(c, 'M 74 178 C 60 194 56 214 58 236', 24, '#5a3326')
  tube(c, 'M 126 178 C 140 194 144 214 142 236', 24, '#5a3326')
  dot(c, 58, 244, 10, SKIN)
  dot(c, 142, 244, 10, SKIN)
  face(c)
  eyes(c, '#e2648e')
  blush(c)
  c.save()
  c.strokeStyle = '#c8323c'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(56, 140)
  c.quadraticCurveTo(44, 128, 36, 118)
  c.moveTo(144, 140)
  c.quadraticCurveTo(156, 128, 164, 118)
  c.stroke()
  c.restore()
  shape(c, 'M 56 133 Q 100 129 144 133 L 144 147 Q 100 151 56 147 Z', '#86b85a')
  c.save()
  c.lineWidth = 3
  for (const x of [82, 120]) {
    c.beginPath()
    c.moveTo(x, 131)
    c.lineTo(x, 149)
    c.stroke()
  }
  c.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  c.beginPath()
  c.moveTo(62, 136)
  c.lineTo(78, 136)
  c.moveTo(88, 135)
  c.lineTo(114, 135)
  c.stroke()
  c.restore()
  fringe(c, 'M 26 106 C 20 58 56 26 100 26 C 144 26 180 58 174 106 C 168 98 164 90 162 80 C 154 96 140 100 132 86 C 124 100 110 102 102 88 C 94 102 80 100 72 86 C 64 100 50 96 42 80 C 38 92 32 100 26 106 Z', '#1e1418')
  shape(c, 'M 28 100 C 24 130 30 158 40 176 C 40 150 42 122 46 98 Z', '#1e1418')
  shape(c, 'M 172 100 C 176 130 170 158 160 176 C 160 150 158 122 154 98 Z', '#1e1418')
  shine(c, '#5a3a44')
  bow(c, 152, 50, 34, '#f48fb1', '#e0607e', 0.35)
}

const BACK_SHORT = 'M 100 20 C 150 20 182 54 180 104 C 179 126 174 142 166 152 L 34 152 C 26 142 21 126 20 104 C 18 54 50 20 100 20 Z'
const BACK_MESSY = 'M 22 108 C 16 74 24 46 46 30 C 44 20 54 14 64 20 C 74 14 86 12 98 14 C 104 4 120 4 122 16 C 138 18 152 26 162 38 C 172 34 182 42 174 54 C 184 72 184 92 178 108 C 176 128 172 142 164 152 L 36 152 C 28 142 24 128 22 108 Z'
const FRINGE_MESSY = 'M 24 110 C 18 58 54 22 100 22 C 146 22 182 58 176 110 C 170 100 166 88 166 78 C 158 94 148 96 140 82 C 136 98 124 102 116 86 C 112 100 100 104 94 88 C 88 100 76 100 70 84 C 64 98 50 96 44 78 C 40 92 32 102 24 110 Z'
const NAVY = '#27305a'
const SHIRT = '#fbfaf6'

function sideLocks(c: C, fill: string, len = 154) {
  shape(c, `M 28 100 C 26 124 32 ${len - 10} 42 ${len} C 40 134 42 116 46 98 Z`, fill)
  shape(c, `M 172 100 C 174 124 168 ${len - 10} 158 ${len} C 160 134 158 116 154 98 Z`, fill)
}

function grin(c: C) {
  c.beginPath()
  c.moveTo(91, 141)
  c.quadraticCurveTo(101, 149, 111, 139)
  c.stroke()
}

function lashes(c: C) {
  c.save()
  c.lineWidth = 3.5
  c.beginPath()
  c.moveTo(57, 102)
  c.lineTo(51, 98)
  c.moveTo(143, 102)
  c.lineTo(149, 98)
  c.stroke()
  c.restore()
}

function melonPin(c: C, x: number, y: number) {
  c.save()
  c.lineWidth = 2.5
  shape(c, `M ${x - 9} ${y} A 9 9 0 0 0 ${x + 9} ${y} Z`, '#3a9d4a')
  shape(c, `M ${x - 6} ${y} A 6 6 0 0 0 ${x + 6} ${y} Z`, '#ff5d73', false)
  dot(c, x - 2, y + 3, 1, '#2b2228', false)
  dot(c, x + 2, y + 3, 1, '#2b2228', false)
  c.restore()
}

function uniform(c: C, pants = '#4e5263') {
  legs(c, pants, '#2a2228')
  shape(c, TORSO, NAVY)
  shape(c, 'M 86 166 L 114 166 L 100 204 Z', SHIRT)
  shape(c, 'M 96 170 L 104 170 L 107 198 L 100 206 L 93 198 Z', '#d9364f')
  c.save()
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(84, 168)
  c.lineTo(100, 214)
  c.lineTo(116, 168)
  c.stroke()
  c.restore()
  melonPin(c, 124, 192)
}

function guitar(c: C, x: number, y: number, rot: number, body: string, guard: string, neckLen = 74) {
  c.save()
  c.translate(x, y)
  c.rotate(rot)
  const end = -36 - neckLen
  shape(c, `M -36 -5 L ${end} -5 L ${end} 5 L -36 5 Z`, '#7a4a2e')
  shape(c, `M ${end} -8 L ${end - 18} -11 L ${end - 20} 11 L ${end} 8 Z`, '#2b2228')
  c.save()
  c.lineWidth = 1.5
  c.strokeStyle = '#e6d3a8'
  for (let i = 1; i < 6; i++) {
    const fx = -36 - (neckLen * i) / 6
    c.beginPath()
    c.moveTo(fx, -4)
    c.lineTo(fx, 4)
    c.stroke()
  }
  c.restore()
  shape(c, 'M -40 -4 C -48 -30 -22 -36 -10 -24 C -2 -38 24 -38 32 -22 C 50 -18 52 10 36 22 C 30 38 6 40 -4 30 C -24 40 -48 30 -40 -4 Z', body)
  shape(c, 'M -22 -2 C -26 -18 -6 -22 4 -12 C 14 -4 10 18 -6 18 C -18 18 -20 8 -22 -2 Z', guard)
  shape(c, 'M 4 -14 L 11 -14 L 11 14 L 4 14 Z', '#2b2228')
  shape(c, 'M 20 -10 L 26 -10 L 26 10 L 20 10 Z', '#2b2228')
  c.save()
  c.lineWidth = 1
  c.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  for (const sy of [-3, -1, 1, 3]) {
    c.beginPath()
    c.moveTo(26, sy)
    c.lineTo(end, sy)
    c.stroke()
  }
  c.restore()
  c.restore()
}

function eungyeol(c: C) {
  const hair = '#2e2226'
  shape(c, BACK_MESSY, hair)
  uniform(c)
  tube(c, 'M 76 178 C 62 186 50 184 40 178', 22, NAVY)
  tube(c, 'M 126 178 C 136 196 132 214 124 226', 22, NAVY)
  guitar(c, 112, 230, 0.6, '#e5484d', SHIRT)
  dot(c, 40, 178, 10, SKIN)
  dot(c, 123, 228, 10, SKIN)
  ears(c)
  face(c)
  eyes(c, '#7a4a32')
  blush(c)
  smile(c)
  fringe(c, FRINGE_MESSY, hair)
  sideLocks(c, hair)
  shine(c, '#6a5660')
}

function hyeonyool(c: C) {
  const hair = '#1f1b28'
  shape(c, 'M 100 20 C 150 20 182 54 180 104 C 180 130 184 152 176 170 L 24 170 C 16 152 20 130 20 104 C 18 54 50 20 100 20 Z', hair)
  uniform(c, '#3e4252')
  tube(c, 'M 76 178 C 56 184 40 186 28 186', 22, NAVY)
  tube(c, 'M 126 178 C 138 198 134 218 126 232', 22, NAVY)
  guitar(c, 114, 234, 0.5, '#2c2c38', '#e8c39e', 96)
  dot(c, 28, 186, 10, SKIN)
  dot(c, 125, 234, 10, SKIN)
  ears(c)
  face(c)
  eyes(c, '#5a4a72')
  blush(c)
  grin(c)
  fringe(c, 'M 24 112 C 18 60 54 22 100 22 C 146 22 182 60 176 112 C 168 96 158 82 142 72 C 128 64 112 62 102 70 L 98 70 C 88 62 72 64 58 72 C 42 82 32 96 24 112 Z', hair)
  sideLocks(c, hair, 162)
  shine(c, '#4e4a66')
}

function sigook(c: C) {
  const hair = '#6a4026'
  shape(c, BACK_MESSY, hair)
  uniform(c)
  tube(c, 'M 76 178 C 62 186 54 194 50 204', 22, NAVY)
  tube(c, 'M 124 178 C 138 186 146 194 150 204', 22, NAVY)
  shape(c, 'M 54 226 L 54 258 Q 100 272 146 258 L 146 226 Z', '#d9364f')
  c.save()
  c.strokeStyle = '#f4f1ea'
  c.lineWidth = 3
  for (const x of [66, 84, 100, 116, 134]) {
    c.beginPath()
    c.moveTo(x, 232)
    c.lineTo(x, 262)
    c.stroke()
  }
  c.restore()
  shape(c, 'M 54 254 Q 100 268 146 254 L 146 260 Q 100 274 54 260 Z', '#c9ccd4')
  oval(c, 100, 226, 46, 11, '#f4f1ea')
  tube(c, 'M 36 186 L 86 220', 5, '#e9cf9a')
  tube(c, 'M 164 186 L 114 220', 5, '#e9cf9a')
  dot(c, 50, 204, 10, SKIN)
  dot(c, 150, 204, 10, SKIN)
  ears(c)
  face(c)
  eyes(c, '#6a4a2a')
  blush(c)
  smile(c)
  fringe(c, 'M 28 104 C 22 58 56 24 100 24 C 144 24 178 58 172 104 C 168 94 166 84 164 74 C 150 80 138 72 128 76 C 116 70 104 72 94 76 C 82 72 70 78 58 74 C 46 74 36 86 28 104 Z', hair)
  shape(c, 'M 30 80 C 60 64 140 64 170 80 L 170 94 C 140 78 60 78 30 94 Z', SHIRT)
  c.save()
  c.strokeStyle = '#d9364f'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(34, 87)
  c.quadraticCurveTo(100, 66, 166, 87)
  c.stroke()
  c.restore()
}

function sebeom(c: C) {
  const hair = '#2a2020'
  shape(c, BACK_SHORT, hair)
  uniform(c)
  tube(c, 'M 76 178 C 70 194 68 210 70 222', 22, NAVY)
  tube(c, 'M 124 178 C 130 194 132 210 130 222', 22, NAVY)
  c.save()
  c.lineWidth = 4
  c.beginPath()
  c.moveTo(60, 246)
  c.lineTo(84, 290)
  c.moveTo(140, 246)
  c.lineTo(116, 290)
  c.stroke()
  c.restore()
  shape(c, 'M 22 214 L 178 214 L 182 246 L 18 246 Z', '#2b2b36')
  shape(c, 'M 30 222 L 170 222 L 172 240 L 28 240 Z', SHIRT)
  c.fillStyle = '#2b2b36'
  for (let i = 0; i < 12; i++) {
    if (i % 7 === 2 || i % 7 === 6) continue
    c.fillRect(40 + i * 11, 222, 6, 10)
  }
  dot(c, 34, 218, 2.5, '#ffd84d', false)
  dot(c, 44, 218, 2.5, '#7bdcb5', false)
  dot(c, 70, 226, 10, SKIN)
  dot(c, 130, 226, 10, SKIN)
  ears(c)
  face(c)
  eyes(c, '#4a3a5a')
  blush(c)
  grin(c)
  c.save()
  c.lineWidth = 3.5
  c.strokeStyle = '#2b2228'
  for (const x of [71, 129]) {
    c.beginPath()
    c.arc(x, 110, 19, 0, Math.PI * 2)
    c.stroke()
  }
  c.beginPath()
  c.moveTo(90, 106)
  c.quadraticCurveTo(100, 100, 110, 106)
  c.moveTo(52, 106)
  c.lineTo(34, 102)
  c.moveTo(148, 106)
  c.lineTo(166, 102)
  c.stroke()
  c.restore()
  fringe(c, 'M 24 112 C 18 58 54 22 100 22 C 146 22 182 58 176 112 C 172 104 170 96 170 88 C 140 92 60 92 30 88 C 30 96 28 104 24 112 Z', hair)
  sideLocks(c, hair, 140)
  shine(c, '#5a4a4a')
}

function hojin(c: C) {
  const hair = '#231c22'
  const suit = '#2c3346'
  shape(c, BACK_SHORT, hair)
  legs(c, suit, '#1f1a20')
  shape(c, TORSO, suit)
  shape(c, 'M 86 166 L 114 166 L 100 206 Z', SHIRT)
  shape(c, 'M 96 170 L 104 170 L 106 198 L 100 204 L 94 198 Z', '#5a7ab8')
  c.save()
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(84, 168)
  c.lineTo(100, 216)
  c.lineTo(116, 168)
  c.stroke()
  c.restore()
  tube(c, 'M 76 178 C 70 196 74 214 82 226', 22, suit)
  tube(c, 'M 124 178 C 132 196 130 212 122 222', 22, suit)
  c.save()
  c.translate(100, 222)
  c.rotate(-0.12)
  shape(c, 'M -26 -20 L 26 -20 L 26 18 L -26 18 Z', '#f6efe0')
  shape(c, 'M -26 -20 L -20 -20 L -20 18 L -26 18 Z', '#5a7ab8')
  c.fillStyle = LINE
  c.font = '700 11px sans-serif'
  c.textAlign = 'center'
  c.fillText('A', -6, -5)
  c.fillText('가', 10, -5)
  c.fillText('あ', 2, 11)
  c.restore()
  tube(c, 'M 128 218 L 146 196', 4, '#e5b94e')
  dot(c, 82, 228, 10, SKIN)
  dot(c, 124, 222, 10, SKIN)
  ears(c)
  face(c)
  eyes(c, '#4a3428')
  blush(c)
  grin(c)
  fringe(c, 'M 24 108 C 18 56 54 22 100 22 C 146 22 182 56 176 108 C 174 96 170 86 164 76 C 156 70 146 68 138 70 C 120 72 100 82 86 98 C 82 90 78 86 72 84 C 60 84 48 88 40 96 C 34 100 28 104 24 108 Z', hair)
  sideLocks(c, hair, 140)
  shine(c, '#55505e')
  oval(c, 169, 118, 6, 8, '#3a3f5a')
  c.save()
  c.strokeStyle = '#3a3f5a'
  c.lineWidth = 3.5
  c.beginPath()
  c.moveTo(168, 126)
  c.quadraticCurveTo(160, 148, 128, 146)
  c.stroke()
  c.restore()
  dot(c, 126, 146, 3.5, '#3a3f5a', false)
}

function muhee(c: C) {
  const hair = '#5a3424'
  const coat = '#e8d4ae'
  shape(c, 'M 100 20 C 154 20 186 56 182 110 C 180 140 192 160 184 186 C 178 206 192 222 180 242 C 168 260 146 254 140 238 L 60 238 C 54 254 32 260 20 242 C 8 222 22 206 16 186 C 8 160 20 140 18 110 C 14 56 46 20 100 20 Z', hair)
  legs(c, SKIN, '#2b2228')
  shape(c, 'M 70 168 Q 100 160 130 168 C 140 200 146 236 150 266 Q 100 278 50 266 C 54 236 60 200 70 168 Z', coat)
  shape(c, 'M 88 166 L 112 166 L 100 196 Z', SHIRT)
  shape(c, 'M 58 222 L 142 222 L 144 234 L 56 234 Z', '#c8a878')
  c.save()
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(86, 168)
  c.lineTo(100, 206)
  c.lineTo(114, 168)
  c.moveTo(100, 206)
  c.lineTo(100, 268)
  c.stroke()
  c.restore()
  dot(c, 92, 214, 2.5, '#8a6a48', false)
  dot(c, 92, 248, 2.5, '#8a6a48', false)
  shape(c, 'M 148 216 L 192 216 Q 196 216 196 222 L 196 282 Q 196 288 190 288 L 150 288 Q 144 288 144 282 L 144 222 Q 144 216 148 216 Z', '#f2a1b5')
  c.save()
  c.lineWidth = 2.5
  for (const x of [158, 170, 182]) {
    c.beginPath()
    c.moveTo(x, 224)
    c.lineTo(x, 280)
    c.stroke()
  }
  c.restore()
  dot(c, 152, 292, 4, '#2b2228')
  dot(c, 188, 292, 4, '#2b2228')
  c.save()
  c.lineWidth = 5
  c.strokeStyle = '#8a8f9c'
  c.beginPath()
  c.moveTo(160, 216)
  c.lineTo(160, 198)
  c.lineTo(180, 198)
  c.lineTo(180, 216)
  c.stroke()
  c.restore()
  shape(c, 'M 168 250 L 172 242 L 176 250 L 184 252 L 176 256 L 172 264 L 168 256 L 160 252 Z', SHIRT)
  tube(c, 'M 74 178 C 60 196 56 216 56 238', 22, coat)
  tube(c, 'M 126 178 C 140 186 152 196 162 200', 22, coat)
  dot(c, 56, 244, 10, SKIN)
  dot(c, 166, 200, 10, SKIN)
  face(c)
  eyes(c, '#6a4030')
  lashes(c)
  blush(c)
  smile(c, '#d64563')
  fringe(c, 'M 26 108 C 20 58 56 22 100 22 C 144 22 180 58 174 108 C 166 92 152 74 130 66 C 116 62 106 64 100 70 C 94 64 82 62 68 68 C 48 76 32 92 26 108 Z', hair)
  shape(c, 'M 28 100 C 20 130 34 150 26 176 C 22 192 34 204 44 200 C 38 186 50 170 44 150 C 40 132 44 116 48 100 Z', hair)
  shape(c, 'M 172 100 C 180 130 166 150 174 176 C 178 192 166 204 156 200 C 162 186 150 170 156 150 C 160 132 156 116 152 100 Z', hair)
  shine(c, '#8a5a44')
  c.save()
  c.translate(100, 40)
  c.rotate(-0.06)
  shape(c, 'M -46 -10 Q -46 -16 -40 -16 L -10 -16 Q -4 -16 -4 -10 L -6 4 Q -8 10 -14 10 L -38 10 Q -44 10 -45 4 Z', '#2b2228')
  shape(c, 'M 46 -10 Q 46 -16 40 -16 L 10 -16 Q 4 -16 4 -10 L 6 4 Q 8 10 14 10 L 38 10 Q 44 10 45 4 Z', '#2b2228')
  c.beginPath()
  c.moveTo(-4, -8)
  c.lineTo(4, -8)
  c.stroke()
  oval(c, -30, -8, 6, 3, 'rgba(255, 170, 200, 0.7)', false, -0.3)
  oval(c, 22, -8, 6, 3, 'rgba(255, 170, 200, 0.7)', false, -0.3)
  c.restore()
}

function bakerGirl(c: C) {
  const hair = '#3a2622'
  const dress = '#ffb3c6'
  shape(c, 'M 100 20 C 152 20 184 54 182 108 C 182 132 184 150 178 166 C 160 172 140 170 128 164 L 72 164 C 60 170 40 172 22 166 C 16 150 18 132 18 108 C 16 54 48 20 100 20 Z', hair)
  legs(c, SHIRT, '#e63950')
  shape(c, TORSO, dress)
  shape(c, 'M 76 194 L 124 194 L 136 262 Q 100 272 64 262 Z', SHIRT)
  c.save()
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(76, 194)
  c.lineTo(66, 172)
  c.moveTo(124, 194)
  c.lineTo(134, 172)
  c.stroke()
  c.restore()
  tube(c, 'M 76 178 C 70 196 74 212 84 222', 22, dress)
  tube(c, 'M 124 178 C 130 196 126 212 116 222', 22, dress)
  shape(c, 'M 82 214 L 118 214 L 112 238 L 88 238 Z', '#ff8fa3')
  c.save()
  c.lineWidth = 2
  for (const x of [92, 100, 108]) {
    c.beginPath()
    c.moveTo(x, 216)
    c.lineTo(x - 1, 236)
    c.stroke()
  }
  c.restore()
  shape(c, 'M 78 214 C 74 200 90 192 100 196 C 110 192 126 200 122 214 Z', '#fff6ee')
  shape(c, 'M 100 186 C 92 186 92 198 100 202 C 108 198 108 186 100 186 Z', '#e63950')
  shape(c, 'M 96 186 L 100 180 L 104 186 Z', '#3a9d4a')
  dot(c, 84, 224, 10, SKIN)
  dot(c, 116, 224, 10, SKIN)
  face(c)
  eyes(c, '#5a3a2a')
  lashes(c)
  blush(c)
  smile(c)
  fringe(c, 'M 24 110 C 18 58 54 22 100 22 C 146 22 182 58 176 110 C 172 100 168 92 168 86 C 152 94 136 92 124 84 C 112 94 88 94 76 84 C 64 92 48 94 32 86 C 32 94 28 102 24 110 Z', hair)
  shine(c, '#6a4a44')
  bow(c, 148, 40, 54, '#e63950', '#b82440', 0.25)
}

function bakerBoy(c: C) {
  const hair = '#6a4630'
  shape(c, BACK_SHORT, hair)
  legs(c, '#3a3440', '#1f1a20')
  shape(c, TORSO, SHIRT)
  c.save()
  c.fillStyle = '#c9ccd4'
  for (const y of [190, 210, 230]) {
    for (const x of [88, 112]) {
      c.beginPath()
      c.arc(x, y, 3.5, 0, Math.PI * 2)
      c.fill()
      c.stroke()
    }
  }
  c.restore()
  shape(c, 'M 78 168 L 122 168 L 100 192 Z', '#e63950')
  tube(c, 'M 76 178 C 64 192 60 206 62 214', 22, SHIRT)
  tube(c, 'M 124 178 C 136 192 140 206 138 214', 22, SHIRT)
  oval(c, 100, 214, 54, 9, '#d9dde3')
  shape(c, 'M 72 210 L 72 186 Q 100 178 128 186 L 128 210 Q 100 216 72 210 Z', '#fff6ee')
  shape(c, 'M 72 198 Q 100 192 128 198 L 128 202 Q 100 196 72 202 Z', '#ff8fa3', false)
  oval(c, 100, 186, 28, 6, '#fff6ee')
  for (const x of [86, 100, 114]) {
    shape(c, `M ${x} 172 C ${x - 7} 172 ${x - 7} 184 ${x} 187 C ${x + 7} 184 ${x + 7} 172 ${x} 172 Z`, '#e63950')
  }
  dot(c, 60, 216, 10, SKIN)
  dot(c, 140, 216, 10, SKIN)
  ears(c)
  face(c)
  eyes(c, '#5a3a2a')
  blush(c)
  smile(c)
  fringe(c, FRINGE_MESSY, hair)
  sideLocks(c, hair, 140)
  shape(c, 'M 44 60 L 156 60 L 156 34 L 44 34 Z', SHIRT)
  shape(c, 'M 46 38 C 26 22 38 -8 62 -2 C 68 -22 98 -26 106 -8 C 118 -24 150 -18 148 2 C 172 0 174 32 154 38 Z', SHIRT)
}

const figures: Record<FigureId, (c: C) => void> = { tanjiro, nezuko, eungyeol, hyeonyool, sigook, sebeom, hojin, muhee, bakerGirl, bakerBoy }

export function drawFigure(c: C, id: FigureId, x: number, y: number, h: number, s: number, flip = false) {
  const k = (h * s) / 300
  c.save()
  c.translate(x * s, y * s)
  c.scale(flip ? -k : k, k)
  c.translate(-100, -300)
  c.lineJoin = 'round'
  c.lineCap = 'round'
  c.lineWidth = LW
  c.strokeStyle = LINE
  figures[id](c)
  c.restore()
}
