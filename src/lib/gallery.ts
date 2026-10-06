import { createStore, del, entries, get, set } from 'idb-keyval'

export type GalleryItem = {
  id: string
  createdAt: number
  layoutId: string
  layoutName: string
  frameName: string
  shots: number
  width: number
  height: number
  thumb: string
}

const metaStore = () => createStore('snapo-gallery-meta', 'items')
const fileStore = () => createStore('snapo-gallery-files', 'files')

export async function saveToGallery(meta: GalleryItem, blob: Blob) {
  await set(meta.id, blob, fileStore())
  await set(meta.id, meta, metaStore())
}

export async function listGallery(): Promise<GalleryItem[]> {
  const all = await entries<string, GalleryItem>(metaStore())
  return all.map(([, v]) => v).sort((a, b) => b.createdAt - a.createdAt)
}

export async function getGalleryFile(id: string) {
  return get<Blob>(id, fileStore())
}

export async function removeFromGallery(id: string) {
  const [meta, blob] = await Promise.all([get<GalleryItem>(id, metaStore()), get<Blob>(id, fileStore())])
  await Promise.all([del(id, metaStore()), del(id, fileStore())])
  return meta && blob ? { meta, blob } : null
}
