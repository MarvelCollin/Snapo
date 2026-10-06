import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClass, type ButtonSize, type ButtonVariant } from '../../lib/buttonClass'

type Props = LinkProps & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconEnd?: ReactNode
  block?: boolean
}

export function LinkButton({ variant = 'secondary', size = 'md', icon, iconEnd, block, className, children, ...rest }: Props) {
  return (
    <Link className={buttonClass(variant, size, block, className)} {...rest}>
      {icon}
      {children && <span>{children}</span>}
      {iconEnd}
    </Link>
  )
}
