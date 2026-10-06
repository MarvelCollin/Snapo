import { Camera, House } from '@phosphor-icons/react'
import { LinkButton } from '../components/ui/LinkButton'
import { useT } from '../i18n'

export default function NotFoundPage() {
  const t = useT()
  return (
    <section className="empty" aria-labelledby="nf-title">
      <img src="/stickers/ghost.webp" alt="" width={120} height={120} className="nf__ghost" />
      <h1 id="nf-title">{t.notFound.title}</h1>
      <p>{t.notFound.text}</p>
      <div className="hero__ctas">
        <LinkButton to="/booth" variant="primary" icon={<Camera weight="fill" size={20} />}>
          {t.notFound.openBooth}
        </LinkButton>
        <LinkButton to="/" variant="ghost" icon={<House weight="bold" size={20} />}>
          {t.notFound.home}
        </LinkButton>
      </div>
    </section>
  )
}
