import { Check } from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { layoutById } from '../../lib/layouts'
import { useT } from '../../i18n'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { CompositionCanvas } from '../shared/CompositionCanvas'
import { toast } from '../../store/toasts'

type Props = { open: boolean; onClose: () => void }

export function PickDialog({ open, onClose }: Props) {
  const t = useT()
  const { layoutId, photos, takes, setPhotos } = useSession()
  const design = useDesign((s) => s.design)
  const layout = layoutById(layoutId)
  const filled = photos.filter(Boolean).length

  const toggle = (photo: string) => {
    const next = [...photos]
    const at = next.indexOf(photo)
    if (at >= 0) {
      next[at] = null
    } else {
      const empty = next.indexOf(null)
      if (empty < 0) {
        toast(t.pick.full)
        return
      }
      next[empty] = photo
    }
    setPhotos(next)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.pick.title(layout.shots)}
      size="media"
      footer={
        <>
          <Button onClick={() => setPhotos(photos.map(() => null))} disabled={!filled}>
            {t.pick.clear}
          </Button>
          <Button variant="primary" icon={<Check weight="bold" size={18} />} onClick={onClose}>
            {t.pick.done}
          </Button>
        </>
      }
    >
      <div className="pick">
        <div className="pick__main">
          <p className="pick__hint">{t.pick.hint}</p>
          <ul className="pick__grid" aria-label={t.pick.takes}>
            {takes.map((take, i) => {
              const spot = photos.indexOf(take.photo)
              const picked = spot >= 0
              return (
                <li key={take.id}>
                  <button
                    type="button"
                    className={`pick__take ${picked ? 'is-picked' : ''}`}
                    aria-pressed={picked}
                    aria-label={t.pick.take(i + 1, picked ? spot + 1 : null)}
                    onClick={() => toggle(take.photo)}
                  >
                    <img src={take.photo} alt="" />
                    {picked && (
                      <span className="pick__num" aria-hidden="true">
                        {spot + 1}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <aside className="pick__side" aria-label={t.pick.preview}>
          <CompositionCanvas layout={layout} design={{ ...design, elements: [], strokes: [] }} photos={photos} displayHeight={340} displayWidth={220} label={t.pick.preview} />
          <p className="pick__count" aria-live="polite">
            {t.pick.count(filled, layout.shots)}
          </p>
        </aside>
      </div>
    </Dialog>
  )
}
