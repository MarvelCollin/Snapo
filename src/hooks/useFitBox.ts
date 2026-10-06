import { useEffect, useRef, useState } from 'react'

export function useFitBox(ratio: number, min = 120) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 400, h: 600 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  let w = box.w
  let h = w / ratio
  if (h > box.h) {
    h = box.h
    w = h * ratio
  }
  w = Math.max(min, Math.floor(w))
  h = Math.max(min, Math.floor(w / ratio))
  return { ref, w, h }
}
