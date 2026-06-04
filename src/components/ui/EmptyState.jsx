import { Button } from './Button'

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-6 w-16 h-16 rounded-full border-2 border-dashed border-outline-variant/20 mx-auto flex items-center justify-center">
          <Icon className="h-8 w-8 text-outline-variant" />
        </div>
      )}
      <h3 className="text-headline-sm font-headline-sm text-on-surface">{title}</h3>
      <p className="mt-2 max-w-sm font-body-md text-on-surface-variant/70 italic">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-8" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
