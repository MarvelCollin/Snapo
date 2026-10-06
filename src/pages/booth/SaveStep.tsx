import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  DownloadSimple,
  FileJpg,
  FilmStrip,
  Heart,
  Printer,
  ShareNetwork,
  Sparkle,
  CheckCircle,
} from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { useDesign } from '../../store/design'
import { layoutById } from '../../lib/layouts'
import { canShareFiles, canvasToBlob, download, fileStamp, makeGif, printImage, renderFinal, shareImage, thumbnailOf, toJpeg } from '../../lib/export'
import { saveToGallery } from '../../lib/gallery'
import { useT } from '../../i18n'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/toasts'

type Busy = null | 'jpg' | 'gif' | 'share' | 'gallery'

export default function SaveStep() {
  const t = useT()
  const navigate = useNavigate()
  const { layoutId, photos, clearPhotos, setPhotos } = useSession()
  const design = useDesign((s) => s.design)
  const layout = layoutById(layoutId)
  const complete = photos.length === layout.shots && photos.every(Boolean)
  const [png, setPng] = useState<{ blob: Blob; url: string; canvas: HTMLCanvasElement } | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState<Busy>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const urlRef = useRef<string | null>(null)
  const share = useMemo(canShareFiles, [])
  const name = useMemo(() => `snapo-${fileStamp()}`, [])

  useEffect(() => {
    if (!complete) return
    let alive = true
    setError(false)
    renderFinal(layout, design, photos)
      .then(async (canvas) => {
        const blob = await canvasToBlob(canvas)
        if (!alive) return
        const url = URL.createObjectURL(blob)
        urlRef.current = url
        setPng({ blob, url, canvas })
      })
      .catch(() => alive && setError(true))
    return () => {
      alive = false
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [attempt])

  if (!complete) return <Navigate to="/booth/shoot" replace />

  const run = async (kind: Exclude<Busy, null>, fn: () => Promise<void>) => {
    setBusy(kind)
    try {
      await fn()
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') toast(t.common.oops, { tone: 'error' })
    } finally {
      setBusy(null)
    }
  }

  const saveGallery = () =>
    run('gallery', async () => {
      if (!png) return
      const id = `${Date.now()}`
      await saveToGallery(
        {
          id,
          createdAt: Date.now(),
          layoutId: layout.id,
          layoutName: layout.name,
          frameName: design.frame.name,
          shots: layout.shots,
          width: png.canvas.width,
          height: png.canvas.height,
          thumb: await thumbnailOf(png.canvas),
        },
        png.blob,
      )
      setSavedId(id)
      toast(t.save.savedToast, { actionLabel: t.save.openGallery, onAction: () => navigate('/gallery') })
    })

  const startOver = () => {
    const backupPhotos = [...photos]
    const backup = useDesign.getState().design
    clearPhotos()
    useDesign.getState().update({ elements: [] })
    navigate('/booth/layout')
    toast(t.save.fresh, {
      actionLabel: t.common.undo,
      onAction: () => {
        setPhotos(backupPhotos)
        useDesign.getState().update(backup)
        navigate('/booth/save')
      },
    })
  }

  const ratio = layout.size.w / layout.size.h

  return (
    <section className="step step--save" aria-labelledby="save-title">
      <div className="save">
        <div className="save__preview">
          <div className="save__frame" style={{ aspectRatio: String(ratio), ['--ratio' as string]: ratio }}>
            {png ? (
              <img src={png.url} alt={t.save.alt(layout.name)} className="save__img" />
            ) : error ? (
              <div className="save__error">
                <p>{t.save.couldNotDraw}</p>
                <Button variant="primary" onClick={() => setAttempt((a) => a + 1)}>
                  {t.common.tryAgain}
                </Button>
              </div>
            ) : (
              <div className="skeleton save__skeleton" aria-label={t.save.drawingLabel} aria-busy="true" />
            )}
          </div>
        </div>

        <div className="save__side">
          <header className="step__head">
            <h1 id="save-title">{t.save.title}</h1>
            <p className="step__lede">
              {t.save.lede(layout.name, design.frame.name)} {png ? t.save.size(png.canvas.width, png.canvas.height) : t.save.drawing}
            </p>
          </header>

          <div className="save__actions">
            <Button
              variant="primary"
              size="lg"
              block
              icon={<DownloadSimple weight="bold" size={22} />}
              disabled={!png}
              onClick={() => png && download(png.blob, `${name}.png`)}
            >
              {t.save.png}
            </Button>
            <div className="save__grid">
              <Button
                icon={<FileJpg weight="bold" size={20} />}
                disabled={!png}
                loading={busy === 'jpg'}
                onClick={() =>
                  run('jpg', async () => {
                    if (png) download(await toJpeg(png.canvas), `${name}.jpg`)
                  })
                }
              >
                {t.save.jpg}
              </Button>
              <Button
                icon={<FilmStrip weight="bold" size={20} />}
                disabled={!png}
                loading={busy === 'gif'}
                onClick={() => run('gif', async () => download(await makeGif(layout, design, photos), `${name}.gif`))}
              >
                {t.save.flipbook}
              </Button>
              {share && (
                <Button
                  icon={<ShareNetwork weight="bold" size={20} />}
                  disabled={!png}
                  loading={busy === 'share'}
                  onClick={() =>
                    run('share', async () => {
                      if (png) await shareImage(png.blob, `${name}.png`, t.save.shareTitle)
                    })
                  }
                >
                  {t.save.share}
                </Button>
              )}
              <Button icon={<Printer weight="bold" size={20} />} disabled={!png} onClick={() => png && printImage(png.url, png.canvas.width, png.canvas.height)}>
                {t.save.print}
              </Button>
            </div>

            {savedId ? (
              <p className="save__saved">
                <CheckCircle weight="fill" size={20} aria-hidden="true" />
                {t.save.saved} <Link to="/gallery">{t.save.seeGallery}</Link>
              </p>
            ) : (
              <Button variant="mint" block icon={<Heart weight="bold" size={20} />} disabled={!png} loading={busy === 'gallery'} onClick={saveGallery}>
                {t.save.saveGallery}
              </Button>
            )}
            <p className="save__privacy">{t.save.privacy}</p>
          </div>

          <div className="save__more">
            <Button variant="ghost" icon={<ArrowLeft weight="bold" size={18} />} onClick={() => navigate('/booth/decorate')}>
              {t.save.keepDecorating}
            </Button>
            <Button variant="ghost" icon={<Sparkle weight="bold" size={18} />} onClick={startOver}>
              {t.save.newStrip}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
