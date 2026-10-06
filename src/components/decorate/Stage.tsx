import { useEffect, useRef, useState } from 'react'
import type { Layout } from '../../lib/layouts'
import { useDesign } from '../../store/design'
import { CompositionCanvas } from '../CompositionCanvas'
import { ElementView } from './ElementView'

type Props = {
  layout: Layout
  photos: (string | null)[]
}

export function Stage({ layout, photos }: Props) {
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

  const ratio = layout.size.w / layout.size.h
  let w = box.w
  let h = w / ratio
  if (h > box.h) {
    h = box.h
    w = h * ratio
  }
  w = Math.max(120, Math.floor(w))
  h = Math.max(120, Math.floor(w / ratio))

  const base = { ...design, elements: [] }

  return (
    <div ref={wrapRef} className="stage-wrap" onPointerDown={() => select(null)}>
      <div ref={stageRef} className="stage" style={{ width: w, height: h }}>
        <CompositionCanvas layout={layout} design={base} photos={photos} displayWidth={w} label="Your decorated strip" />
        <div className="stage__layer">
          {design.elements.map((el) => (
            <ElementView key={el.id} el={el} stageRef={stageRef} selected={el.id === selectedId} />
          ))}
        </div>
      </div>
    </div>
  )
}
