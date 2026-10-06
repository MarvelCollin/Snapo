import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  icon?: ReactNode
  hideLabel?: boolean
}

export function TextField({ label, value, onChange, hint, icon, hideLabel, ...rest }: Props) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : 'field__label'}>
        {label}
      </label>
      <div className={`text-input ${icon ? 'text-input--icon' : ''}`}>
        {icon && <span className="text-input__icon">{icon}</span>}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          autoComplete="off"
          {...rest}
        />
      </div>
      {hint && (
        <span id={`${id}-hint`} className="field__hint">
          {hint}
        </span>
      )}
    </div>
  )
}
