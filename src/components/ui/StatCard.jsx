import { cn } from '../../utils/cn'
import { formatAmount } from '../../utils/calculations'

export function StatCard({ label, value, symbol, icon: Icon, variant = 'default', subtext, delay = '0.2s' }) {
  return (
    <div className="glass-card shimmer-effect p-6 rounded-xl flex flex-col justify-between min-h-[140px] group animate-fade-in-up" style={{ animationDelay: delay }}>
      <div className="aurora-glow"></div>
      <div className="flex justify-between items-start relative z-10 mb-4">
        <span className="text-label-caps font-label-caps text-on-surface-variant/70">{label}</span>
        {Icon && (
          <Icon className="h-5 w-5 text-primary-container/60 group-hover:text-primary-container transition-all group-hover:scale-110" />
        )}
      </div>
      <div className="flex items-center gap-1 relative z-10 mt-auto">
        <span className="text-primary-container font-headline-sm text-2xl">{symbol}</span>
        <span className="text-on-surface font-headline-md glow-text font-amount">
          {typeof value === 'number' ? formatAmount(value, '').replace(symbol, '').trim() : value}
        </span>
      </div>
      {subtext && <p className="mt-2 text-xs text-on-surface-variant/50 relative z-10">{subtext}</p>}
    </div>
  )
}
