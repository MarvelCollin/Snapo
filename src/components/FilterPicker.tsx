import { useMemo, useState } from 'react'
import { filters, filterGroups, type FilterGroup } from '../lib/filters'
import { Tabs } from './ui/Tabs'

type Props = {
  value: string
  onChange: (id: string) => void
  thumbs: Record<string, string>
  variant?: 'rail' | 'grid'
  idPrefix: string
}

export function FilterPicker({ value, onChange, thumbs, variant = 'grid', idPrefix }: Props) {
  const [group, setGroup] = useState<FilterGroup | 'all'>('all')
  const list = useMemo(() => (group === 'all' ? filters : filters.filter((f) => f.group === group)), [group])

  return (
    <div className={`filter-picker filter-picker--${variant}`}>
      <Tabs label="Filter mood" tabs={filterGroups.map((g) => ({ id: g.id, label: g.label }))} active={group} onChange={setGroup} idPrefix={idPrefix} />
      <div id={`${idPrefix}-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${group}`} className="filter-picker__scroll">
        <div role="radiogroup" aria-label="Filters" className="filter-picker__list">
          {list.map((f) => {
            const active = f.id === value
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`filter-chip ${active ? 'is-active' : ''}`}
                onClick={() => onChange(f.id)}
              >
                <span className="filter-chip__img">
                  {thumbs[f.id] ? <img src={thumbs[f.id]} alt="" width={96} height={112} /> : <span className="skeleton filter-chip__skeleton" />}
                </span>
                <span className="filter-chip__name">{f.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
