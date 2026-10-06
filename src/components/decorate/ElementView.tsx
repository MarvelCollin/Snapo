import { useRef, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { ArrowsClockwise, X } from '@phosphor-icons/react'
import { useDesign, type CanvasEl } from '../../store/design'
import { useElementArt } from '../../hooks/useElementArt'
import { useElementName } from '../../hooks/useElementName'

type Props = {
  el: CanvasEl
  stageRef: RefObject<HTMLDivElement | null>
  selected: boolean
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function ElementView({ el, stageRef, selected }: Props) {
  const elementName = useElementName()
  const { select, updateElement, checkpoint, removeElement, duplicateElement } = useDesign()
  const src = useElementArt(el)
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null)
  const spin = useRef<{ cx: number; cy: number; a: number; d: number; rot: number; w: number } | null>(null)

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    select(el.id)
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, x: el.x, y: el.y, moved: false }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const stage = stageRef.current
    if (!d || !stage) return
    const dx = e.clientX - d.px
    const dy = e.clientY - d.py
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 4) return
      d.moved = true
      checkpoint()
    }
    const rect = stage.getBoundingClientRect()
    updateElement(el.id, { x: clamp(d.x + dx / rect.width, 0, 1), y: clamp(d.y + dy / rect.height, 0, 1) }, { history: false })
  }

  const onPointerUp = () => {
    drag.current = null
  }

  const onHandleDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const cx = rect.left + el.x * rect.width
    const cy = rect.top + el.y * rect.height
    e.currentTarget.setPointerCapture(e.pointerId)
    checkpoint()
    spin.current = { cx, cy, a: Math.atan2(e.clientY - cy, e.clientX - cx), d: Math.hypot(e.clientX - cx, e.clientY - cy), rot: el.rot, w: el.w }
  }

  const onHandleMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = spin.current
    if (!s) return
    const a = Math.atan2(e.clientY - s.cy, e.clientX - s.cx)
    const d = Math.hypot(e.clientX - s.cx, e.clientY - s.cy)
    let rot = s.rot + ((a - s.a) * 180) / Math.PI
    if (e.shiftKey) rot = Math.round(rot / 15) * 15
    updateElement(el.id, { rot: Math.round(rot * 10) / 10, w: clamp(s.w * (d / Math.max(1, s.d)), 0.04, 1.6) }, { history: false })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.05 : 0.01
    const keys: Record<string, Partial<CanvasEl>> = {
      ArrowLeft: { x: clamp(el.x - step, 0, 1) },
      ArrowRight: { x: clamp(el.x + step, 0, 1) },
      ArrowUp: { y: clamp(el.y - step, 0, 1) },
      ArrowDown: { y: clamp(el.y + step, 0, 1) },
      '+': { w: clamp(el.w * 1.1, 0.04, 1.6) },
      '=': { w: clamp(el.w * 1.1, 0.04, 1.6) },
      '-': { w: clamp(el.w / 1.1, 0.04, 1.6) },
      ']': { rot: el.rot + (e.shiftKey ? 15 : 5) },
      '[': { rot: el.rot - (e.shiftKey ? 15 : 5) },
    }
    if (e.key in keys) {
      e.preventDefault()
      updateElement(el.id, keys[e.key])
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      removeElement(el.id)
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault()
      duplicateElement(el.id)
    } else if (e.key === 'Escape') {
      select(null)
    }
  }

  return (
    <div
      className={`el ${selected ? 'is-selected' : ''}`}
      style={{
        left: `${el.x * 100}%`,
        top: `${el.y * 100}%`,
        width: `${el.w * 100}%`,
        transform: `translate(-50%, -50%) rotate(${el.rot}deg)`,
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${elementName(el)}. Arrow keys move, plus and minus resize, brackets rotate, Delete removes`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onFocus={() => select(el.id)}
      onKeyDown={onKeyDown}
    >
      {src ? (
        <img src={src} alt="" draggable={false} style={{ transform: el.flip ? 'scaleX(-1)' : undefined }} />
      ) : (
        <span className="el__loading" />
      )}
      {selected && (
        <>
          <span className="el__box" aria-hidden="true" />
          <button
            type="button"
            className="el__handle el__handle--remove"
            aria-label="Remove"
            tabIndex={-1}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              removeElement(el.id)
            }}
          >
            <X weight="bold" size={14} />
          </button>
          <button
            type="button"
            className="el__handle el__handle--spin"
            aria-label="Drag to resize and rotate"
            tabIndex={-1}
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={() => (spin.current = null)}
            onPointerCancel={() => (spin.current = null)}
          >
            <ArrowsClockwise weight="bold" size={14} />
          </button>
        </>
      )}
    </div>
  )
}
