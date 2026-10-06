import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Drop, FrameCorners, Smiley, TextAa, SlidersHorizontal } from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { layoutById } from '../../lib/layouts'
import { useImageThumbs } from '../../hooks/useFilterThumbs'
import { useT } from '../../i18n'
import { Stage } from '../../components/decorate/Stage'
import { ElementToolbar } from '../../components/decorate/ElementToolbar'
import { FramePanel } from '../../components/decorate/FramePanel'
import { StickerPanel } from '../../components/decorate/StickerPanel'
import { TextPanel } from '../../components/decorate/TextPanel'
import { StylePanel } from '../../components/decorate/StylePanel'
import { FilterPicker } from '../../components/shared/FilterPicker'
import { Tabs } from '../../components/ui/Tabs'
import { Button } from '../../components/ui/Button'
import { Slider } from '../../components/ui/Slider'

type Panel = 'frames' | 'filters' | 'stickers' | 'text' | 'style'

const icons: Record<Panel, ReactNode> = {
  frames: <FrameCorners weight="bold" size={18} aria-hidden="true" />,
  filters: <Drop weight="bold" size={18} aria-hidden="true" />,
  stickers: <Smiley weight="bold" size={18} aria-hidden="true" />,
  text: <TextAa weight="bold" size={18} aria-hidden="true" />,
  style: <SlidersHorizontal weight="bold" size={18} aria-hidden="true" />,
}

const order: Panel[] = ['frames', 'filters', 'stickers', 'text', 'style']

export default function DecorateStep() {
  const t = useT()
  const navigate = useNavigate()
  const layoutId = useSession((s) => s.layoutId)
  const photos = useSession((s) => s.photos)
  const design = useDesign((s) => s.design)
  const update = useDesign((s) => s.update)
  const selectedId = useDesign((s) => s.selectedId)
  const [panel, setPanel] = useState<Panel>('frames')
  const layout = layoutById(layoutId)
  const complete = photos.length === layout.shots && photos.every(Boolean)
  const thumbs = useImageThumbs(photos[0] ?? null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) useDesign.getState().redo()
        else useDesign.getState().undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        useDesign.getState().redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const sel = design.elements.find((e) => e.id === selectedId)
    if (sel?.kind === 'word') setPanel('text')
  }, [selectedId])

  if (!complete) return <Navigate to="/booth/shoot" replace />

  const tabs = order.map((id) => ({ id, label: t.decorate.tabs[id], icon: icons[id] }))

  return (
    <section className="step step--decorate" aria-labelledby="decorate-title">
      <header className="step__head step__head--row">
        <div>
          <h1 id="decorate-title">{t.decorate.title}</h1>
          <p className="step__lede">{t.decorate.lede}</p>
        </div>
        <div className="step__actions">
          <Button variant="ghost" icon={<ArrowLeft weight="bold" size={18} />} onClick={() => navigate('/booth/shoot')}>
            {t.decorate.shots}
          </Button>
          <Button variant="primary" size="lg" iconEnd={<ArrowRight weight="bold" size={20} />} onClick={() => navigate('/booth/save')}>
            {t.decorate.finish}
          </Button>
        </div>
      </header>

      <div className="decorate">
        <div className="decorate__stage">
          <ElementToolbar />
          <Stage layout={layout} photos={photos} />
        </div>

        <aside className="decorate__panel" aria-label={t.decorate.tools}>
          <Tabs label={t.decorate.tools} tabs={tabs} active={panel} onChange={setPanel} idPrefix="tools" variant="chunky" />
          <div id="tools-panel" role="tabpanel" aria-labelledby={`tools-tab-${panel}`} className="decorate__body" tabIndex={0}>
            {panel === 'frames' && <FramePanel />}
            {panel === 'filters' && (
              <div className="panel-stack">
                <Slider
                  label={t.look.strength}
                  value={Math.round(design.strength * 100)}
                  onChange={(v) => update({ strength: v / 100 }, { history: false })}
                  format={(v) => `${v}%`}
                />
                <FilterPicker value={design.filterId} onChange={(id) => update({ filterId: id })} thumbs={thumbs} idPrefix="deco-filters" />
              </div>
            )}
            {panel === 'stickers' && <StickerPanel />}
            {panel === 'text' && <TextPanel />}
            {panel === 'style' && <StylePanel />}
          </div>
        </aside>
      </div>
    </section>
  )
}
