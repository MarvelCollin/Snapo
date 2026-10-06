import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { CompositionCanvas } from './CompositionCanvas'

type Props = Omit<ComponentProps<typeof CompositionCanvas>, 'displayWidth' | 'displayHeight' | 'lazy'> & { inset?: number }

export function LayoutThumb({ inset = 16, ...props }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width)
      const h = Math.floor(entry.contentRect.height)
      setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <span ref={ref} className="layout-thumb">
      {box && box.w > inset && box.h > inset && <CompositionCanvas lazy {...props} displayWidth={box.w - inset} displayHeight={box.h - inset} />}
    </span>
  )
}
