import { useEffect, useRef, useState } from 'react'
import { ArrowSquareOut, CopySimple, QrCode, X } from '@phosphor-icons/react'
import { CLOUD_HOST, CLOUD_MINUTES, CloudError, qrPath, uploadTemp, type CloudLink } from '../../lib/cloud'
import { buttonClass } from '../../lib/buttonClass'
import { getLocale, useT } from '../../i18n'
import { toast } from '../../store/toasts'
import { Button } from '../ui/Button'

type State = { status: 'idle' } | { status: 'uploading' } | { status: 'ready'; link: CloudLink } | { status: 'expired' } | { status: 'error'; code: CloudError['code'] }

type Props = {
  getFile: () => Promise<Blob>
  filename: string
  disabled?: boolean
}

export function QrDownload({ getFile, filename, disabled }: Props) {
  const t = useT()
  const [state, setState] = useState<State>({ status: 'idle' })
  const abort = useRef<AbortController | null>(null)

  useEffect(() => () => abort.current?.abort(), [])

  useEffect(() => {
    if (state.status !== 'ready') return
    const id = window.setTimeout(() => setState({ status: 'expired' }), Math.max(0, state.link.expires - Date.now()))
    return () => window.clearTimeout(id)
  }, [state])

  const make = async () => {
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setState({ status: 'uploading' })
    try {
      const link = await uploadTemp(await getFile(), filename, ctrl.signal)
      if (!ctrl.signal.aborted) setState({ status: 'ready', link })
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return
      setState({ status: 'error', code: err instanceof CloudError ? err.code : 'failed' })
    }
  }

  const cancel = () => {
    abort.current?.abort()
    setState({ status: 'idle' })
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast(t.qr.copied)
    } catch {
      toast(t.qr.copyFailed, { tone: 'error' })
    }
  }

  const qr = state.status === 'ready' ? qrPath(state.link.url) : null
  const until = state.status === 'ready' ? new Date(state.link.expires).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <section className="qr" aria-labelledby="qr-title">
      <h2 id="qr-title" className="panel-title">
        {t.qr.title}
      </h2>

      {state.status === 'ready' && qr ? (
        <div className="qr__card">
          <svg className="qr__code" viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`} role="img" aria-label={t.qr.alt} shapeRendering="crispEdges">
            <rect x={-2} y={-2} width={qr.size + 4} height={qr.size + 4} fill="#ffffff" />
            <path d={qr.d} fill="#1f1a1c" />
          </svg>
          <div className="qr__info">
            <p className="qr__scan">{t.qr.scan}</p>
            <p className="field__hint">{t.qr.until(until)}</p>
            <div className="qr__links">
              <a className={buttonClass('secondary', 'sm')} href={state.link.url} target="_blank" rel="noopener noreferrer">
                <ArrowSquareOut weight="bold" size={18} aria-hidden="true" />
                <span>{t.qr.open}</span>
              </a>
              <Button size="sm" icon={<CopySimple weight="bold" size={18} />} onClick={() => copy(state.link.url)}>
                {t.qr.copy}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="field__hint">{state.status === 'expired' ? t.qr.expired : t.qr.text(CLOUD_HOST, CLOUD_MINUTES)}</p>
          {state.status === 'error' && (
            <p className="look-status look-status--error" role="alert">
              {state.code === 'offline' ? t.qr.offline : state.code === 'tooBig' ? t.qr.tooBig : t.qr.failed}
            </p>
          )}
          <div className="qr__links">
            <Button icon={<QrCode weight="bold" size={20} />} loading={state.status === 'uploading'} disabled={disabled} onClick={make}>
              {state.status === 'uploading' ? t.qr.uploading : state.status === 'error' || state.status === 'expired' ? t.qr.again : t.qr.make}
            </Button>
            {state.status === 'uploading' && (
              <Button variant="ghost" icon={<X weight="bold" size={18} />} onClick={cancel}>
                {t.qr.cancel}
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
