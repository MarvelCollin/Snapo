export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const buttonClass = (variant: ButtonVariant, size: ButtonSize, block?: boolean, extra?: string) =>
  ['btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', extra ?? ''].filter(Boolean).join(' ')
