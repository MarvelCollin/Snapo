import { captionFonts } from '../../fonts'
import { swatches } from '../../lib/frames'
import { formatDate } from '../../lib/render'
import { useDesign, type DateStyle, type Design } from '../../store/design'
import { TextField } from '../ui/TextField'
import { Switch } from '../ui/Switch'
import { Segmented } from '../ui/Segmented'
import { SwatchPicker } from '../ui/SwatchPicker'
import { Slider } from '../ui/Slider'

export function StylePanel() {
  const design = useDesign((s) => s.design)
  const update = useDesign((s) => s.update)
  const checkpoint = useDesign((s) => s.checkpoint)
  const now = new Date()

  return (
    <div className="panel-stack">
      <section className="panel-section" aria-labelledby="caption-title">
        <h3 id="caption-title" className="panel-subtitle">
          Caption
        </h3>
        <TextField
          label="Caption text"
          value={design.caption}
          maxLength={60}
          onFocus={checkpoint}
          onChange={(caption) => update({ caption }, { history: false })}
          hint="Leave empty for no caption"
        />
        <div className="field">
          <span className="field__label" id="caption-font">
            Font
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
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <SwatchPicker label="Text color" value={design.captionColor} colors={swatches} autoLabel="Match frame" onChange={(c) => update({ captionColor: c })} />
        <Switch label="Show date" checked={design.showDate} onChange={(showDate) => update({ showDate })} />
        {design.showDate && (
          <Segmented<DateStyle>
            label="Date style"
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
        <Switch label="Show snapo mark" checked={design.showLogo} onChange={(showLogo) => update({ showLogo })} />
      </section>

      <section className="panel-section" aria-labelledby="photo-style">
        <h3 id="photo-style" className="panel-subtitle">
          Photos
        </h3>
        <Slider
          label="Rounded corners"
          value={Math.round(design.photoRadius * 100)}
          min={0}
          max={30}
          onChange={(v) => update({ photoRadius: v / 100 }, { history: false })}
          format={(v) => (v === 0 ? 'Square' : `${v}%`)}
        />
        <Segmented<Design['photoOutline']>
          label="Photo border"
          value={design.photoOutline}
          onChange={(photoOutline) => update({ photoOutline })}
          options={[
            { value: 'frame', label: 'Theme' },
            { value: 'none', label: 'None' },
            { value: 'white', label: 'White' },
            { value: 'ink', label: 'Ink' },
          ]}
        />
      </section>
    </div>
  )
}
