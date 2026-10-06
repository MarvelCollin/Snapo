const MAX = 1600

export const photoKey = (src: string) => `${src.length}:${src.slice(-40)}`

const toDataUrl = (c: HTMLCanvasElement) =>
  new Promise<string>((resolve, reject) =>
    c.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Could not encode the photo'))
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      0.92,
    ),
  )

export function captureFrame(video: HTMLVideoElement, mirror: boolean) {
  const vw = video.videoWidth
  const vh = video.videoHeight
  const k = Math.min(1, MAX / Math.max(vw, vh))
  const w = Math.round(vw * k)
  const h = Math.round(vh * k)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  if (mirror) {
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(video, 0, 0, w, h)
  return toDataUrl(c)
}

export async function fileToPhoto(file: File) {
  const bitmap = await createImageBitmap(file)
  const k = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * k)
  const h = Math.round(bitmap.height * k)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return toDataUrl(c)
}

let audio: AudioContext | null = null

export function beep(freq = 880, ms = 90, volume = 0.08) {
  try {
    audio ??= new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000)
    osc.connect(gain).connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + ms / 1000)
  } catch {
    audio = null
  }
}

export function shutterSound() {
  beep(1320, 60, 0.06)
  window.setTimeout(() => beep(1760, 90, 0.05), 60)
}
