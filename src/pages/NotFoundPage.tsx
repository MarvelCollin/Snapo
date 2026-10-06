import { Camera, House } from '@phosphor-icons/react'
import { LinkButton } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="empty" aria-labelledby="nf-title">
      <img src="/stickers/ghost.webp" alt="" width={120} height={120} className="nf__ghost" />
      <h1 id="nf-title">This page floated away</h1>
      <p>The link might be old or mistyped. Let's get you back to the fun part.</p>
      <div className="hero__ctas">
        <LinkButton to="/booth" variant="primary" icon={<Camera weight="fill" size={20} />}>
          Open the booth
        </LinkButton>
        <LinkButton to="/" variant="ghost" icon={<House weight="bold" size={20} />}>
          Home
        </LinkButton>
      </div>
    </section>
  )
}
