import { useEffect } from 'react'
import { ArrowRight, CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { Layout } from '../../lib/layouts'
import type { Design } from '../../store/design'
import { useT } from '../../i18n'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { IconButton } from '../ui/IconButton'
import { LayoutThumb } from '../shared/LayoutThumb'

type Props = {
  layout: Layout | null
  design: Design | null
  photos: (string | null)[]
  meta: string
  blurb: string
  index: number
  total: number
  onStep: (dir: number) => void
  onUse: () => void
  onClose: () => void
}

export function TemplatePreview({ layout, design, photos, meta, blurb, index, total, onStep, onUse, onClose }: Props) {
  const t = useT()
  const open = !!layout && !!design

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onStep(-1)
      else if (e.key === 'ArrowRight') onStep(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onStep])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={layout?.name ?? ''}
      size="media"
      footer={
        <>
          <Button onClick={onClose}>{t.common.close}</Button>
          <Button variant="primary" iconEnd={<ArrowRight weight="bold" size={18} />} onClick={onUse}>
            {t.layout.useTemplate}
          </Button>
        </>
      }
    >
      {layout && design && (
        <div className="template-preview">
          <div className="template-preview__art" style={{ aspectRatio: String(layout.size.w / layout.size.h) }}>
            <LayoutThumb layout={layout} design={design} photos={photos} includeElements emptyLabel={false} inset={0} label={t.layout.preview(layout.name)} />
          </div>
          <div className="template-preview__info">
            <p className="template-preview__meta">{meta}</p>
            <p>{blurb}</p>
            <div className="template-preview__nav">
              <IconButton label={t.layout.prevTemplate} icon={<CaretLeft weight="bold" size={20} />} onClick={() => onStep(-1)} />
              <span aria-live="polite">{t.layout.position(index + 1, total)}</span>
              <IconButton label={t.layout.nextTemplate} icon={<CaretRight weight="bold" size={20} />} onClick={() => onStep(1)} />
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
}
