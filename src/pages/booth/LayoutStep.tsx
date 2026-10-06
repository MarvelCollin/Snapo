import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { layouts, layoutGroups, layoutById, type LayoutGroup } from '../../lib/layouts'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { Tabs } from '../../components/ui/Tabs'
import { Button } from '../../components/ui/Button'
import { CompositionCanvas } from '../../components/CompositionCanvas'

export default function LayoutStep() {
  const navigate = useNavigate()
  const layoutId = useSession((s) => s.layoutId)
  const setLayout = useSession((s) => s.setLayout)
  const photos = useSession((s) => s.photos)
  const design = useDesign((s) => s.design)
  const [group, setGroup] = useState<LayoutGroup | 'all'>('all')
  const selected = layoutById(layoutId)

  const list = useMemo(() => (group === 'all' ? layouts : layouts.filter((l) => l.group === group)), [group])
  const thumbDesign = useMemo(() => ({ ...design, elements: [] }), [design])

  const tabs = layoutGroups.map((g) => ({
    id: g.id,
    label: g.label,
    count: g.id === 'all' ? layouts.length : layouts.filter((l) => l.group === g.id).length,
  }))

  return (
    <section className="step step--layout" aria-labelledby="layout-title">
      <header className="step__head">
        <h1 id="layout-title">Pick your strip</h1>
        <p className="step__lede">Every layout shows how many shots it needs. You can switch later and keep the photos you took.</p>
      </header>

      <Tabs label="Layout type" tabs={tabs} active={group} onChange={setGroup} idPrefix="layouts" variant="chunky" />

      <div id="layouts-panel" role="tabpanel" aria-labelledby={`layouts-tab-${group}`}>
        <ul className="layout-grid" aria-label="Layouts">
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
                    <CompositionCanvas layout={l} design={thumbDesign} photos={photos} displayHeight={168} displayWidth={176} label={`${l.name} preview`} />
                  </span>
                  <span className="layout-card__text">
                    <span className="layout-card__name">
                      {l.name}
                      {active && <CheckCircle weight="fill" size={20} aria-hidden="true" className="layout-card__check" />}
                    </span>
                    <span className="layout-card__meta">
                      {l.shots} {l.shots === 1 ? 'shot' : 'shots'}, {l.sizeLabel}
                    </span>
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
          <span>{selected.blurb}</span>
        </div>
        <Button variant="primary" size="lg" iconEnd={<ArrowRight weight="bold" size={20} />} onClick={() => navigate('/booth/shoot')}>
          Shoot {selected.shots} {selected.shots === 1 ? 'photo' : 'photos'}
        </Button>
      </div>
    </section>
  )
}
