import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Palette } from '@phosphor-icons/react'
import { Slider } from './Slider'

type Props = {
  label: string
  value: string | null
  colors: string[]
  onChange: (color: string | null) => void
  autoLabel?: string
  allowCustom?: boolean
}

const hslToHex = (h: number, s: number, l: number) => {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const hexToHsl = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)]
}

export function SwatchPicker({ label, value, colors, onChange, autoLabel, allowCustom = true }: Props) {
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [custom, setCustom] = useState(false)
  const options: (string | null)[] = autoLabel ? [null, ...colors] : colors
  const index = Math.max(0, options.findIndex((c) => c === value))
  const isCustomValue = value !== null && !colors.includes(value)
  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHsl(value && value.startsWith('#') ? value : '#ff9fb5'))

  const move = (i: number) => {
    const next = (i + options.length) % options.length
    onChange(options[next])
    refs.current[next]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    if (e.key in map) {
      e.preventDefault()
      move(index + map[e.key])
    }
  }

  const setPart = (part: 0 | 1 | 2, v: number) => {
    const next = [...hsl] as [number, number, number]
    next[part] = v
    setHsl(next)
    onChange(hslToHex(next[0], next[1], next[2]))
  }

  return (
    <div className="field swatch-field">
      <span id={id} className="field__label">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={id} className="swatches" onKeyDown={onKeyDown}>
        {options.map((c, i) => {
          const checked = c === value || (i === 0 && !!autoLabel && value === null)
          return (
            <button
              key={c ?? 'auto'}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={c ?? autoLabel}
              tabIndex={checked || (index === -1 && i === 0) ? 0 : -1}
              className={`swatch ${c === null ? 'swatch--auto' : ''}`}
              style={c ? { background: c } : undefined}
              onClick={() => onChange(c)}
            >
              {c === null && <span aria-hidden="true">Auto</span>}
            </button>
          )
        })}
        {allowCustom && (
          <button
            type="button"
            className={`swatch swatch--custom ${isCustomValue ? 'is-on' : ''}`}
            aria-expanded={custom}
            aria-label="Custom color"
            style={isCustomValue && value ? { background: value } : undefined}
            onClick={() => setCustom((v) => !v)}
          >
            <Palette weight="bold" size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {allowCustom && custom && (
        <div className="custom-color">
          <Slider label="Hue" value={hsl[0]} min={0} max={359} onChange={(v) => setPart(0, v)} format={(v) => `${v}`} />
          <Slider label="Saturation" value={hsl[1]} min={0} max={100} onChange={(v) => setPart(1, v)} format={(v) => `${v}%`} />
          <Slider label="Lightness" value={hsl[2]} min={5} max={98} onChange={(v) => setPart(2, v)} format={(v) => `${v}%`} />
        </div>
      )}
    </div>
  )
}
