import { useMemo, useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, Trash, UploadSimple } from '@phosphor-icons/react'
import { layouts, layoutGroups, layoutById, type Layout, type LayoutGroup } from '../../lib/layouts'
import { FrameError, frameLayout, readFrame } from '../../lib/frameUpload'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { useCustomFrames } from '../../store/customFrames'
import { useT } from '../../i18n'
import { Tabs } from '../../components/ui/Tabs'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { CompositionCanvas } from '../../components/shared/CompositionCanvas'
import { toast } from '../../store/toasts'

export default function LayoutStep() {
  const t = useT()
  const navigate = useNavigate()
  const layoutId = useSession((s) => s.layoutId)
  const setLayout = useSession((s) => s.setLayout)
  const photos = useSession((s) => s.photos)
  const design = useDesign((s) => s.design)
  const frames = useCustomFrames((s) => s.frames)
  const [group, setGroup] = useState<LayoutGroup | 'all'>('all')
  const [reading, setReading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const selected = layoutById(layoutId)

  const mine = useMemo(() => frames.map(frameLayout), [frames])
  const all = useMemo(() => [...layouts, ...mine], [mine])
  const list = useMemo(() => (group === 'all' ? all : all.filter((l) => l.group === group)), [group, all])
  const thumbDesign = useMemo(() => ({ ...design, elements: [], strokes: [] }), [design])

  const tabs = layoutGroups.map((id) => ({
    id,
    label: t.layout.groups[id],
    count: id === 'all' ? all.length : all.filter((l) => l.group === id).length,
  }))

  const blurb = (l: Layout) => {
    if (l.group !== 'mine') return t.layout.blurbs[l.id] ?? ''
    const twin = l.slots.length > l.shots
    return twin ? t.layout.custom.twinBlurb(l.shots) : t.layout.custom.blurb(l.shots)
  }

  const upload = async (file: File | undefined) => {
    if (!file || reading) return
    setReading(true)
    try {
      const frame = await readFrame(file)
      useCustomFrames.getState().add(frame)
      setLayout(`custom-${frame.id}`)
      toast(t.layout.custom.added(frame.name, frame.slots.length))
    } catch (err) {
      const e = err instanceof FrameError ? err : null
      const msg = e?.code === 'noHoles' ? t.layout.custom.noHoles : e?.code === 'tooMany' ? t.layout.custom.tooMany(e.count) : t.layout.custom.notImage
      toast(msg, { tone: 'error' }, 7000)
    } finally {
      setReading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const remove = (l: Layout) => {
    const id = l.id.replace(/^custom-/, '')
    const removed = useCustomFrames.getState().remove(id)
    const wasActive = layoutId === l.id
    if (wasActive) setLayout('classic-4')
    toast(t.layout.custom.removed(l.name), {
      actionLabel: t.common.undo,
      onAction: () => {
        if (!removed) return
        useCustomFrames.getState().restore(removed)
        if (wasActive) setLayout(l.id)
      },
    })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    upload(e.dataTransfer.files[0])
  }

  return (
    <section className="step step--layout" aria-labelledby="layout-title">
      <header className="step__head">
        <h1 id="layout-title">{t.layout.title}</h1>
        <p className="step__lede">{t.layout.lede}</p>
      </header>

      <Tabs label={t.layout.typeLabel} tabs={tabs} active={group} onChange={setGroup} idPrefix="layouts" variant="chunky" />

      <div id="layouts-panel" role="tabpanel" aria-labelledby={`layouts-tab-${group}`}>
        {group === 'mine' && <p className="panel-note layout-howto">{mine.length ? t.layout.custom.howTo : `${t.layout.custom.empty} ${t.layout.custom.howTo}`}</p>}
        <ul className="layout-grid" aria-label={t.layout.layouts}>
          {group === 'mine' && (
            <li>
              <button
                type="button"
                className={`layout-card upload-card ${dragging ? 'is-dragging' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                aria-busy={reading || undefined}
                disabled={reading}
              >
                <span className="layout-card__art upload-card__art">
                  {reading ? <span className="btn__spinner" aria-hidden="true" /> : <UploadSimple weight="bold" size={32} aria-hidden="true" />}
                </span>
                <span className="layout-card__text">
                  <span className="layout-card__name">{reading ? t.layout.custom.reading : t.layout.custom.upload}</span>
                  <span className="layout-card__meta">{t.layout.custom.uploadText}</span>
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/webp,image/*"
                className="visually-hidden"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => upload(e.target.files?.[0])}
              />
            </li>
          )}
          {list.map((l) => {
            const active = l.id === layoutId
            const own = l.group === 'mine'
            return (
              <li key={l.id} className={own ? 'layout-item--own' : undefined}>
                <button
                  type="button"
                  className={`layout-card ${active ? 'is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => setLayout(l.id)}
                  onDoubleClick={() => {
                    setLayout(l.id)
                    navigate('/booth/shoot')
                  }}
                >
                  <span className="layout-card__art">
                    <CompositionCanvas layout={l} design={thumbDesign} photos={photos} displayHeight={168} displayWidth={176} label={t.layout.preview(l.name)} />
                  </span>
                  <span className="layout-card__text">
                    <span className="layout-card__name">
                      {l.name}
                      {active && <CheckCircle weight="fill" size={20} aria-hidden="true" className="layout-card__check" />}
                    </span>
                    <span className="layout-card__meta">{t.layout.meta(l.shots, own ? t.layout.custom.sizeLabel : l.sizeLabel)}</span>
                  </span>
                </button>
                {own && <IconButton className="layout-card__remove" label={t.layout.custom.remove(l.name)} tone="danger" size="sm" icon={<Trash weight="bold" size={16} />} onClick={() => remove(l)} />}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="action-bar">
        <div className="action-bar__info">
          <strong>{selected.name}</strong>
          <span>{blurb(selected)}</span>
        </div>
        <Button variant="primary" size="lg" iconEnd={<ArrowRight weight="bold" size={20} />} onClick={() => navigate('/booth/shoot')}>
          {t.layout.shoot(selected.shots)}
        </Button>
      </div>
    </section>
  )
}
