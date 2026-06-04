import { cn } from '../../utils/cn'

const variants = {
  primary: 'pulse-btn bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20 hover:brightness-110 font-label-caps uppercase',
  secondary: 'bg-white/5 border border-outline-variant/20 text-on-surface hover:bg-white/10',
  outline: 'border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-white/5',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-white/5',
  danger: 'bg-error-container text-on-error-container hover:brightness-110',
  success: 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
