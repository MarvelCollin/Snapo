import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, ImagesSquare, LockSimple } from '@phosphor-icons/react'
import { LinkButton } from '../components/ui/LinkButton'
import { CompositionCanvas } from '../components/shared/CompositionCanvas'
import { layoutById, layouts } from '../lib/layouts'
import { frameById, frames } from '../lib/frames'
import { filters } from '../lib/filters'
import { stickers, stickerSrc, wordPresets } from '../lib/stickers'
import { samplePhoto, samplePhotos } from '../lib/samples'
import { makeThumbs, thumbStyle, type FilterThumbs } from '../lib/filterThumbs'
import { defaultDesign, type CanvasEl, type Design } from '../store/design'
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

const quickLayouts = ['classic-4', 'twin-4', 'hearts', 'bubbles', 'polaroid', 'film-4']
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
  const quickDesign = useMemo(() => ({ ...base, elements: [], caption: 'snap snap' }), [base])

  const start = (id: string) => {
    setLayout(id)
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
          <p className="hero__note">
            <LockSimple weight="bold" size={16} aria-hidden="true" />
            {t.home.note}
          </p>
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
                      <CompositionCanvas layout={l} design={quickDesign} photos={photos.slice(0, l.shots)} displayHeight={190} displayWidth={180} label="" />
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

      <section className="home-section home-split" aria-labelledby="filters-title">
        <div className="home-split__text">
          <h2 id="filters-title">{t.home.filtersTitle(filters.length)}</h2>
          <p>{t.home.filtersText}</p>
        </div>
        <ul className="filter-demo" aria-label={t.home.filterExamples}>
          {demoFilters.map((id) => {
            const f = filters.find((x) => x.id === id)!
            return (
              <li key={id}>
                <span className="filter-demo__img">{demo ? <span className="filter-chip__sprite" style={thumbStyle(demo, id)} /> : <span className="skeleton" />}</span>
                <span className="filter-demo__name">{f.name}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="home-section home-split home-split--flip" aria-labelledby="stickers-title">
        <div className="home-split__text">
          <h2 id="stickers-title">{t.home.stickersTitle(stickers.length + wordPresets.length, frames.length)}</h2>
          <p>{t.home.stickersText}</p>
          <LinkButton to="/booth" variant="secondary" iconEnd={<ArrowRight weight="bold" size={18} />}>
            {t.home.makeOne}
          </LinkButton>
        </div>
        <ul className="sticker-wall" aria-label={t.home.stickerExamples}>
          {wall.map((id, i) => (
            <li key={id} style={{ transform: `rotate(${((i * 37) % 30) - 15}deg)` }}>
              <img src={stickerSrc(id)} alt="" width={72} height={72} loading="lazy" />
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section home-booth" aria-labelledby="booth-title">
        <div className="home-section__head">
          <h2 id="booth-title">{t.home.boothTitle}</h2>
          <p className="home-booth__lede">{t.home.boothText}</p>
        </div>
        <ul className="home-booth__list">
          {t.home.features.map((f) => (
            <li key={f.title} className="home-booth__item">
              <img src={stickerSrc(f.sticker)} alt="" width={56} height={56} loading="lazy" />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
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
