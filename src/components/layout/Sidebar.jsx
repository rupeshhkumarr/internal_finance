import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { usePool } from '../../context/PoolContext'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/members', label: 'Members', icon: 'group' },
  { to: '/contributions', label: 'Contributions', icon: 'account_balance_wallet' },
  { to: '/receivables', label: 'Receivables', icon: 'trending_up' },
  { to: '/payables', label: 'Payables', icon: 'trending_down' },
  { to: '/ledger', label: 'Ledger', icon: 'book' },
  { to: '/reports', label: 'Reports & Summary', icon: 'analytics' },
]

export function Sidebar() {
  const { state, stats } = usePool()
  const { isAdmin, isCloudEnabled, profile, signOut } = useAuth()
  const overdueCount = stats.overdueReceivables.length

  return (
    <aside className="no-print fixed left-0 top-0 bottom-0 w-[280px] bg-[#0A0C10] border-r border-outline-variant/10 flex flex-col z-50">
      <div className="p-gutter flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary font-bold">Budget Pool</h1>
          <p className="text-label-caps font-label-caps text-on-surface-variant opacity-70 truncate max-w-[140px]">
            {state.settings?.orgName || 'Internal Team Budget'}
          </p>
        </div>
      </div>
      
      <nav className="flex-1 mt-8 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon }, index) => (
          <NavLink
            key={to}
            to={to}
            style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-6 py-4 transition-all duration-300 animate-fade-in-up group',
                isActive
                  ? 'sidebar-active text-primary'
                  : 'text-on-surface-variant hover:text-primary hover:bg-white/5'
              )
            }
          >
            <span 
              className={cn("material-symbols-outlined transition-transform duration-300", !window.location.pathname.startsWith(to) && "group-hover:scale-110")}
              style={{ fontVariationSettings: window.location.pathname.startsWith(to) ? "'FILL' 1" : "'FILL' 0" }}
            >
              {icon}
            </span>
            <span className="font-medium flex-1">{label}</span>
            {to === '/receivables' && overdueCount > 0 && (
              <span className="rounded-full bg-error-container text-on-error-container px-2 py-0.5 text-xs font-bold">
                {overdueCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-outline-variant/10 space-y-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group',
                isActive ? 'bg-white/5 text-primary' : 'text-on-surface-variant hover:text-primary'
              )
            }
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">admin_panel_settings</span>
            <span className="font-medium">Admin</span>
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group',
              isActive ? 'bg-white/5 text-primary' : 'text-on-surface-variant hover:text-primary'
            )
          }
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span>
          <span className="font-medium">Settings</span>
        </NavLink>
        
        {isCloudEnabled && (
          <div className="pt-4 border-t border-outline-variant/10 mt-2">
            <p className="text-xs text-on-surface-variant/70 truncate px-4 mb-2" title={profile?.email}>
              {profile?.email}
            </p>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/10 transition-all duration-300 group"
            >
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-error">logout</span>
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
