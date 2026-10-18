import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, ImagesSquare } from '@phosphor-icons/react'
import { LinkButton } from '../components/ui/LinkButton'
import { CompositionCanvas } from '../components/shared/CompositionCanvas'
import { layoutById, layouts } from '../lib/layouts'
import { frameById, frames } from '../lib/frames'
import { filters } from '../lib/filters'
import { stickers, stickerSrc, wordPresets } from '../lib/stickers'
import { samplePhoto, samplePhotos } from '../lib/samples'
import { templateById, templateDesign } from '../lib/templates'
import { makeThumbs, thumbStyle, type FilterThumbs } from '../lib/filterThumbs'
import { defaultDesign, useDesign, type CanvasEl, type Design } from '../store/design'
import { useSession } from '../store/session'
import { useT } from '../i18n'

const el = (ref: string, x: number, y: number, w: number, rot: number): CanvasEl => ({ id: `${ref}-${x}`, kind: 'sticker', ref, outline: true, x, y, w, rot, flip: false })

const heroStrips: { layout: string; design: Partial<Design>; offset: number }[] = [
  {
    layout: 'classic-4',
    offset: 0,
    design: {
      frame: frameById('strawberry-milk'),
      filterId: 'seoul',
      caption: 'besties',
      elements: [el('sparkles', 0.86, 0.06, 0.3, 12), el('ribbon', 0.14, 0.53, 0.32, -18)],
    },
  },
  {
    layout: 'hearts',
    offset: 4,
    design: {
      frame: frameById('love-letter'),
      filterId: 'peach',
      caption: 'xoxo',
      captionFont: 'pacifico',
      elements: [el('cherries', 0.84, 0.88, 0.16, 10)],
    },
  },
  {
    layout: 'polaroid',
    offset: 6,
    design: {
      frame: frameById('cloud-nine'),
      filterId: 'fairy',
      caption: 'sunday club',
      captionFont: 'caveat',
      elements: [el('ribbon', 0.12, 0.08, 0.24, -14)],
    },
  },
]

const quickLayouts = ['tpl-mochi', 'tpl-kitty', 'tpl-newspaper', 'tpl-photocard', 'tpl-comic', 'tpl-camcorder']
const demoFilters = ['original', 'seoul', 'strawberry-milk', 'golden-hour', 'life4', 'cotton-candy', 'pink-duo', 'y2k']
const wall = ['sparkling-heart', 'rabbit-face', 'strawberry', 'ribbon', 'rainbow', 'cat-face', 'bubble-tea', 'sparkles', 'cherry-blossom', 'teddy-bear', 'shortcake', 'victory-hand', 'crown', 'butterfly', 'star-struck', 'cherries', 'hamster', 'love-letter', 'four-leaf-clover', 'unicorn', 'balloon', 'heart-hands', 'soft-ice-cream', 'ghost']

export default function HomePage() {
  const t = useT()
  const navigate = useNavigate()
  const setLayout = useSession((s) => s.setLayout)
  const [photos, setPhotos] = useState<string[] | null>(null)
  const [demo, setDemo] = useState<FilterThumbs | null>(null)

  useEffect(() => {
    let alive = true
    samplePhotos(9).then((p) => alive && setPhotos(p))
    samplePhoto(3).then((src) => {
      const img = new Image()
      img.onload = () => makeThumbs(img, img.naturalWidth, img.naturalHeight).then((t) => alive && setDemo(t))
      img.src = src
    })
    return () => {
      alive = false
    }
  }, [])

  const base = useMemo(() => defaultDesign(), [])
  const captions = t.layout.captions
  const quickDesigns = useMemo(() => new Map(quickLayouts.map((id) => [id, templateDesign(base, templateById(id)!, captions[id])])), [base, captions])

  const start = (id: string) => {
    const tpl = templateById(id)
    setLayout(id)
    if (tpl) useDesign.getState().update(templateDesign(useDesign.getState().design, tpl, captions[id]))
    navigate('/booth/shoot')
  }

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <h1 id="hero-title">{t.home.title}</h1>
          <p className="hero__lede">{t.home.lede}</p>
          <div className="hero__ctas">
            <LinkButton to="/booth" variant="primary" size="lg" icon={<Camera weight="fill" size={22} />}>
              {t.home.start}
            </LinkButton>
            <LinkButton to="/gallery" variant="ghost" size="lg" icon={<ImagesSquare weight="bold" size={22} />}>
              {t.home.gallery}
            </LinkButton>
          </div>
          <p className="hero__note">{t.home.note}</p>
        </div>
        <div className="hero__art" aria-label={t.home.art} role="img">
          {photos &&
            heroStrips.map((s, i) => {
              const layout = layoutById(s.layout)
              return (
                <div key={s.layout} className={`hero__strip hero__strip--${i + 1}`}>
                  <CompositionCanvas
                    layout={layout}
                    design={{ ...base, ...s.design }}
                    photos={photos.slice(s.offset, s.offset + layout.shots)}
                    includeElements
                    displayHeight={i === 0 ? 470 : 330}
                    displayWidth={i === 0 ? 170 : 260}
                    label=""
                  />
                </div>
              )
            })}
        </div>
      </section>

      <section className="home-section" aria-labelledby="quick-title">
        <div className="home-section__head">
          <h2 id="quick-title">{t.home.quickTitle}</h2>
          <Link to="/booth/layout" className="text-link">
            {t.home.seeAll(layouts.length)} <ArrowRight weight="bold" size={16} aria-hidden="true" />
          </Link>
        </div>
        <ul className="quick-row">
          {quickLayouts.map((id) => {
            const l = layoutById(id)
            return (
              <li key={id}>
                <button type="button" className="quick-card" onClick={() => start(id)}>
                  <span className="quick-card__art">
                    {photos ? (
                      <CompositionCanvas lazy layout={l} design={quickDesigns.get(id)!} photos={photos.slice(0, l.shots)} includeElements emptyLabel={false} displayHeight={190} displayWidth={180} label="" />
                    ) : (
                      <span className="skeleton quick-card__skeleton" />
                    )}
                  </span>
                  <span className="quick-card__name">{l.name}</span>
                  <span className="quick-card__meta">{t.common.shots(l.shots)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="home-section home-film" aria-labelledby="filters-title">
        <div className="home-copy">
          <h2 id="filters-title">{t.home.filtersTitle}</h2>
          <p>{t.home.filtersText(filters.length)}</p>
        </div>
        <ul className="film" aria-label={t.home.filterExamples}>
          {demoFilters.map((id) => {
            const f = filters.find((x) => x.id === id)!
            return (
              <li key={id} className="film__frame">
                <span className="film__img">{demo ? <span className="filter-chip__sprite" style={thumbStyle(demo, id)} /> : <span className="skeleton" />}</span>
                <span className="film__name">{f.name}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="home-section home-stickers" aria-labelledby="stickers-title">
        <div className="home-copy">
          <h2 id="stickers-title">{t.home.stickersTitle}</h2>
          <p>{t.home.stickersText(stickers.length + wordPresets.length, frames.length)}</p>
          <LinkButton to="/booth" iconEnd={<ArrowRight weight="bold" size={18} />}>
            {t.home.makeOne}
          </LinkButton>
        </div>
        <div className="sheet">
          <ul className="sheet__grid" aria-label={t.home.stickerExamples}>
            {wall.map((id, i) => (
              <li key={id} style={{ rotate: `${((i * 37) % 30) - 15}deg` }}>
                <img src={stickerSrc(id)} alt="" width={72} height={72} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-section home-booth" aria-labelledby="booth-title">
        <h2 id="booth-title">{t.home.boothTitle}</h2>
        <dl className="home-booth__list">
          {t.home.features.map((f) => (
            <div key={f.title} className="home-booth__item">
              <dt>{f.title}</dt>
              <dd>{f.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="home-foot">
        <p>
          {t.home.footer}{' '}
          <a href="https://github.com/microsoft/fluentui-emoji" target="_blank" rel="noreferrer">
            Microsoft Fluent Emoji
          </a>
          . {t.home.footerModel}
        </p>
      </footer>
    </div>
  )
}
