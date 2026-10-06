import { useEffect, useRef } from 'react'
import { Prohibit } from '@phosphor-icons/react'
import { backdrops, backdropCanvas, type Backdrop } from '../../lib/backdrops'
import { loadSegmenter } from '../../lib/segment'
import { useSegmenterStatus } from '../../hooks/useSegmenterStatus'
import { useT } from '../../i18n'

const TW = 96
const TH = 112

function BackdropThumb({ b }: { b: Backdrop }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = TW * dpr
    c.height = TH * dpr
    const ctx = c.getContext('2d')!
    const W = c.width
    const H = c.height
    if (b.kind === 'blur') {
      const g = ctx.createRadialGradient(W * 0.3, H * 0.3, 0, W * 0.5, H * 0.5, W)
      g.addColorStop(0, '#f6e7c9')
      g.addColorStop(0.5, '#cfdcd2')
      g.addColorStop(1, '#a9b7c9')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      ctx.filter = `blur(${6 * dpr}px)`
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.arc(W * 0.78, H * 0.22, W * 0.14, 0, Math.PI * 2)
      ctx.fill()
      ctx.filter = 'none'
    } else if (b.kind === 'fill') {
      ctx.drawImage(backdropCanvas(b, W, H), 0, 0)
    } else {
      ctx.fillStyle = '#efe6e8'
      ctx.fillRect(0, 0, W, H)
      return
    }
    ctx.fillStyle = 'rgba(59, 34, 48, 0.55)'
    ctx.beginPath()
    ctx.arc(W / 2, H * 0.48, W * 0.17, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(W / 2, H * 1.02, W * 0.36, H * 0.32, 0, Math.PI, 0)
    ctx.fill()
  }, [b])
  return <canvas ref={ref} aria-hidden="true" />
}

type PickerProps = {
  value: string
  onChange: (id: string) => void
  variant?: 'rail' | 'grid'
}

export function BackdropPicker({ value, onChange, variant = 'grid' }: PickerProps) {
  const t = useT()
  const status = useSegmenterStatus()
  const on = value !== 'none'

  return (
    <div className={`filter-picker filter-picker--${variant}`}>
      <p className="field__hint">{t.look.backdropHint}</p>
      <div className="filter-picker__scroll">
        <div role="radiogroup" aria-label={t.look.backdropsLabel} className="filter-picker__list">
          {backdrops.map((b) => {
            const active = b.id === value
            return (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`filter-chip ${active ? 'is-active' : ''}`}
                onClick={() => {
                  onChange(b.id)
                  if (b.kind !== 'none') loadSegmenter()
                }}
              >
                <span className="filter-chip__img backdrop-thumb">
                  <BackdropThumb b={b} />
                  {b.kind === 'none' && <Prohibit weight="bold" size={28} aria-hidden="true" className="backdrop-thumb__off" />}
                </span>
                <span className="filter-chip__name">{t.look.backdrops[b.id]}</span>
              </button>
            )
          })}
        </div>
      </div>
      {on && status === 'loading' && (
        <p className="look-status" aria-live="polite">
          <span className="btn__spinner" aria-hidden="true" />
          {t.look.backdropLoading}
        </p>
      )}
      {on && status === 'error' && (
        <p className="look-status look-status--error" role="alert">
          {t.look.backdropError}{' '}
          <button type="button" className="link-btn" onClick={() => loadSegmenter()}>
            {t.common.tryAgain}
          </button>
        </p>
      )}
    </div>
  )
}
