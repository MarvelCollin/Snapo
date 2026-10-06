import { useId } from 'react'

type Props = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}

export function Switch({ label, checked, onChange, hint }: Props) {
  const id = useId()
  return (
    <div className="switch-row">
      <span className="switch-row__text">
        <span id={`${id}-l`} className="field__label">
          {label}
        </span>
        {hint && (
          <span id={`${id}-h`} className="field__hint">
            {hint}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={hint ? `${id}-h` : undefined}
        className="switch"
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" aria-hidden="true" />
      </button>
    </div>
  )
}
