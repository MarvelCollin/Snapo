import { useEffect, useMemo, useRef, useState } from 'react'
import { frames, frameGroups, swatches, type Fill, type Frame, type FrameGroup } from '../../lib/frames'
import { patternList } from '../../lib/patterns'
import { fillStyleFor } from '../../lib/render'
import { useDesign } from '../../store/design'
import { Tabs } from '../ui/Tabs'
import { Segmented } from '../ui/Segmented'
import { SwatchPicker } from '../ui/SwatchPicker'
import { Slider } from '../ui/Slider'
import { useSession } from '../../store/session'
import { layoutById } from '../../lib/layouts'
import { useT } from '../../i18n'

const lightness = (hex: string) => {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0'), 16)
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
}

function FillThumb({ fill, w = 64, h = 84, strip = true }: { fill: Fill; w?: number; h?: number; strip?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = w * dpr
    c.height = h * dpr
    const ctx = c.getContext('2d')!
    ctx.fillStyle = fillStyleFor(ctx, fill, c.width, c.height, 0.42 * dpr)
    ctx.fillRect(0, 0, c.width, c.height)
    if (strip) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      const pad = c.width * 0.22
      const gap = c.height * 0.05
      const sh = (c.height * 0.72 - gap * 2) / 3
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.roundRect(pad, c.height * 0.08 + i * (sh + gap), c.width - pad * 2, sh, 3 * dpr)
        ctx.fill()
      }
    }
  }, [fill, w, h, strip])
  return <canvas ref={ref} style={{ width: w, height: h }} aria-hidden="true" />
}

export function FramePanel() {
  const t = useT()
  const ownFrame = useSession((s) => !!layoutById(s.layoutId).overlay)
  const design = useDesign((s) => s.design)
  const update = useDesign((s) => s.update)
  const [group, setGroup] = useState<FrameGroup | 'all'>('all')
  const [view, setView] = useState<'themes' | 'custom'>('themes')
  const list = useMemo(() => (group === 'all' ? frames : frames.filter((f) => f.group === group)), [group])
  const frame = design.frame
  const fill = frame.fill

  const setFrame = (patch: Partial<Frame>) => update({ frame: { ...frame, ...patch } })
  const setFill = (next: Fill) => setFrame({ fill: next })

  const toKind = (kind: Fill['kind']) => {
    if (kind === fill.kind) return
    const base = fill.kind === 'solid' ? fill.color : fill.kind === 'pattern' ? fill.base : fill.colors[0]
    if (kind === 'solid') setFill({ kind: 'solid', color: base })
    else if (kind === 'gradient') setFill({ kind: 'gradient', colors: [base, '#c7e4ff'], angle: 180 })
    else setFill({ kind: 'pattern', base, ink: lightness(base) > 0.8 ? frame.text : '#ffffff', extra: '#ffd166', pattern: 'polka', scale: 0.8 })
  }

  return (
    <div className="panel-stack">
      <Segmented<'themes' | 'custom'>
        label={t.frames.view}
        hideLabel
        value={view}
        onChange={setView}
        options={[
          { value: 'themes', label: t.frames.themes(frames.length) },
          { value: 'custom', label: t.frames.customize },
        ]}
      />
      {ownFrame && <p className="panel-note">{t.frames.ownFrame}</p>}
      {view === 'themes' && (
        <section className="panel-section" aria-labelledby="frame-presets">
          <h3 id="frame-presets" className="visually-hidden">
            {t.frames.presets}
          </h3>
          <Tabs label={t.frames.presets} tabs={frameGroups.map((id) => ({ id, label: t.frames.groups[id] }))} active={group} onChange={setGroup} idPrefix="frames" />
          <div id="frames-panel" role="tabpanel" aria-labelledby={`frames-tab-${group}`}>
            <div role="radiogroup" aria-label={t.frames.presets} className="frame-grid">
              {list.map((f) => {
                const active = frame.id === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`frame-tile ${active ? 'is-active' : ''}`}
                    onClick={() => update({ frame: { ...f } })}
                  >
                    <span className="frame-tile__art">
                      <FillThumb fill={f.fill} />
                    </span>
                    <span className="frame-tile__name">{f.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <button type="button" className="link-btn" onClick={() => setView('custom')}>
            {t.frames.tweak(frame.name)}
          </button>
        </section>
      )}

      {view === 'custom' && (
        <section className="panel-section" aria-labelledby="frame-custom">
          <h3 id="frame-custom" className="panel-subtitle">
            {t.frames.customizeTitle(frame.name)}
          </h3>
          <Segmented<Fill['kind']>
            label={t.frames.background}
            value={fill.kind}
            onChange={toKind}
            options={[
              { value: 'solid', label: t.frames.solid },
              { value: 'gradient', label: t.frames.gradient },
              { value: 'pattern', label: t.frames.pattern },
            ]}
          />
          {fill.kind === 'solid' && <SwatchPicker label={t.frames.color} value={fill.color} colors={swatches} onChange={(c) => c && setFill({ ...fill, color: c })} />}
          {fill.kind === 'gradient' && (
            <>
              <SwatchPicker
                label={t.frames.topColor}
                value={fill.colors[0]}
                colors={swatches}
                onChange={(c) => c && setFill({ ...fill, colors: [c, ...fill.colors.slice(1)] })}
              />
              <SwatchPicker
                label={t.frames.bottomColor}
                value={fill.colors[fill.colors.length - 1]}
                colors={swatches}
                onChange={(c) => c && setFill({ ...fill, colors: [...fill.colors.slice(0, -1), c] })}
              />
              <Slider label={t.frames.angle} value={fill.angle} min={0} max={360} step={5} onChange={(v) => setFill({ ...fill, angle: v })} format={(v) => `${v}°`} />
            </>
          )}
          {fill.kind === 'pattern' && (
            <>
              <div className="field">
                <span className="field__label" id="pattern-label">
                  {t.frames.pattern}
                </span>
                <div role="radiogroup" aria-labelledby="pattern-label" className="pattern-grid">
                  {patternList.map((id) => {
                    const active = fill.pattern === id
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`pattern-tile ${active ? 'is-active' : ''}`}
                        onClick={() => setFill({ ...fill, pattern: id })}
                      >
                        <FillThumb fill={{ ...fill, pattern: id }} w={52} h={52} strip={false} />
                        <span>{t.frames.patterns[id]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <SwatchPicker label={t.frames.bgColor} value={fill.base} colors={swatches} onChange={(c) => c && setFill({ ...fill, base: c })} />
              <SwatchPicker label={t.frames.patternColor} value={fill.ink} colors={swatches} onChange={(c) => c && setFill({ ...fill, ink: c })} />
              <SwatchPicker label={t.frames.accentColor} value={fill.extra} colors={swatches} onChange={(c) => c && setFill({ ...fill, extra: c })} />
              <Slider
                label={t.frames.patternSize}
                value={Math.round(fill.scale * 100)}
                min={30}
                max={200}
                step={5}
                onChange={(v) => setFill({ ...fill, scale: v / 100 })}
                format={(v) => `${v}%`}
              />
            </>
          )}
          <SwatchPicker label={t.frames.emptyColor} value={frame.accent} colors={swatches} onChange={(c) => c && setFrame({ accent: c })} />
        </section>
      )}
    </div>
  )
}
