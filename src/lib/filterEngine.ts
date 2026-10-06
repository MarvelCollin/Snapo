import { colorMatrix, hexToRgb, type FilterDef } from './filters'

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec4 u_crop;
uniform float u_flip;
uniform vec2 u_res;
uniform mat3 u_matrix;
uniform vec3 u_offset;
uniform float u_strength;
uniform float u_fade;
uniform vec3 u_shadows;
uniform vec3 u_highlights;
uniform vec3 u_overlayColor;
uniform float u_overlayAmount;
uniform float u_overlayMode;
uniform vec3 u_duoA;
uniform vec3 u_duoB;
uniform float u_duo;
uniform float u_posterize;
uniform float u_vignette;
uniform float u_grain;
uniform float u_glow;
uniform float u_rgbShift;
uniform float u_pixelate;
uniform float u_seed;

const vec3 W = vec3(0.2126, 0.7152, 0.0722);

vec2 srcUv(vec2 uv) {
  vec2 p = uv;
  if (u_flip > 0.5) p.x = 1.0 - p.x;
  return u_crop.xy + p * u_crop.zw;
}

vec3 sampleAt(vec2 uv) {
  vec2 p = uv;
  if (u_pixelate > 0.0) {
    vec2 cells = vec2(u_pixelate, u_pixelate * u_res.y / u_res.x);
    p = (floor(p * cells) + 0.5) / cells;
  }
  if (u_rgbShift > 0.0) {
    float r = texture2D(u_tex, srcUv(p + vec2(u_rgbShift, 0.0))).r;
    float g = texture2D(u_tex, srcUv(p)).g;
    float b = texture2D(u_tex, srcUv(p - vec2(u_rgbShift, 0.0))).b;
    return vec3(r, g, b);
  }
  return texture2D(u_tex, srcUv(p)).rgb;
}

vec3 blendOverlay(vec3 a, vec3 b) {
  return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, a));
}

vec3 blendSoft(vec3 a, vec3 b) {
  return (1.0 - 2.0 * b) * a * a + 2.0 * b * a;
}

void main() {
  vec3 base = sampleAt(v_uv);
  vec3 c = base;

  if (u_glow > 0.0) {
    vec3 acc = vec3(0.0);
    float r = 0.012;
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 0.5236;
      vec2 o = vec2(cos(a), sin(a) * u_res.x / u_res.y) * r;
      acc += sampleAt(v_uv + o);
      acc += sampleAt(v_uv + o * 0.5);
    }
    vec3 blur = acc / 24.0;
    vec3 bright = max(blur - 0.35, 0.0) * 1.5;
    c = 1.0 - (1.0 - c) * (1.0 - bright * u_glow);
    c = mix(c, blur, u_glow * 0.25);
  }

  c = u_matrix * c + u_offset;
  c = clamp(c, 0.0, 1.0);

  float lum = dot(c, W);
  c += u_shadows * (1.0 - lum) * 1.6 + u_highlights * lum * 1.6;

  c = c * (1.0 - u_fade * 0.28) + u_fade * 0.14;
  c = clamp(c, 0.0, 1.0);

  if (u_overlayAmount > 0.0) {
    vec3 o = u_overlayColor;
    vec3 blended = c;
    if (u_overlayMode < 1.5) blended = c * o;
    else if (u_overlayMode < 2.5) blended = 1.0 - (1.0 - c) * (1.0 - o);
    else if (u_overlayMode < 3.5) blended = blendOverlay(c, o);
    else if (u_overlayMode < 4.5) blended = blendSoft(c, o);
    else blended = clamp(o + (dot(c, W) - dot(o, W)), 0.0, 1.0);
    c = mix(c, blended, u_overlayAmount);
  }

  if (u_duo > 0.5) {
    float l = smoothstep(0.05, 0.95, dot(c, W));
    c = mix(u_duoA, u_duoB, l);
  }

  if (u_posterize > 0.0) {
    c = floor(c * u_posterize + 0.5) / u_posterize;
  }

  if (u_vignette > 0.0) {
    vec2 d = v_uv - 0.5;
    d.x *= u_res.x / max(u_res.y, 1.0);
    float dist = length(d) / 0.7071;
    c *= 1.0 - u_vignette * smoothstep(0.35, 1.15, dist) * 0.85;
  }

  if (u_grain > 0.0) {
    float n = fract(sin(dot(floor(v_uv * u_res) + u_seed, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    c += n * u_grain * 0.22;
  }

  c = clamp(c, 0.0, 1.0);
  gl_FragColor = vec4(mix(base, c, u_strength), 1.0);
}
`

const MODES = { multiply: 1, screen: 2, overlay: 3, softlight: 4, color: 5 } as const

export type RenderOpts = {
  width: number
  height: number
  crop?: { x: number; y: number; w: number; h: number }
  mirror?: boolean
  strength?: number
  seed?: number
}

export function coverCrop(srcW: number, srcH: number, dstW: number, dstH: number) {
  const srcRatio = srcW / srcH
  const dstRatio = dstW / dstH
  if (srcRatio > dstRatio) {
    const w = dstRatio / srcRatio
    return { x: (1 - w) / 2, y: 0, w, h: 1 }
  }
  const h = srcRatio / dstRatio
  return { x: 0, y: (1 - h) / 2, w: 1, h }
}

export class FilterEngine {
  canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext | null
  private tex: WebGLTexture | null = null
  private loc: Record<string, WebGLUniformLocation | null> = {}
  ok = false

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas ?? document.createElement('canvas')
    this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false })
    if (this.gl) this.init(this.gl)
  }

  private init(gl: WebGLRenderingContext) {
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader error')
      return s
    }
    try {
      const p = gl.createProgram()!
      gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT))
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link error')
      gl.useProgram(p)
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
      const aPos = gl.getAttribLocation(p, 'a_pos')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
      this.tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, this.tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      const names = [
        'u_tex', 'u_crop', 'u_flip', 'u_res', 'u_matrix', 'u_offset', 'u_strength', 'u_fade', 'u_shadows', 'u_highlights',
        'u_overlayColor', 'u_overlayAmount', 'u_overlayMode', 'u_duoA', 'u_duoB', 'u_duo', 'u_posterize', 'u_vignette',
        'u_grain', 'u_glow', 'u_rgbShift', 'u_pixelate', 'u_seed',
      ]
      for (const n of names) this.loc[n] = gl.getUniformLocation(p, n)
      this.ok = true
    } catch (err) {
      console.error(err)
      this.ok = false
    }
  }

  render(source: TexImageSource, filter: FilterDef, opts: RenderOpts) {
    const { width, height } = opts
    if (this.canvas.width !== width) this.canvas.width = width
    if (this.canvas.height !== height) this.canvas.height = height
    const gl = this.gl
    if (!gl || !this.ok) {
      const ctx = this.canvas.getContext('2d')
      ctx?.drawImage(source as CanvasImageSource, 0, 0, width, height)
      return this.canvas
    }
    gl.viewport(0, 0, width, height)
    gl.bindTexture(gl.TEXTURE_2D, this.tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)

    const crop = opts.crop ?? { x: 0, y: 0, w: 1, h: 1 }
    const { m, o } = colorMatrix(filter)
    const L = this.loc
    gl.uniform1i(L.u_tex, 0)
    gl.uniform4f(L.u_crop, crop.x, 1 - crop.y - crop.h, crop.w, crop.h)
    gl.uniform1f(L.u_flip, opts.mirror ? 1 : 0)
    gl.uniform2f(L.u_res, width, height)
    gl.uniformMatrix3fv(L.u_matrix, false, [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]])
    gl.uniform3f(L.u_offset, o[0], o[1], o[2])
    gl.uniform1f(L.u_strength, opts.strength ?? 1)
    gl.uniform1f(L.u_fade, filter.fade ?? 0)
    gl.uniform3fv(L.u_shadows, filter.shadows ?? [0, 0, 0])
    gl.uniform3fv(L.u_highlights, filter.highlights ?? [0, 0, 0])
    if (filter.overlay) {
      gl.uniform3fv(L.u_overlayColor, hexToRgb(filter.overlay.color))
      gl.uniform1f(L.u_overlayAmount, filter.overlay.amount)
      gl.uniform1f(L.u_overlayMode, MODES[filter.overlay.blend])
    } else {
      gl.uniform1f(L.u_overlayAmount, 0)
    }
    if (filter.duotone) {
      gl.uniform3fv(L.u_duoA, hexToRgb(filter.duotone[0]))
      gl.uniform3fv(L.u_duoB, hexToRgb(filter.duotone[1]))
      gl.uniform1f(L.u_duo, 1)
    } else {
      gl.uniform1f(L.u_duo, 0)
    }
    gl.uniform1f(L.u_posterize, filter.posterize ?? 0)
    gl.uniform1f(L.u_vignette, filter.vignette ?? 0)
    gl.uniform1f(L.u_grain, filter.grain ?? 0)
    gl.uniform1f(L.u_glow, filter.glow ?? 0)
    gl.uniform1f(L.u_rgbShift, filter.rgbShift ?? 0)
    gl.uniform1f(L.u_pixelate, filter.pixelate ?? 0)
    gl.uniform1f(L.u_seed, opts.seed ?? 0)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    return this.canvas
  }
}

let shared: FilterEngine | null = null

export const sharedEngine = () => {
  if (!shared) shared = new FilterEngine()
  return shared
}

export function filterToCanvas(source: TexImageSource, filter: FilterDef, opts: RenderOpts) {
  const engine = sharedEngine()
  engine.render(source, filter, opts)
  const out = document.createElement('canvas')
  out.width = opts.width
  out.height = opts.height
  out.getContext('2d')!.drawImage(engine.canvas, 0, 0)
  return out
}
