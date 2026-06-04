import { useState, useMemo } from 'react'
import { Download, Printer } from 'lucide-react'
import { usePool } from '../context/PoolContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input, Select } from '../components/ui/Input'
import { formatAmount, formatDateTime } from '../utils/calculations'
import { exportLedgerCsv } from '../utils/export'

const typeLabels = {
  contribution: 'Contribution',
  payable: 'Payable',
  receivable_created: 'Receivable Created',
  receivable_waived: 'Receivable Waived',
  reimbursement: 'Reimbursement',
}

export default function Ledger() {
  const { ledger, state, symbol } = usePool()
  const [typeFilter, setTypeFilter] = useState('')
  const [memberFilter, setMemberFilter] = useState('')
  const [search, setSearch] = useState('')

  const memberMap = Object.fromEntries(state.members.map((m) => [m.id, m.name]))

  const filtered = useMemo(() => {
    return ledger.filter((e) => {
      if (typeFilter && e.type !== typeFilter) return false
      if (memberFilter && e.memberId !== memberFilter) return false
      if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [ledger, typeFilter, memberFilter, search])

  const handlePrint = () => window.print()

  return (
    <div className="space-y-section-margin">
      <div className="flex flex-wrap justify-between gap-4 no-print animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Ledger</h1>
          <p className="text-body-md text-on-surface-variant/70">Full audit log — read only</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportLedgerCsv(filtered, state.members)}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div className="print-only mb-4 text-on-surface">
        <h1 className="text-xl font-bold">Budget Pool Ledger</h1>
        <p className="text-sm">{state.settings?.orgName}</p>
      </div>

      <Card className="no-print" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-gutter">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              placeholder="All types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))}
            />
            <Select
              placeholder="All members"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              options={state.members.map((m) => ({ value: m.id, label: m.name }))}
            />
            <Input placeholder="Search description..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card style={{ animationDelay: '0.3s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant/10 text-on-surface-variant/70 text-xs font-label-caps uppercase">
                <th className="p-gutter font-medium">#</th>
                <th className="p-gutter font-medium">Date & time</th>
                <th className="p-gutter font-medium">Type</th>
                <th className="p-gutter font-medium">Member</th>
                <th className="p-gutter font-medium">Description</th>
                <th className="p-gutter font-medium text-right">Debit</th>
                <th className="p-gutter font-medium text-right">Credit</th>
                <th className="p-gutter font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-gutter text-on-surface-variant/70">{e.seq}</td>
                  <td className="p-gutter text-on-surface-variant whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
                  <td className="p-gutter">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-surface-variant/30 text-surface-tint border border-surface-variant">{typeLabels[e.type] || e.type}</span>
                  </td>
                  <td className="p-gutter font-medium text-on-surface">{e.memberId ? memberMap[e.memberId] : '—'}</td>
                  <td className="p-gutter text-on-surface max-w-xs">{e.description}</td>
                  <td className="p-gutter text-right font-amount text-error">
                    {e.debit > 0 ? formatAmount(e.debit, symbol) : '—'}
                  </td>
                  <td className="p-gutter text-right font-amount text-primary-container">
                    {e.credit > 0 ? formatAmount(e.credit, symbol) : '—'}
                  </td>
                  <td className="p-gutter text-right font-amount font-medium text-on-surface">{formatAmount(e.balance, symbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
