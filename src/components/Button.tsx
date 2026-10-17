import type { ButtonHTMLAttributes } from 'react'

export function Button({ variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <button type="button" className={'button button-' + variant + ' ' + className} {...props} />
}
