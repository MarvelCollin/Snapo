import { useT } from '../../i18n'
import { Slider } from '../ui/Slider'

type Props = { value: number; onChange: (v: number) => void }

export function BeautySlider({ value, onChange }: Props) {
  const t = useT()
  return (
    <div className="panel-stack panel-stack--tight">
      <Slider
        label={t.look.beauty}
        value={Math.round(value * 100)}
        onChange={(v) => onChange(v / 100)}
        format={(v) => (v === 0 ? t.look.beautyOff : `${v}%`)}
      />
      <p className="field__hint">{t.look.beautyHint}</p>
    </div>
  )
}
