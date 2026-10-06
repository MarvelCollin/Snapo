import { useEffect, useMemo, useState } from 'react'
import { Plus, Check } from '@phosphor-icons/react'
import { wordArt, wordStyles, type WordSpec, type WordStyle } from '../../lib/stickers'
import { captionFonts } from '../../lib/fonts'
import { useDesign } from '../../store/design'
import { TextField } from '../ui/TextField'
import { Button } from '../ui/Button'
import { SwatchPicker } from '../ui/SwatchPicker'
import { useAddElement } from '../../hooks/useAddElement'

const textColors = ['#ff8fab', '#ff6f91', '#e2445c', '#ffb385', '#ffd166', '#7bdcb5', '#62c6e8', '#8ec5ff', '#c08bff', '#ffffff', '#3b2230', '#bde0fe']

export function TextPanel() {
  const { design, selectedId, updateElement } = useDesign()
  const selected = design.elements.find((e) => e.id === selectedId)
  const editing = selected?.kind === 'word' ? selected : null
  const [spec, setSpec] = useState<WordSpec>({ text: 'so cute', style: 'bubble', color: '#ff8fab' })
  const { addWord } = useAddElement()

  useEffect(() => {
    if (editing) setSpec(editing.spec)
  }, [editing?.id])

  const preview = useMemo(() => (spec.text.trim() ? wordArt({ ...spec, text: spec.text.trim() }) : null), [spec])
  const set = (patch: Partial<WordSpec>) => {
    const next = { ...spec, ...patch }
    setSpec(next)
    if (editing && next.text.trim()) updateElement(editing.id, { spec: { ...next, text: next.text.trim() } })
  }

  return (
    <div className="panel-stack">
      <p className="panel-note">{editing ? 'Editing the selected text sticker. Changes show right away.' : 'Type anything and turn it into a sticker.'}</p>
      <TextField label="Text" value={spec.text} onChange={(text) => set({ text })} maxLength={32} hint={`${spec.text.length} of 32 characters`} />
      <div className="field">
        <span className="field__label" id="word-style">
          Style
        </span>
        <div role="radiogroup" aria-labelledby="word-style" className="chip-grid">
          {wordStyles.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={spec.style === s.id}
              className="font-chip"
              onClick={() => set({ style: s.id as WordStyle, font: undefined })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="field__label" id="word-font">
          Font
        </span>
        <div role="radiogroup" aria-labelledby="word-font" className="chip-grid">
          {captionFonts.map((f) => {
            const active = (spec.font ?? wordStyles.find((s) => s.id === spec.style)?.font) === f.id
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={active}
                className="font-chip"
                style={{ fontFamily: `"${f.family}"`, fontWeight: f.weight }}
                onClick={() => set({ font: f.id })}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>
      <SwatchPicker label="Color" value={spec.color} colors={textColors} onChange={(c) => c && set({ color: c })} />
      <div className="word-preview" aria-hidden={!preview}>
        {preview ? <img src={preview} alt={`Preview of ${spec.text}`} /> : <p className="panel-note">Type something to see a preview.</p>}
      </div>
      {editing ? (
        <Button variant="mint" icon={<Check weight="bold" size={18} />} block onClick={() => useDesign.getState().select(null)}>
          Done editing
        </Button>
      ) : (
        <Button variant="primary" icon={<Plus weight="bold" size={18} />} block disabled={!spec.text.trim()} onClick={() => addWord({ ...spec, text: spec.text.trim() })}>
          Add to strip
        </Button>
      )}
    </div>
  )
}
