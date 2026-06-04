import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ReadOnlyBanner } from './ReadOnlyBanner'
import { usePool } from '../../context/PoolContext'
import { PageSkeleton } from '../ui/Skeleton'
import { formatDateTime } from '../../utils/calculations'

export function Layout() {
  const { loading, state, isCloud } = usePool()

  if (loading) {
    return (
      <div className="min-h-screen bg-background pl-[280px]">
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>
        <PageSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>
      
      <Sidebar />
      <div className="pl-[280px] flex flex-col min-h-screen">
        <Header />
        <ReadOnlyBanner />
        <main className="flex-1 p-gutter space-y-card-gap">
          <Outlet />
        </main>
        <footer className="no-print border-t border-outline-variant/10 px-gutter py-4 text-xs text-on-surface-variant/50">
          Last saved: {state.lastSaved ? formatDateTime(state.lastSaved) : '—'} ·{' '}
          {isCloud ? 'Shared cloud data (all users see the same pool)' : 'Stored locally in this browser only'}
        </footer>
      </div>
    </div>
  )
}
