import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CaretLeft, CaretRight, Check, PencilSimple, Sparkle } from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { layoutById } from '../../lib/layouts'
import { photoKey } from '../../lib/photos'
import { useImageThumbs } from '../../hooks/useFilterThumbs'
import { useFitBox } from '../../hooks/useFitBox'
import { toast } from '../../store/toasts'
import { useT } from '../../i18n'
import { CompositionCanvas } from '../../components/shared/CompositionCanvas'
import { FilterPicker } from '../../components/shared/FilterPicker'
import { BackdropPicker } from '../../components/shared/BackdropPicker'
import { BeautySlider } from '../../components/shared/BeautySlider'
import { CropEditor } from '../../components/edit/CropEditor'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Segmented } from '../../components/ui/Segmented'
import { Slider } from '../../components/ui/Slider'

type Tool = 'crop' | 'filter'

export default function EditStep() {
  const t = useT()
  const navigate = useNavigate()
  const layoutId = useSession((s) => s.layoutId)
  const photos = useSession((s) => s.photos)
  const design = useDesign((s) => s.design)
  const update = useDesign((s) => s.update)
  const editPhoto = useDesign((s) => s.editPhoto)
  const setFilterForAll = useDesign((s) => s.setFilterForAll)
  const checkpoint = useDesign((s) => s.checkpoint)
  const layout = layoutById(layoutId)
  const complete = photos.length === layout.shots && photos.every(Boolean)
  const [selected, setSelected] = useState<number | null>(null)
  const [tool, setTool] = useState<Tool>('crop')
  const src = selected !== null ? photos[selected] : null
  const thumbs = useImageThumbs(src ?? photos[0] ?? null)
  const fit = useFitBox(layout.size.w / layout.size.h)

  if (!complete) return <Navigate to="/booth/shoot" replace />

  const key = src ? photoKey(src) : null
  const edit = key ? (design.edits[key] ?? {}) : {}
  const slotFor = (i: number) => layout.slots.find((s) => s.photo === i) ?? layout.slots[0]
  const step = (dir: number) => setSelected((i) => ((i ?? 0) + dir + layout.shots) % layout.shots)

  return (
    <section className="step step--edit" aria-labelledby="edit-title">
      <header className="step__head step__head--row">
        <div>
          <h1 id="edit-title">{t.edit.title}</h1>
          <p className="step__lede">{t.edit.lede}</p>
        </div>
        <div className="step__actions">
          <Button variant="ghost" icon={<ArrowLeft weight="bold" size={18} />} onClick={() => navigate('/booth/shoot')}>
            {t.edit.back}
          </Button>
          <Button icon={<Sparkle weight="bold" size={18} />} onClick={() => navigate('/booth/decorate')}>
            {t.edit.decorate}
          </Button>
          <Button variant="primary" size="lg" iconEnd={<ArrowRight weight="bold" size={20} />} onClick={() => navigate('/booth/save')}>
            {t.edit.finish}
          </Button>
        </div>
      </header>

      <div className="edit">
        <div ref={fit.ref} className="edit__stage">
          <div className="edit__strip" style={{ width: fit.w, height: fit.h }}>
            <CompositionCanvas layout={layout} design={design} photos={photos} includeElements displayWidth={fit.w} label={t.edit.stage} />
            {layout.slots.map((slot, i) => {
              const active = selected === slot.photo
              return (
                <button
                  key={i}
                  type="button"
                  className={`edit__spot ${active ? 'is-active' : ''}`}
                  style={{
                    left: `${(slot.x / layout.size.w) * 100}%`,
                    top: `${(slot.y / layout.size.h) * 100}%`,
                    width: `${(slot.w / layout.size.w) * 100}%`,
                    height: `${(slot.h / layout.size.h) * 100}%`,
                    transform: slot.rotate ? `rotate(${slot.rotate}deg)` : undefined,
                  }}
                  aria-pressed={active}
                  aria-label={t.edit.editPhoto(slot.photo + 1)}
                  onClick={() => setSelected(active ? null : slot.photo)}
                >
                  <span className="edit__spot-tag" aria-hidden="true">
                    <PencilSimple weight="bold" size={14} />
                    {slot.photo + 1}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="edit__panel" aria-label={src ? t.edit.photo((selected ?? 0) + 1) : t.edit.all}>
          {src && selected !== null && key ? (
            <div className="panel-stack">
              <div className="edit__panel-head">
                <IconButton label={t.edit.prev} tone="plain" icon={<CaretLeft weight="bold" size={20} />} onClick={() => step(-1)} />
                <h2 className="panel-subtitle">{t.edit.photo(selected + 1)}</h2>
                <IconButton label={t.edit.next} tone="plain" icon={<CaretRight weight="bold" size={20} />} onClick={() => step(1)} />
                <Button variant="mint" size="sm" icon={<Check weight="bold" size={16} />} onClick={() => setSelected(null)}>
                  {t.edit.done}
                </Button>
              </div>
              <Segmented<Tool>
                label={t.edit.tool}
                hideLabel
                value={tool}
                onChange={setTool}
                options={[
                  { value: 'crop', label: t.edit.crop },
                  { value: 'filter', label: t.edit.filter },
                ]}
              />
              {tool === 'crop' ? (
                <CropEditor
                  key={key}
                  src={src}
                  aspect={slotFor(selected).w / slotFor(selected).h}
                  edit={edit}
                  index={selected}
                  onStart={checkpoint}
                  onChange={(patch) => editPhoto(key, patch, { history: false })}
                />
              ) : (
                <div className="panel-stack panel-stack--tight">
                  <FilterPicker value={edit.filterId ?? design.filterId} onChange={(id) => editPhoto(key, { filterId: id })} thumbs={thumbs} idPrefix="photo-filters" />
                  <Button
                    block
                    onClick={() => {
                      setFilterForAll(edit.filterId ?? design.filterId)
                      toast(t.edit.appliedAll)
                    }}
                  >
                    {t.edit.useForAll}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="panel-stack">
              <p className="edit__hint">
                <PencilSimple weight="bold" size={18} aria-hidden="true" />
                {t.edit.hint}
              </p>
              <section className="panel-section" aria-labelledby="edit-all-filter">
                <h2 id="edit-all-filter" className="panel-subtitle">
                  {t.edit.allFilter}
                </h2>
                <Slider
                  label={t.look.strength}
                  value={Math.round(design.strength * 100)}
                  onChange={(v) => update({ strength: v / 100 }, { history: false })}
                  format={(v) => `${v}%`}
                />
                <FilterPicker value={design.filterId} onChange={setFilterForAll} thumbs={thumbs} idPrefix="all-filters" />
              </section>
              <section className="panel-section" aria-labelledby="edit-retouch">
                <h2 id="edit-retouch" className="visually-hidden">
                  {t.look.beauty}
                </h2>
                <BeautySlider value={design.beauty} onChange={(beauty) => update({ beauty }, { history: false })} />
              </section>
              <section className="panel-section" aria-labelledby="edit-backdrop">
                <h2 id="edit-backdrop" className="panel-subtitle">
                  {t.look.backdrop}
                </h2>
                <BackdropPicker value={design.backdropId} onChange={(id) => update({ backdropId: id })} />
              </section>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
