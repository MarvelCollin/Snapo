import { useEffect, useRef, useState } from 'react'
import { renderComposition, type RenderInput } from '../../lib/render'

let queue: Promise<unknown> = Promise.resolve()

const pause = () => new Promise<void>((resolve) => (window.requestIdleCallback ? window.requestIdleCallback(() => resolve(), { timeout: 120 }) : window.setTimeout(resolve, 16)))

function queued<T>(job: () => Promise<T>) {
  const next = queue.then(pause).then(job)
  queue = next.catch(() => undefined)
  return next
}

type Props = Omit<RenderInput, 'scale'> & {
  displayWidth?: number
  displayHeight?: number
  className?: string
  label: string
  onRendered?: (canvas: HTMLCanvasElement) => void
  lazy?: boolean
}

export function CompositionCanvas({ displayWidth, displayHeight, className, label, onRendered, lazy, ...input }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [seen, setSeen] = useState(!lazy || typeof IntersectionObserver === 'undefined')
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
  const job = useRef({ running: false, next: null as RenderInput | null, alive: true })

  useEffect(() => {
    const state = job.current
    state.alive = true
    return () => {
      state.alive = false
    }
  }, [])

  useEffect(() => {
    const el = box.current
    if (seen || !el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '240px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])

  useEffect(() => {
    if (!seen) return
    const state = job.current
    const run = async (args: RenderInput) => {
      state.running = true
      try {
        const off = document.createElement('canvas')
        await (lazy ? queued(() => renderComposition(off, args)) : renderComposition(off, args))
        const canvas = ref.current
        if (canvas && state.alive && !state.next) {
          canvas.width = off.width
          canvas.height = off.height
          canvas.getContext('2d')?.drawImage(off, 0, 0)
          setReady(true)
          onRendered?.(canvas)
        }
      } catch (err) {
        console.error(err)
      } finally {
        state.running = false
        const next = state.next
        state.next = null
        if (next && state.alive) run(next)
      }
    }
    const args = { ...input, scale }
    if (state.running) state.next = args
    else run(args)
  }, [key, seen])

  return (
    <div ref={box} className={`composition ${ready ? 'is-ready' : ''} ${className ?? ''}`} style={{ width: w, height: h }}>
      <canvas ref={ref} role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true} style={{ width: w, height: h }} />
    </div>
  )
}
