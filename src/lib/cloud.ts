import qrcode from 'qrcode-generator'

export const CLOUD_HOST = 'tmpfiles.org'
export const CLOUD_MINUTES = 60

const ENDPOINT = 'https://tmpfiles.org/api/v1/upload'

export type CloudLink = { url: string; expires: number }

export class CloudError extends Error {
  code: 'offline' | 'tooBig' | 'failed'
  constructor(code: CloudError['code']) {
    super(code)
    this.code = code
  }
}

export async function uploadTemp(blob: Blob, filename: string, signal?: AbortSignal): Promise<CloudLink> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new CloudError('offline')
  if (blob.size > 90 * 1024 * 1024) throw new CloudError('tooBig')
  const form = new FormData()
  form.append('file', blob, filename)
  let res: Response
  try {
    res = await fetch(ENDPOINT, { method: 'POST', body: form, signal })
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') throw err
    throw new CloudError(navigator.onLine === false ? 'offline' : 'failed')
  }
  if (res.status === 413) throw new CloudError('tooBig')
  if (!res.ok) throw new CloudError('failed')
  const json = (await res.json().catch(() => null)) as { status?: string; data?: { url?: string } } | null
  const url = json?.data?.url
  if (json?.status !== 'success' || typeof url !== 'string' || !/^https?:\/\/tmpfiles\.org\//.test(url)) throw new CloudError('failed')
  return { url: url.replace(/^http:/, 'https:'), expires: Date.now() + CLOUD_MINUTES * 60 * 1000 }
}

export function qrPath(text: string) {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const n = qr.getModuleCount()
  let d = ''
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`
  }
  return { size: n, d }
}
