import { captionFonts } from '../../lib/fonts'
import { swatches } from '../../lib/frames'
import { formatDate } from '../../lib/render'
import { useDesign, type DateStyle, type Design } from '../../store/design'
import { TextField } from '../ui/TextField'
import { Switch } from '../ui/Switch'
import { Segmented } from '../ui/Segmented'
import { SwatchPicker } from '../ui/SwatchPicker'
import { Slider } from '../ui/Slider'
import { useSession } from '../../store/session'
import { layoutById } from '../../lib/layouts'
import { useT } from '../../i18n'

export function StylePanel() {
  const t = useT()
  const noCaption = useSession((s) => {
    const layout = layoutById(s.layoutId)
    return layout.captions.length === 0 && !layout.art
  })
  const design = useDesign((s) => s.design)
  const update = useDesign((s) => s.update)
  const checkpoint = useDesign((s) => s.checkpoint)
  const now = new Date()

  return (
    <div className="panel-stack">
      <section className="panel-section" aria-labelledby="caption-title">
        <h3 id="caption-title" className="panel-subtitle">
          {t.caption.caption}
        </h3>
        {noCaption && <p className="panel-note">{t.caption.noCaption}</p>}
        <TextField
          label={t.caption.captionText}
          value={design.caption}
          maxLength={60}
          onFocus={checkpoint}
          onChange={(caption) => update({ caption }, { history: false })}
          hint={t.caption.hint}
        />
        <div className="field">
          <span className="field__label" id="caption-font">
            {t.caption.font}
          </span>
          <div role="radiogroup" aria-labelledby="caption-font" className="chip-grid">
            {captionFonts.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={design.captionFont === f.id}
                className="font-chip"
                style={{ fontFamily: `"${f.family}"`, fontWeight: f.weight }}
                onClick={() => update({ captionFont: f.id })}
              >
                {t.text.fonts[f.id]}
              </button>
            ))}
          </div>
        </div>
        <SwatchPicker label={t.caption.textColor} value={design.captionColor} colors={swatches} autoLabel={t.caption.matchFrame} onChange={(c) => update({ captionColor: c })} />
        <Switch label={t.caption.showDate} checked={design.showDate} onChange={(showDate) => update({ showDate })} />
        {design.showDate && (
          <Segmented<DateStyle>
            label={t.caption.dateStyle}
            value={design.dateStyle}
            onChange={(dateStyle) => update({ dateStyle })}
            options={[
              { value: 'dots', label: formatDate(now, 'dots') },
              { value: 'short', label: formatDate(now, 'short') },
              { value: 'long', label: formatDate(now, 'long') },
            ]}
            size="sm"
          />
        )}
        <Switch label={t.caption.showMark} checked={design.showLogo} onChange={(showLogo) => update({ showLogo })} />
      </section>

      <section className="panel-section" aria-labelledby="photo-style">
        <h3 id="photo-style" className="panel-subtitle">
          {t.caption.photos}
        </h3>
        <Slider
          label={t.caption.corners}
          value={Math.round(design.photoRadius * 100)}
          min={0}
          max={30}
          onChange={(v) => update({ photoRadius: v / 100 }, { history: false })}
          format={(v) => (v === 0 ? t.caption.square : `${v}%`)}
        />
        <Segmented<Design['photoOutline']>
          label={t.caption.border}
          value={design.photoOutline}
          onChange={(photoOutline) => update({ photoOutline })}
          options={[
            { value: 'frame', label: t.caption.borders.frame },
            { value: 'none', label: t.caption.borders.none },
            { value: 'white', label: t.caption.borders.white },
            { value: 'ink', label: t.caption.borders.ink },
          ]}
        />
      </section>
    </div>
  )
}
