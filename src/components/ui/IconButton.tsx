import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Tooltip } from './Tooltip'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  icon: ReactNode
  tone?: 'plain' | 'paper' | 'danger'
  size?: 'sm' | 'md'
  pressed?: boolean
  tooltipSide?: 'top' | 'bottom'
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { label, icon, tone = 'paper', size = 'md', pressed, tooltipSide, className, type = 'button', ...rest },
  ref,
) {
  return (
    <Tooltip label={label} side={tooltipSide}>
      <button
        ref={ref}
        type={type}
        aria-label={label}
        aria-pressed={pressed}
        className={['icon-btn', `icon-btn--${tone}`, `icon-btn--${size}`, className ?? ''].join(' ')}
        {...rest}
      >
        {icon}
      </button>
    </Tooltip>
  )
})
