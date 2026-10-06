import { useEffect, useState } from 'react'
import { Camera, DownloadSimple, Trash } from '@phosphor-icons/react'
import { getGalleryFile, listGallery, removeFromGallery, saveToGallery, type GalleryItem } from '../lib/gallery'
import { download } from '../lib/export'
import { LinkButton, Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { toast } from '../components/ui/Toast'

const PAGE = 24

const when = (t: number) => new Date(t).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const [open, setOpen] = useState<GalleryItem | null>(null)
  const [openUrl, setOpenUrl] = useState<string | null>(null)

  const load = () => {
    setFailed(false)
    listGallery()
      .then(setItems)
      .catch(() => setFailed(true))
  }

  useEffect(load, [])

  useEffect(() => {
    if (!open) return
    let url: string | null = null
    getGalleryFile(open.id).then((blob) => {
      if (!blob) return
      url = URL.createObjectURL(blob)
      setOpenUrl(url)
    })
    return () => {
      if (url) URL.revokeObjectURL(url)
      setOpenUrl(null)
    }
  }, [open])

  const onDownload = async (item: GalleryItem) => {
    const blob = await getGalleryFile(item.id)
    if (blob) download(blob, `snapo-${item.id}.png`)
  }

  const onDelete = async (item: GalleryItem) => {
    setOpen(null)
    const removed = await removeFromGallery(item.id)
    setItems((list) => list?.filter((i) => i.id !== item.id) ?? null)
    toast(`Deleted ${item.layoutName} strip`, {
      actionLabel: 'Undo',
      onAction: async () => {
        if (!removed) return
        await saveToGallery(removed.meta, removed.blob)
        load()
      },
    })
  }

  return (
    <section className="step gallery" aria-labelledby="gallery-title">
      <header className="step__head step__head--row">
        <div>
          <h1 id="gallery-title">Your gallery</h1>
          <p className="step__lede">
            {items === null ? 'Loading your strips.' : items.length ? `${items.length} ${items.length === 1 ? 'strip' : 'strips'} saved on this device.` : 'Strips you save show up here.'}
          </p>
        </div>
        {!!items?.length && (
          <LinkButton to="/booth" variant="primary" icon={<Camera weight="bold" size={20} />}>
            New strip
          </LinkButton>
        )}
      </header>

      {failed && (
        <div className="empty">
          <h2>Could not open your gallery</h2>
          <p>Private browsing can block saved photos. Try again or use a normal window.</p>
          <Button variant="primary" onClick={load}>
            Try again
          </Button>
        </div>
      )}

      {items === null && !failed && (
        <ul className="gallery-grid" aria-busy="true" aria-label="Loading strips">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <div className="skeleton gallery-skeleton" />
            </li>
          ))}
        </ul>
      )}

      {items?.length === 0 && (
        <div className="empty">
          <img src="/stickers/camera-with-flash.webp" alt="" width={96} height={96} />
          <h2>No strips yet</h2>
          <p>Shoot a strip, then press Save to my gallery on the last step.</p>
          <LinkButton to="/booth" variant="primary" size="lg" icon={<Camera weight="bold" size={20} />}>
            Open the booth
          </LinkButton>
        </div>
      )}

      {!!items?.length && (
        <>
          <ul className="gallery-grid">
            {items.slice(0, shown).map((item) => (
              <li key={item.id}>
                <button type="button" className="gallery-card" onClick={() => setOpen(item)}>
                  <span className="gallery-card__art">
                    <img src={item.thumb} alt="" loading="lazy" width={item.width} height={item.height} />
                  </span>
                  <span className="gallery-card__name">{item.layoutName}</span>
                  <span className="gallery-card__meta">
                    {item.frameName}, {when(item.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {shown < items.length && (
            <div className="gallery__more">
              <p>
                Showing {shown} of {items.length}
              </p>
              <Button onClick={() => setShown((s) => s + PAGE)}>Show more</Button>
            </div>
          )}
        </>
      )}

      <Dialog
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `${open.layoutName}, ${when(open.createdAt)}` : ''}
        size="media"
        footer={
          open && (
            <>
              <Button variant="danger" icon={<Trash weight="bold" size={18} />} onClick={() => onDelete(open)}>
                Delete
              </Button>
              <Button variant="primary" icon={<DownloadSimple weight="bold" size={18} />} onClick={() => onDownload(open)}>
                Download PNG
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="viewer" style={{ aspectRatio: `${open.width} / ${open.height}` }}>
            <img src={openUrl ?? open.thumb} alt={`${open.layoutName} strip from ${when(open.createdAt)}`} />
          </div>
        )}
      </Dialog>
    </section>
  )
}
