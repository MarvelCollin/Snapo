import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ArrowCounterClockwise } from '@phosphor-icons/react'
import type { PhotoEdit } from '../../store/design'
import { cropFor } from '../../lib/render'
import { loadImage } from '../../lib/stickers'
import { useT } from '../../i18n'
import { Slider } from '../ui/Slider'
import { Button } from '../ui/Button'

type Props = {
  src: string
  aspect: number
  edit: PhotoEdit
  index: number
  onStart: () => void
  onChange: (patch: PhotoEdit) => void
}

const MIN = 1
const MAX = 4

export function CropEditor({ src, aspect, edit, index, onStart, onChange }: Props) {
  const t = useT()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [width, setWidth] = useState(0)
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)
  const zoom = edit.zoom ?? 1

  useEffect(() => {
    let alive = true
    loadImage(src).then((i) => {
      if (alive) setImg(i)
    })
    return () => {
      alive = false
    }
  }, [src])

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const region = (patch: PhotoEdit = {}) => {
    if (!img) return null
    return cropFor(img.naturalWidth, img.naturalHeight, aspect * 1000, 1000, { ...edit, ...patch })
  }

  const commit = (patch: PhotoEdit) => {
    const r = region(patch)
    if (!r) return
    onChange({ zoom: patch.zoom ?? zoom, cx: r.x + r.w / 2, cy: r.y + r.h / 2 })
  }

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !img || !width) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const W = Math.round(width * dpr)
    const H = Math.round(W / aspect)
    c.width = W
    c.height = H
    const r = cropFor(img.naturalWidth, img.naturalHeight, W, H, edit)
    c.getContext('2d')!.drawImage(img, r.x * img.naturalWidth, r.y * img.naturalHeight, r.w * img.naturalWidth, r.h * img.naturalHeight, 0, 0, W, H)
  }, [img, width, aspect, edit])

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const next = Math.min(MAX, Math.max(MIN, zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)))
      commit({ zoom: next })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  })

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const r = region()
    if (!r) return
    e.currentTarget.setPointerCapture(e.pointerId)
    onStart()
    drag.current = { x: e.clientX, y: e.clientY, cx: r.x + r.w / 2, cy: r.y + r.h / 2 }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const r = region()
    const box = boxRef.current
    if (!d || !r || !box) return
    const rect = box.getBoundingClientRect()
    commit({ cx: d.cx - ((e.clientX - d.x) / rect.width) * r.w, cy: d.cy - ((e.clientY - d.y) / rect.height) * r.h })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const r = region()
    if (!r) return
    const step = e.shiftKey ? 0.12 : 0.04
    const cx = r.x + r.w / 2
    const cy = r.y + r.h / 2
    const moves: Record<string, PhotoEdit> = {
      ArrowLeft: { cx: cx - r.w * step },
      ArrowRight: { cx: cx + r.w * step },
      ArrowUp: { cy: cy - r.h * step },
      ArrowDown: { cy: cy + r.h * step },
      '+': { zoom: Math.min(MAX, zoom * 1.1) },
      '=': { zoom: Math.min(MAX, zoom * 1.1) },
      '-': { zoom: Math.max(MIN, zoom / 1.1) },
    }
    if (e.key in moves) {
      e.preventDefault()
      onStart()
      commit(moves[e.key])
    } else if (e.key === '0') {
      e.preventDefault()
      onStart()
      onChange({ zoom: 1, cx: 0.5, cy: 0.5 })
    }
  }

  return (
    <div className="crop">
      <p className="field__hint">{t.edit.cropHint}</p>
      <div
        ref={boxRef}
        className="crop__view"
        style={{ aspectRatio: String(aspect) }}
        role="group"
        tabIndex={0}
        aria-label={t.edit.cropArea(index + 1)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={onKeyDown}
      >
        {img ? <canvas ref={canvasRef} aria-hidden="true" /> : <span className="skeleton crop__skeleton" />}
        <span className="crop__grid" aria-hidden="true" />
      </div>
      <Slider
        label={t.edit.zoom}
        value={Math.round(zoom * 100)}
        min={MIN * 100}
        max={MAX * 100}
        step={5}
        onChange={(v) => commit({ zoom: v / 100 })}
        format={(v) => `${v}%`}
      />
      <Button
        icon={<ArrowCounterClockwise weight="bold" size={18} />}
        disabled={zoom === 1 && (edit.cx ?? 0.5) === 0.5 && (edit.cy ?? 0.5) === 0.5}
        onClick={() => {
          onStart()
          onChange({ zoom: 1, cx: 0.5, cy: 0.5 })
        }}
      >
        {t.edit.reset}
      </Button>
    </div>
  )
}
