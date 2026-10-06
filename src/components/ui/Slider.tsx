import { useId, useRef, type KeyboardEvent, type PointerEvent } from 'react'

type Props = {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  hideLabel?: boolean
}

export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, format = (v) => String(v), hideLabel }: Props) {
  const id = useId()
  const trackRef = useRef<HTMLDivElement>(null)
  const pct = ((value - min) / (max - min)) * 100

  const clamp = (v: number) => {
    const snapped = Math.round((v - min) / step) * step + min
    return Math.min(max, Math.max(min, Number(snapped.toFixed(4))))
  }

  const fromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = (clientX - rect.left) / rect.width
    onChange(clamp(min + ratio * (max - min)))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    fromPointer(e.clientX)
    ;(e.currentTarget.querySelector('[role="slider"]') as HTMLElement | null)?.focus()
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e.clientX)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const big = (max - min) / 10
    const map: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    }
    if (e.key in map) {
      e.preventDefault()
      onChange(clamp(map[e.key]))
    }
  }

  return (
    <div className="field slider-field">
      <div className={hideLabel ? 'visually-hidden' : 'slider-field__head'}>
        <span id={`${id}-l`} className="field__label">
          {label}
        </span>
        <span className="slider-field__value" aria-hidden="true">
          {format(value)}
        </span>
      </div>
      <div ref={trackRef} className="slider" onPointerDown={onPointerDown} onPointerMove={onPointerMove}>
        <div className="slider__track">
          <div className="slider__fill" style={{ width: `${pct}%` }} />
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-labelledby={`${id}-l`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format(value)}
          className="slider__thumb"
          style={{ left: `${pct}%` }}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  )
}
