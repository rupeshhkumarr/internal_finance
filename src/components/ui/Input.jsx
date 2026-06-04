import { cn } from '../../utils/cn'

export function Input({ className, label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-on-surface-variant">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all',
          error && 'border-error focus:border-error focus:ring-error/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

export function Textarea({ className, label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-on-surface-variant">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 min-h-[80px] focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all',
          error && 'border-error focus:border-error focus:ring-error/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

export function Select({ className, label, error, options = [], placeholder, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-on-surface-variant">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all',
          error && 'border-error focus:border-error focus:ring-error/20',
          className
        )}
        {...props}
      >
        {placeholder && <option value="" className="bg-surface-container-low">{placeholder}</option>}
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt} className="bg-surface-container-low text-on-surface">
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value} className="bg-surface-container-low text-on-surface">
              {opt.label}
            </option>
          )
        )}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
