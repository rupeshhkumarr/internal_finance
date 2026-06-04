import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePool } from '../../context/PoolContext'
import { globalSearch } from '../../utils/calculations'
import { cn } from '../../utils/cn'

export function Header() {
  const { state, stats } = usePool()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  const results = query.trim() ? globalSearch(state, query) : null
  const hasResults =
    results &&
    (results.members.length +
      results.contributions.length +
      results.payables.length +
      results.receivables.length >
      0)

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const overdue = stats.overdueReceivables.length

  return (
    <header className="no-print sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-outline-variant/5">
      {overdue > 0 && (
        <div className="bg-error-container border-b border-error/20 px-gutter py-2 text-sm text-on-error-container">
          <span className="material-symbols-outlined inline text-sm mr-2 align-text-bottom">notifications</span>
          {overdue} receivable{overdue > 1 ? 's are' : ' is'} overdue —{' '}
          <button
            type="button"
            className="font-bold underline text-primary"
            onClick={() => navigate('/receivables')}
          >
            Review now
          </button>
        </div>
      )}
      <div className="flex h-16 items-center justify-between px-gutter">
        <div ref={ref} className="relative flex-1 max-w-xl">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl pointer-events-none">search</span>
          <input
            type="search"
            placeholder="Search members, transactions, notes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all placeholder:text-on-surface-variant/50"
          />
          {open && query.trim() && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-outline-variant/20 bg-surface-container-high shadow-lg shadow-black/50 max-h-80 overflow-y-auto z-50">
              {!hasResults ? (
                <p className="p-4 text-sm text-on-surface-variant/70">No results found</p>
              ) : (
                <SearchResults results={results} members={state.members} onNavigate={(path) => {
                  navigate(path)
                  setOpen(false)
                  setQuery('')
                }} />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function SearchResults({ results, members, onNavigate }) {
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m.name]))

  return (
    <div className="py-2 text-sm">
      {results.members.length > 0 && (
        <Section title="Members">
          {results.members.map((m) => (
            <button
              key={m.id}
              type="button"
              className="block w-full px-4 py-2 text-left text-on-surface hover:bg-white/5 transition-colors"
              onClick={() => onNavigate(`/members?member=${m.id}`)}
            >
              {m.name}
            </button>
          ))}
        </Section>
      )}
      {results.contributions.length > 0 && (
        <Section title="Contributions">
          {results.contributions.slice(0, 5).map((c) => (
            <button
              key={c.id}
              type="button"
              className="block w-full px-4 py-2 text-left text-on-surface hover:bg-white/5 transition-colors"
              onClick={() => onNavigate('/contributions')}
            >
              {memberMap[c.memberId]} — ₹{c.amount}
            </button>
          ))}
        </Section>
      )}
      {results.receivables.length > 0 && (
        <Section title="Receivables">
          {results.receivables.slice(0, 5).map((r) => (
            <button
              key={r.id}
              type="button"
              className="block w-full px-4 py-2 text-left text-on-surface hover:bg-white/5 transition-colors"
              onClick={() => onNavigate('/receivables')}
            >
              {r.description}
            </button>
          ))}
        </Section>
      )}
      {results.payables.length > 0 && (
        <Section title="Payables">
          {results.payables.slice(0, 5).map((p) => (
            <button
              key={p.id}
              type="button"
              className="block w-full px-4 py-2 text-left text-on-surface hover:bg-white/5 transition-colors"
              onClick={() => onNavigate('/payables')}
            >
              {p.description}
            </button>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="px-4 py-2 text-xs font-label-caps uppercase text-on-surface-variant/70">{title}</p>
      {children}
    </div>
  )
}
