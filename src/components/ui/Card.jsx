import { cn } from '../../utils/cn'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('glass-card rounded-xl animate-fade-in-up', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cn('border-b border-outline-variant/10 p-gutter relative z-10 flex justify-between items-center', className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-headline-sm font-headline-sm text-on-surface', className)}>{children}</h3>
}

export function CardContent({ className, children }) {
  return <div className={cn('p-gutter relative z-10', className)}>{children}</div>
}
