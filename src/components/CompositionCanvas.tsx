import { useEffect, useRef, useState } from 'react'
import { renderComposition, type RenderInput } from '../lib/render'

type Props = Omit<RenderInput, 'scale'> & {
  displayWidth?: number
  displayHeight?: number
  className?: string
  label: string
  onRendered?: (canvas: HTMLCanvasElement) => void
}

export function CompositionCanvas({ displayWidth, displayHeight, className, label, onRendered, ...input }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const { layout } = input
  const ratio = layout.size.w / layout.size.h
  let w = displayWidth ?? (displayHeight ?? 300) * ratio
  let h = w / ratio
  if (displayHeight && h > displayHeight) {
    h = displayHeight
    w = h * ratio
  }
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const scale = (w / layout.size.w) * dpr

  const key = JSON.stringify([layout.id, input.design, input.photos.map((p) => (p ? p.length + p.slice(-24) : 0)), scale, input.includeElements, input.emptyLabel])

  useEffect(() => {
    let cancelled = false
    const canvas = ref.current
    if (!canvas) return
    const off = document.createElement('canvas')
    renderComposition(off, { ...input, scale })
      .then(() => {
        if (cancelled) return
        canvas.width = off.width
        canvas.height = off.height
        canvas.getContext('2d')?.drawImage(off, 0, 0)
        setReady(true)
        onRendered?.(canvas)
      })
      .catch((err) => console.error(err))
    return () => {
      cancelled = true
    }
  }, [key])

  return (
    <div className={`composition ${ready ? 'is-ready' : ''} ${className ?? ''}`} style={{ width: w, height: h }}>
      <canvas ref={ref} role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true} style={{ width: w, height: h }} />
    </div>
  )
}
