import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { layouts, layoutGroups, layoutById, type LayoutGroup } from '../../lib/layouts'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { useT } from '../../i18n'
import { Tabs } from '../../components/ui/Tabs'
import { Button } from '../../components/ui/Button'
import { CompositionCanvas } from '../../components/shared/CompositionCanvas'

export default function LayoutStep() {
  const t = useT()
  const navigate = useNavigate()
  const layoutId = useSession((s) => s.layoutId)
  const setLayout = useSession((s) => s.setLayout)
  const photos = useSession((s) => s.photos)
  const design = useDesign((s) => s.design)
  const [group, setGroup] = useState<LayoutGroup | 'all'>('all')
  const selected = layoutById(layoutId)

  const list = useMemo(() => (group === 'all' ? layouts : layouts.filter((l) => l.group === group)), [group])
  const thumbDesign = useMemo(() => ({ ...design, elements: [] }), [design])

  const tabs = layoutGroups.map((id) => ({
    id,
    label: t.layout.groups[id],
    count: id === 'all' ? layouts.length : layouts.filter((l) => l.group === id).length,
  }))

  return (
    <section className="step step--layout" aria-labelledby="layout-title">
      <header className="step__head">
        <h1 id="layout-title">{t.layout.title}</h1>
        <p className="step__lede">{t.layout.lede}</p>
      </header>

      <Tabs label={t.layout.typeLabel} tabs={tabs} active={group} onChange={setGroup} idPrefix="layouts" variant="chunky" />

      <div id="layouts-panel" role="tabpanel" aria-labelledby={`layouts-tab-${group}`}>
        <ul className="layout-grid" aria-label={t.layout.layouts}>
          {list.map((l) => {
            const active = l.id === layoutId
            return (
              <li key={l.id}>
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
                    <span className="layout-card__meta">{t.layout.meta(l.shots, l.sizeLabel)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="action-bar">
        <div className="action-bar__info">
          <strong>{selected.name}</strong>
          <span>{t.layout.blurbs[selected.id] ?? ''}</span>
        </div>
        <Button variant="primary" size="lg" iconEnd={<ArrowRight weight="bold" size={20} />} onClick={() => navigate('/booth/shoot')}>
          {t.layout.shoot(selected.shots)}
        </Button>
      </div>
    </section>
  )
}
