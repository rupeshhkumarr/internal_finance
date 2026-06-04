import { cn } from '../../utils/cn'

const styles = {
  default: 'bg-surface-variant/30 text-surface-tint border border-surface-variant',
  success: 'bg-primary/10 text-primary border border-primary/20',
  danger: 'bg-error-container/30 text-error border border-error-container/50',
  warning: 'bg-surface-variant/30 text-surface-tint border border-surface-variant',
  info: 'bg-white/5 text-on-surface border border-outline-variant/20',
  outline: 'border border-outline-variant/20 text-on-surface-variant bg-transparent',
}

export function Badge({ className, variant = 'default', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
