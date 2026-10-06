import { LinkButton } from '../components/ui/Button'

export function HomePage() {
  return (
    <section className="step">
      <h1>Snapo</h1>
      <LinkButton to="/booth" variant="primary">Start shooting</LinkButton>
    </section>
  )
}
