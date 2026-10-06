import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, FrameCorners, Smiley, TextAa, SlidersHorizontal, PaintBrush } from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { layoutById } from '../../lib/layouts'
import { useT } from '../../i18n'
import { Stage } from '../../components/decorate/Stage'
import { ElementToolbar } from '../../components/decorate/ElementToolbar'
import { FramePanel } from '../../components/decorate/FramePanel'
import { StickerPanel } from '../../components/decorate/StickerPanel'
import { TextPanel } from '../../components/decorate/TextPanel'
import { StylePanel } from '../../components/decorate/StylePanel'
import { DrawPanel } from '../../components/decorate/DrawPanel'
import { Tabs } from '../../components/ui/Tabs'
import { Button } from '../../components/ui/Button'

type Panel = 'frames' | 'stickers' | 'text' | 'draw' | 'style'

const icons: Record<Panel, ReactNode> = {
  frames: <FrameCorners weight="bold" size={18} aria-hidden="true" />,
  stickers: <Smiley weight="bold" size={18} aria-hidden="true" />,
  text: <TextAa weight="bold" size={18} aria-hidden="true" />,
  draw: <PaintBrush weight="bold" size={18} aria-hidden="true" />,
  style: <SlidersHorizontal weight="bold" size={18} aria-hidden="true" />,
}

const order: Panel[] = ['frames', 'stickers', 'text', 'draw', 'style']

export default function DecorateStep() {
  const t = useT()
  const navigate = useNavigate()
  const layoutId = useSession((s) => s.layoutId)
  const photos = useSession((s) => s.photos)
  const design = useDesign((s) => s.design)
  const selectedId = useDesign((s) => s.selectedId)
  const [panel, setPanel] = useState<Panel>('frames')
  const layout = layoutById(layoutId)
  const complete = photos.length === layout.shots && photos.every(Boolean)

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
          <Button variant="ghost" icon={<ArrowLeft weight="bold" size={18} />} onClick={() => navigate('/booth/edit')}>
            {t.decorate.shots}
          </Button>
          <Button variant="primary" size="lg" iconEnd={<ArrowRight weight="bold" size={20} />} onClick={() => navigate('/booth/save')}>
            {t.decorate.finish}
          </Button>
        </div>
      </header>

      <div className="decorate">
        <div className="decorate__stage">
          <ElementToolbar drawing={panel === 'draw'} />
          <Stage layout={layout} photos={photos} drawing={panel === 'draw'} />
        </div>

        <aside className="decorate__panel" aria-label={t.decorate.tools}>
          <Tabs label={t.decorate.tools} tabs={tabs} active={panel} onChange={setPanel} idPrefix="tools" variant="chunky" />
          <div id="tools-panel" role="tabpanel" aria-labelledby={`tools-tab-${panel}`} className="decorate__body" tabIndex={0}>
            {panel === 'frames' && <FramePanel />}
            {panel === 'stickers' && <StickerPanel />}
            {panel === 'text' && <TextPanel />}
            {panel === 'draw' && <DrawPanel />}
            {panel === 'style' && <StylePanel />}
          </div>
        </aside>
      </div>
    </section>
  )
}
