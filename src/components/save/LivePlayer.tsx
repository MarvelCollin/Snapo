import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from '@phosphor-icons/react'
import type { LiveStrip } from '../../lib/liveStrip'
import { useT } from '../../i18n'
import { IconButton } from '../ui/IconButton'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export function LivePlayer({ strip, label }: { strip: LiveStrip; label: string }) {
  const t = useT()
  const ref = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(() => !reducedMotion())

  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.width = strip.width
    c.height = strip.height
    const ctx = c.getContext('2d')!
    let i = 0
    ctx.drawImage(strip.frames[strip.order[0]], 0, 0)
    if (!playing) return
    const id = window.setInterval(() => {
      i = (i + 1) % strip.order.length
      ctx.drawImage(strip.frames[strip.order[i]], 0, 0)
    }, 1000 / strip.fps)
    return () => window.clearInterval(id)
  }, [strip, playing])

  return (
    <div className="live-player">
      <canvas ref={ref} className="save__img" role="img" aria-label={label} />
      <IconButton
        className="live-player__toggle"
        label={playing ? t.save.pause : t.save.play}
        icon={playing ? <Pause weight="fill" size={18} /> : <Play weight="fill" size={18} />}
        onClick={() => setPlaying((p) => !p)}
      />
    </div>
  )
}
