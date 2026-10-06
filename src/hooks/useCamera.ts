import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraStatus = 'idle' | 'requesting' | 'live' | 'denied' | 'unavailable' | 'error'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(
    async (id?: string | null) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unavailable')
        return
      }
      setStatus('requesting')
      stop()
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: id
            ? { deviceId: { exact: id }, width: { ideal: 1920 }, height: { ideal: 1440 } }
            : { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1440 } },
        })
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => undefined)
        }
        const list = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput')
        setDevices(list)
        setDeviceId(stream.getVideoTracks()[0]?.getSettings().deviceId ?? id ?? null)
        setStatus('live')
      } catch (err) {
        const name = (err as DOMException)?.name
        if (name === 'NotAllowedError' || name === 'SecurityError') setStatus('denied')
        else if (name === 'NotFoundError' || name === 'OverconstrainedError') setStatus('unavailable')
        else setStatus('error')
      }
    },
    [stop],
  )

  const switchCamera = useCallback(() => {
    if (devices.length < 2) return
    const i = devices.findIndex((d) => d.deviceId === deviceId)
    const next = devices[(i + 1) % devices.length]
    start(next.deviceId)
  }, [devices, deviceId, start])

  useEffect(() => {
    start()
    return stop
  }, [start, stop])

  return { videoRef, status, start, switchCamera, canSwitch: devices.length > 1 }
}
