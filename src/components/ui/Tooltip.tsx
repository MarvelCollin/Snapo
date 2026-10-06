import { useId, useState, type ReactElement, cloneElement, type HTMLAttributes } from 'react'

type Props = {
  label: string
  children: ReactElement<HTMLAttributes<HTMLElement>>
  side?: 'top' | 'bottom'
}

export function Tooltip({ label, children, side = 'top' }: Props) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const child = cloneElement(children, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      setOpen(true)
      children.props.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      setOpen(false)
      children.props.onMouseLeave?.(e)
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      setOpen(true)
      children.props.onFocus?.(e)
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      setOpen(false)
      children.props.onBlur?.(e)
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') setOpen(false)
      children.props.onKeyDown?.(e)
    },
  })
  return (
    <span className="tooltip-anchor">
      {child}
      {open && (
        <span role="tooltip" id={id} className={`tooltip tooltip--${side}`}>
          {label}
        </span>
      )}
    </span>
  )
}
