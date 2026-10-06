import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Drop, FrameCorners, Smiley, TextAa, SlidersHorizontal } from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { layoutById } from '../../lib/layouts'
import { useImageThumbs } from '../../hooks/useFilterThumbs'
import { Stage } from '../../components/decorate/Stage'
import { ElementToolbar } from '../../components/decorate/ElementToolbar'
import { FramePanel } from '../../components/decorate/FramePanel'
import { StickerPanel } from '../../components/decorate/StickerPanel'
import { TextPanel } from '../../components/decorate/TextPanel'
import { StylePanel } from '../../components/decorate/StylePanel'
import { FilterPicker } from '../../components/FilterPicker'
import { Tabs } from '../../components/ui/Tabs'
import { Button } from '../../components/ui/Button'
import { Slider } from '../../components/ui/Slider'

type Panel = 'frames' | 'filters' | 'stickers' | 'text' | 'style'

const tabs = [
  { id: 'frames' as const, label: 'Frames', icon: <FrameCorners weight="bold" size={18} aria-hidden="true" /> },
  { id: 'filters' as const, label: 'Filters', icon: <Drop weight="bold" size={18} aria-hidden="true" /> },
  { id: 'stickers' as const, label: 'Stickers', icon: <Smiley weight="bold" size={18} aria-hidden="true" /> },
  { id: 'text' as const, label: 'Text', icon: <TextAa weight="bold" size={18} aria-hidden="true" /> },
  { id: 'style' as const, label: 'Caption', icon: <SlidersHorizontal weight="bold" size={18} aria-hidden="true" /> },
]

export default function DecorateStep() {
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
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, [contenteditable="true"]')) return
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

  return (
    <section className="step step--decorate" aria-labelledby="decorate-title">
      <header className="step__head step__head--row">
        <div>
          <h1 id="decorate-title">Make it cute</h1>
          <p className="step__lede">Frames, filters, stickers and a caption. Everything saves as you go.</p>
        </div>
        <div className="step__actions">
          <Button variant="ghost" icon={<ArrowLeft weight="bold" size={18} />} onClick={() => navigate('/booth/shoot')}>
            Shots
          </Button>
          <Button variant="primary" size="lg" iconEnd={<ArrowRight weight="bold" size={20} />} onClick={() => navigate('/booth/save')}>
            Finish
          </Button>
        </div>
      </header>

      <div className="decorate">
        <div className="decorate__stage">
          <ElementToolbar />
          <Stage layout={layout} photos={photos} />
        </div>

        <aside className="decorate__panel" aria-label="Decorate tools">
          <Tabs label="Decorate tools" tabs={tabs} active={panel} onChange={setPanel} idPrefix="tools" variant="chunky" />
          <div id="tools-panel" role="tabpanel" aria-labelledby={`tools-tab-${panel}`} className="decorate__body" tabIndex={0}>
            {panel === 'frames' && <FramePanel />}
            {panel === 'filters' && (
              <div className="panel-stack">
                <Slider
                  label="Filter strength"
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
