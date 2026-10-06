import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint'
type Size = 'sm' | 'md' | 'lg'

type Common = {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconEnd?: ReactNode
  block?: boolean
}

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }

const cls = (variant: Variant, size: Size, block?: boolean, extra?: string) =>
  ['btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', extra ?? ''].filter(Boolean).join(' ')

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, iconEnd, block, loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cls(variant, size, block, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon}
      {children && <span>{children}</span>}
      {iconEnd}
    </button>
  )
})

type LinkButtonProps = Common & LinkProps

export function LinkButton({ variant = 'secondary', size = 'md', icon, iconEnd, block, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link className={cls(variant, size, block, className)} {...rest}>
      {icon}
      {children && <span>{children}</span>}
      {iconEnd}
    </Link>
  )
}
