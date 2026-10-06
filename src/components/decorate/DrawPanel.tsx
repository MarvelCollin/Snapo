import { useEffect, useRef } from 'react'
import { Eraser, PencilSimple, Trash } from '@phosphor-icons/react'
import { drawStroke, penColors, penSizes, penStyles, type PenSizeId, type PenStyle } from '../../lib/doodle'
import { useDesign } from '../../store/design'
import { useDrawTool } from '../../store/drawTool'
import { useT } from '../../i18n'
import { Segmented } from '../ui/Segmented'
import { SwatchPicker } from '../ui/SwatchPicker'
import { Button } from '../ui/Button'
import { toast } from '../../store/toasts'

function PenSample({ pen, color }: { pen: PenStyle; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = 72 * dpr
    c.height = 32 * dpr
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    const pts: number[] = []
    for (let i = 0; i <= 16; i++) {
      const u = i / 16
      pts.push(0.12 + u * 0.76, 0.5 + Math.sin(u * Math.PI * 2) * 0.22)
    }
    drawStroke(ctx, { id: 'sample', pen, color, size: 0.09, points: pts }, c.width, c.height)
  }, [pen, color])
  return <canvas ref={ref} style={{ width: 72, height: 32 }} aria-hidden="true" />
}

export function DrawPanel() {
  const t = useT()
  const { mode, pen, color, size, set } = useDrawTool()
  const strokes = useDesign((s) => s.design.strokes)
  const removeStrokes = useDesign((s) => s.removeStrokes)

  return (
    <div className="panel-stack">
      <p className="panel-note">{mode === 'erase' ? t.draw.eraseHint : t.draw.hint}</p>
      <Segmented<'pen' | 'erase'>
        label={t.draw.tool}
        value={mode}
        onChange={(m) => set({ mode: m })}
        options={[
          {
            value: 'pen',
            label: (
              <>
                <PencilSimple weight="bold" size={16} aria-hidden="true" /> {t.draw.pen}
              </>
            ),
          },
          {
            value: 'erase',
            label: (
              <>
                <Eraser weight="bold" size={16} aria-hidden="true" /> {t.draw.eraser}
              </>
            ),
          },
        ]}
      />
      <div className="field">
        <span className="field__label" id="pen-style">
          {t.draw.penStyle}
        </span>
        <div role="radiogroup" aria-labelledby="pen-style" className="pen-grid">
          {penStyles.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={pen === p}
              className={`pen-chip ${pen === p ? 'is-active' : ''}`}
              onClick={() => set({ pen: p, mode: 'pen' })}
            >
              <span className="pen-chip__art">
                <PenSample pen={p} color={color} />
              </span>
              <span>{t.draw.pens[p]}</span>
            </button>
          ))}
        </div>
      </div>
      <Segmented<PenSizeId>
        label={t.draw.size}
        value={size}
        onChange={(s) => set({ size: s })}
        options={penSizes.map((s) => ({ value: s.id, label: t.draw.sizes[s.id] }))}
      />
      {pen === 'rainbow' ? (
        <p className="field__hint">{t.draw.rainbowNote}</p>
      ) : (
        <SwatchPicker label={t.draw.color} value={color} colors={penColors} onChange={(c) => c && set({ color: c, mode: 'pen' })} />
      )}
      <Button
        icon={<Trash weight="bold" size={18} />}
        disabled={!strokes.length}
        onClick={() => {
          removeStrokes(strokes.map((s) => s.id))
          toast(t.draw.cleared, { actionLabel: t.common.undo, onAction: () => useDesign.getState().undo() })
        }}
      >
        {t.draw.clear}
        {strokes.length ? ` (${strokes.length})` : ''}
      </Button>
    </div>
  )
}
