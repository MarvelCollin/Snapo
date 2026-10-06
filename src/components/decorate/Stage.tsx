import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { Layout } from '../../lib/layouts'
import { useDesign, uid } from '../../store/design'
import { drawStroke, drawStrokes, penSize, strokeDistance, type Stroke } from '../../lib/doodle'
import { useDrawTool } from '../../store/drawTool'
import { useT } from '../../i18n'
import { CompositionCanvas } from '../shared/CompositionCanvas'
import { ElementView } from './ElementView'

type Props = {
  layout: Layout
  photos: (string | null)[]
  drawing?: boolean
}

function DoodleLayer({ w, h, active }: { w: number; h: number; active: boolean }) {
  const t = useT()
  const strokes = useDesign((s) => s.design.strokes)
  const ref = useRef<HTMLCanvasElement>(null)
  const live = useRef<Stroke | null>(null)
  const erasing = useRef(false)
  const raf = useRef(0)
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const W = Math.round(w * dpr)
  const H = Math.round(h * dpr)

  const redraw = () => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    drawStrokes(ctx, useDesign.getState().design.strokes, c.width, c.height)
    if (live.current) drawStroke(ctx, live.current, c.width, c.height)
  }

  useEffect(redraw, [strokes, W, H])

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return [Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)), Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))]
  }

  const eraseAt = (e: PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = point(e)
    const { design, removeStrokes } = useDesign.getState()
    const hits = design.strokes.filter((s) => strokeDistance(s, x * W, y * H, W, H) < (s.size * W) / 2 + 10 * dpr).map((s) => s.id)
    if (hits.length) removeStrokes(hits, { history: false })
  }

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!active || e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const tool = useDrawTool.getState()
    if (tool.mode === 'erase') {
      useDesign.getState().checkpoint()
      erasing.current = true
      eraseAt(e)
      return
    }
    const [x, y] = point(e)
    live.current = { id: uid(), pen: tool.pen, color: tool.color, size: penSize(tool.size), points: [x, y] }
    redraw()
  }

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (erasing.current) {
      eraseAt(e)
      return
    }
    const s = live.current
    if (!s) return
    const [x, y] = point(e)
    const px = s.points[s.points.length - 2]
    const py = s.points[s.points.length - 1]
    if (Math.hypot((x - px) * w, (y - py) * h) < 2) return
    s.points.push(Math.round(x * 10000) / 10000, Math.round(y * 10000) / 10000)
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(redraw)
  }

  const onPointerUp = () => {
    erasing.current = false
    const s = live.current
    live.current = null
    if (s) useDesign.getState().addStroke(s)
  }

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      className={`stage__doodles ${active ? 'is-active' : ''}`}
      style={{ width: w, height: h }}
      role={active ? 'img' : undefined}
      aria-label={active ? t.draw.area : undefined}
      aria-hidden={active ? undefined : true}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}

export function Stage({ layout, photos, drawing = false }: Props) {
  const t = useT()
  const design = useDesign((s) => s.design)
  const selectedId = useDesign((s) => s.selectedId)
  const select = useDesign((s) => s.select)
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 400, h: 600 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (drawing) select(null)
  }, [drawing, select])

  const ratio = layout.size.w / layout.size.h
  let w = box.w
  let h = w / ratio
  if (h > box.h) {
    h = box.h
    w = h * ratio
  }
  w = Math.max(120, Math.floor(w))
  h = Math.max(120, Math.floor(w / ratio))

  const base = { ...design, elements: [], strokes: [] }

  return (
    <div ref={wrapRef} className="stage-wrap" onPointerDown={() => !drawing && select(null)}>
      <div ref={stageRef} className={`stage ${drawing ? 'is-drawing' : ''}`} style={{ width: w, height: h }}>
        <CompositionCanvas layout={layout} design={base} photos={photos} displayWidth={w} label={t.decorate.stage} />
        <DoodleLayer w={w} h={h} active={drawing} />
        <div className="stage__layer">
          {design.elements.map((el) => (
            <ElementView key={el.id} el={el} stageRef={stageRef} selected={el.id === selectedId} />
          ))}
        </div>
      </div>
    </div>
  )
}
