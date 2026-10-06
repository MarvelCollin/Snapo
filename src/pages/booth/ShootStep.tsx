import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowsClockwise,
  Camera,
  CameraSlash,
  Trash,
  UploadSimple,
  Stop,
  ArrowCounterClockwise,
  GearSix,
  ImageSquare,
} from '@phosphor-icons/react'
import { useSession, type Timer } from '../../store/session'
import { useDesign } from '../../store/design'
import { layoutById } from '../../lib/layouts'
import { filterById } from '../../lib/filters'
import { backdropById } from '../../lib/backdrops'
import { useSegmenterStatus } from '../../hooks/useSegmenterStatus'
import { ClipRecorder, saveClip } from '../../lib/clips'
import { nextPose, poseSticker, type PoseId } from '../../lib/poses'
import { stickerSrc } from '../../lib/stickers'
import { useCamera } from '../../hooks/useCamera'
import { captureFrame, fileToPhoto, beep, shutterSound, photoKey } from '../../lib/photos'
import { useT } from '../../i18n'
import { LiveView } from '../../components/shoot/LiveView'
import { BackdropPicker } from '../../components/shared/BackdropPicker'
import { CompositionCanvas } from '../../components/shared/CompositionCanvas'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Segmented } from '../../components/ui/Segmented'
import { Switch } from '../../components/ui/Switch'
import { Dialog } from '../../components/ui/Dialog'
import { Popover } from '../../components/ui/Popover'
import { toast } from '../../store/toasts'

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

type Phase = 'idle' | 'countdown' | 'between'

export default function ShootStep() {
  const t = useT()
  const navigate = useNavigate()
  const {
    layoutId,
    photos,
    timer,
    mirror,
    autoSequence,
    sound,
    poses,
    live: recordLive,
    setPhoto,
    setTimer,
    setMirror,
    setAutoSequence,
    setSound,
    setPhotos,
    setPoses,
    setLive,
  } = useSession()
  const design = useDesign((s) => s.design)
  const update = useDesign((s) => s.update)
  const layout = layoutById(layoutId)
  const filter = filterById('original')
  const { videoRef, status, start, switchCamera, canSwitch } = useCamera()
  const segStatus = useSegmenterStatus()

  const [phase, setPhase] = useState<Phase>('idle')
  const [count, setCount] = useState(0)
  const [flash, setFlash] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [current, setCurrent] = useState<number | null>(null)
  const [run, setRun] = useState<{ index: number; total: number } | null>(null)
  const [pose, setPose] = useState<PoseId | null>(null)
  const [confirmRetake, setConfirmRetake] = useState(false)
  const cancelRef = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filled = photos.filter(Boolean).length
  const complete = filled === layout.shots
  const firstEmpty = photos.findIndex((p) => !p)
  const target = selected ?? (firstEmpty >= 0 ? firstEmpty : null)
  const busy = phase !== 'idle'
  const live = status === 'live'
  const backdropOn = backdropById(design.backdropId).kind !== 'none'

  const aspectFor = (photoIndex: number | null) => {
    const slot = layout.slots.find((s) => s.photo === (photoIndex ?? 0)) ?? layout.slots[0]
    return slot.w / slot.h
  }
  const aspect = aspectFor(current ?? target)

  const shoot = async (plan: number[]) => {
    if (!videoRef.current || !plan.length) return
    cancelRef.current = false
    const posePlan: PoseId[] = []
    for (let k = 0; k < plan.length; k++) posePlan.push(nextPose(posePlan[k - 1] ?? null))
    for (let k = 0; k < plan.length; k++) {
      const slot = plan[k]
      setCurrent(slot)
      setRun({ index: k, total: plan.length })
      setPose(poses ? posePlan[k] : null)
      setPhase('countdown')
      const recorder = recordLive && videoRef.current ? new ClipRecorder(videoRef.current, mirror) : null
      recorder?.start()
      for (let n: number = timer; n > 0; n--) {
        if (cancelRef.current) break
        setCount(n)
        if (sound) beep(n === 1 ? 1040 : 780)
        await sleep(1000)
      }
      if (cancelRef.current) {
        recorder?.stop()
        break
      }
      setCount(0)
      setFlash((f) => f + 1)
      if (sound) shutterSound()
      const video = videoRef.current
      if (video && video.readyState >= 2) {
        const photo = await captureFrame(video, mirror)
        setPhoto(slot, photo)
        recorder
          ?.finish()
          .then((frames) => saveClip(photoKey(photo), frames))
          .catch(() => undefined)
      } else {
        recorder?.stop()
      }
      if (k < plan.length - 1) {
        setPose(poses ? posePlan[k + 1] : null)
        setPhase('between')
        await sleep(1100)
      }
    }
    setPhase('idle')
    setCurrent(null)
    setSelected(null)
    setRun(null)
    setPose(null)
  }

  const onShutter = () => {
    if (busy) {
      cancelRef.current = true
      return
    }
    if (selected !== null) {
      shoot([selected])
      return
    }
    if (complete) {
      setConfirmRetake(true)
      return
    }
    const empties = photos.map((p, i) => (p ? -1 : i)).filter((i) => i >= 0)
    shoot(autoSequence ? empties : empties.slice(0, 1))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && busy) cancelRef.current = true
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy])

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const next = [...photos]
    const all = photos.map((_, i) => i)
    const empties = all.filter((i) => !photos[i])
    const targets = (selected !== null ? all.slice(selected) : empties.length ? empties : all).slice(0, list.length)
    let added = 0
    for (let k = 0; k < targets.length; k++) {
      try {
        next[targets[k]] = await fileToPhoto(list[k])
        added++
      } catch {
        toast(t.shoot.couldNotRead(list[k].name), { tone: 'error' })
      }
    }
    setPhotos(next)
    setSelected(null)
    if (added) toast(t.shoot.added(added))
    if (fileRef.current) fileRef.current.value = ''
  }

  const shotLabel = busy
    ? t.shoot.stop
    : selected !== null
      ? t.shoot.retakeShot(selected + 1)
      : complete
        ? t.shoot.retakeAll
        : !autoSequence
          ? t.shoot.takeShot((target ?? 0) + 1)
          : filled
            ? t.shoot.shootMore(layout.shots - filled)
            : t.shoot.start(layout.shots)

  const remaining = layout.shots - filled
  const shotNumber = (current ?? target ?? 0) + 1
  const badge = run ? t.shoot.shotOf(run.index + 1, run.total) : t.shoot.shotOf(Math.min(shotNumber, layout.shots), layout.shots)

  return (
    <section className="step step--shoot" aria-labelledby="shoot-title">
      <header className="step__head step__head--row">
        <div>
          <h1 id="shoot-title">{t.shoot.title}</h1>
          <p className="step__lede">{t.shoot.lede(layout.name, layout.shots)}</p>
        </div>
      </header>

      <div className="shoot">
        <div className="shoot__stage">
          <div className="shoot__camera">
            <video ref={videoRef} className="visually-hidden" playsInline muted aria-hidden="true" />
            <LiveView
              videoRef={videoRef}
              live={live}
              filter={filter}
              mirror={mirror}
              aspect={aspect}
              beauty={design.beauty}
              backdropId={design.backdropId}
            >
              {live && (
                <span className="liveview__badge" aria-live="polite">
                  {badge}
                </span>
              )}
              {live && backdropOn && segStatus === 'loading' && (
                <span className="liveview__badge liveview__badge--end">
                  <span className="btn__spinner" aria-hidden="true" />
                  {t.shoot.backdropLoading}
                </span>
              )}
              {pose && phase !== 'idle' && (
                <span key={`pose-${pose}-${phase}`} className="liveview__pose" aria-live="polite">
                  <img src={stickerSrc(poseSticker(pose))} alt="" width={44} height={44} />
                  <span>
                    {phase === 'between' && <span className="liveview__pose-next">{t.shoot.nextPose}</span>}
                    {t.poses[pose]}
                  </span>
                </span>
              )}
              {phase === 'countdown' && count > 0 && (
                <span key={`count-${count}`} className="liveview__count" aria-live="assertive">
                  {count}
                </span>
              )}
              {phase === 'between' && !pose && <span className="liveview__note">{t.shoot.nextPose}</span>}
              {flash > 0 && <span key={`flash-${flash}`} className="liveview__flash" aria-hidden="true" />}
              {status !== 'live' && (
                <div className="liveview__state">
                  {status === 'requesting' || status === 'idle' ? (
                    <>
                      <div className="skeleton liveview__skeleton" />
                      <p className="liveview__state-text">{t.shoot.waiting}</p>
                    </>
                  ) : (
                    <>
                      <CameraSlash size={40} weight="bold" aria-hidden="true" />
                      <h2 className="liveview__state-title">
                        {status === 'denied' ? t.shoot.blockedTitle : status === 'unavailable' ? t.shoot.noneTitle : t.shoot.errorTitle}
                      </h2>
                      <p className="liveview__state-text">
                        {status === 'denied' ? t.shoot.blockedText : status === 'unavailable' ? t.shoot.noneText : t.shoot.errorText}
                      </p>
                      <div className="liveview__state-actions">
                        {status !== 'unavailable' && (
                          <Button variant="primary" icon={<ArrowsClockwise weight="bold" size={18} />} onClick={() => start()}>
                            {t.common.tryAgain}
                          </Button>
                        )}
                        <Button icon={<UploadSimple weight="bold" size={18} />} onClick={() => fileRef.current?.click()}>
                          {t.shoot.upload}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </LiveView>
          </div>

          <div className="shoot__controls">
            {complete && !busy && selected === null ? (
              <>
                <Button variant="primary" size="lg" className="shutter" iconEnd={<ArrowRight weight="bold" size={22} />} onClick={() => navigate('/booth/edit')}>
                  {t.shoot.decorate}
                </Button>
                <Button variant="ghost" icon={<ArrowCounterClockwise weight="bold" size={18} />} onClick={() => setConfirmRetake(true)}>
                  {t.shoot.retakeAll}
                </Button>
              </>
            ) : (
              <Button
                variant={busy ? 'danger' : 'primary'}
                size="lg"
                className="shutter"
                icon={busy ? <Stop weight="fill" size={22} /> : <Camera weight="fill" size={22} />}
                onClick={onShutter}
                disabled={!live && !busy}
              >
                {shotLabel}
              </Button>
            )}
            <div className="shoot__quick">
              <Popover label={t.shoot.backdrop} title={t.look.backdrop} icon={<ImageSquare weight="bold" size={20} aria-hidden="true" />} wide disabled={busy}>
                <BackdropPicker value={design.backdropId} onChange={(id) => update({ backdropId: id })} variant="rail" />
              </Popover>
              <Popover label={t.shoot.settingsShort} title={t.shoot.settings} icon={<GearSix weight="bold" size={20} aria-hidden="true" />} disabled={busy}>
                <div className="settings">
                  <Segmented<Timer>
                    label={t.shoot.timer}
                    value={timer}
                    onChange={setTimer}
                    options={[
                      { value: 3, label: '3s' },
                      { value: 5, label: '5s' },
                      { value: 10, label: '10s' },
                    ]}
                  />
                  <Switch label={t.shoot.autoSeq} hint={t.shoot.autoSeqHint} checked={autoSequence} onChange={setAutoSequence} />
                  <Switch label={t.shoot.poses} hint={t.shoot.posesHint} checked={poses} onChange={setPoses} />
                  <Switch label={t.shoot.live} hint={t.shoot.liveHint} checked={recordLive} onChange={setLive} />
                  <Switch label={t.shoot.mirror} hint={t.shoot.mirrorHint} checked={mirror} onChange={setMirror} />
                  <Switch label={t.shoot.sounds} hint={t.shoot.soundsHint} checked={sound} onChange={setSound} />
                </div>
              </Popover>
              <IconButton label={t.shoot.upload} icon={<UploadSimple weight="bold" size={20} />} onClick={() => fileRef.current?.click()} disabled={busy} />
              {canSwitch && <IconButton label={t.shoot.switchCamera} icon={<ArrowsClockwise weight="bold" size={20} />} onClick={switchCamera} disabled={busy} />}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="visually-hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>
        </div>

        <aside className="shoot__side" aria-label={t.shoot.stripLabel}>
          <div className="shoot__preview">
            <CompositionCanvas
              layout={layout}
              design={{ ...design, elements: [], strokes: [] }}
              photos={photos}
              displayHeight={240}
              displayWidth={220}
              label={t.shoot.previewLabel(layout.name, filled, layout.shots)}
            />
          </div>

          <p className="shoot__status" aria-live="polite">
            <strong>{complete ? t.shoot.allDone : t.shoot.toGo(remaining)}</strong>
            <span>{complete ? t.shoot.doneHint : t.shoot.fillHint}</span>
          </p>

          <div className="tray">
            <div className="tray__head">
              <h2 className="panel-title">{t.shoot.shots}</h2>
              <span className="tray__count">
                {filled} / {layout.shots}
              </span>
            </div>
            <ol className="tray__list">
              {photos.map((p, i) => {
                const isSel = selected === i
                const isNext = selected === null && target === i && !busy
                return (
                  <li key={i} className={`tray__item ${isSel ? 'is-selected' : ''} ${isNext ? 'is-next' : ''} ${current === i ? 'is-shooting' : ''}`}>
                    <button
                      type="button"
                      className="tray__thumb"
                      aria-pressed={isSel}
                      aria-label={p ? t.shoot.slotFilled(i + 1) : t.shoot.slotEmpty(i + 1)}
                      onClick={() => setSelected(isSel ? null : i)}
                      disabled={busy}
                      style={{ aspectRatio: String(aspectFor(i)) }}
                    >
                      {p ? <img src={p} alt="" /> : <span className="tray__num">{i + 1}</span>}
                    </button>
                    {p && (
                      <IconButton
                        label={t.shoot.removeShot(i + 1)}
                        tone="plain"
                        size="sm"
                        icon={<Trash weight="bold" size={16} />}
                        onClick={() => {
                          setPhoto(i, null)
                          toast(t.shoot.removed(i + 1), { actionLabel: t.common.undo, onAction: () => setPhoto(i, p) })
                        }}
                        disabled={busy}
                      />
                    )}
                  </li>
                )
              })}
            </ol>
            {selected !== null && <p className="tray__hint">{t.shoot.selected(selected + 1, !!photos[selected])}</p>}
          </div>

        </aside>
      </div>

      <Dialog
        open={confirmRetake}
        onClose={() => setConfirmRetake(false)}
        title={t.shoot.retakeTitle(layout.shots)}
        size="confirm"
        footer={
          <>
            <Button onClick={() => setConfirmRetake(false)}>{t.shoot.keep}</Button>
            <Button
              variant="danger"
              icon={<ArrowCounterClockwise weight="bold" size={18} />}
              onClick={() => {
                setConfirmRetake(false)
                shoot(photos.map((_, i) => i))
              }}
            >
              {t.shoot.retakeAll}
            </Button>
          </>
        }
      >
        <p>{t.shoot.retakeBody}</p>
      </Dialog>
    </section>
  )
}
