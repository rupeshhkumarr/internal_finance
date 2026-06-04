import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, Printer } from 'lucide-react'
import { usePool } from '../context/PoolContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input, Select } from '../components/ui/Input'
import {
  formatAmount,
  getTotalCollected,
  getPoolBalance,
  getMemberContributed,
  getMemberPendingReceivable,
  getMemberReimbursementsDue,
  getMonthlyData,
  filterByPeriod,
} from '../utils/calculations'
import { exportReportCsv } from '../utils/export'

const COLORS = ['#FFD700', '#ffb4ab', '#81c995', '#8b5cf6', '#60a5fa']

export default function Reports() {
  const { state, symbol, stats } = usePool()
  const [period, setPeriod] = useState('this_month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const customRange = period === 'custom' ? { start: customStart, end: customEnd } : null

  const periodContributions = useMemo(
    () => filterByPeriod(state.contributions.filter((c) => c.status === 'confirmed'), 'date', period, customRange),
    [state.contributions, period, customStart, customEnd]
  )
  const periodPayables = useMemo(
    () => filterByPeriod(state.payables.filter((p) => p.status === 'paid' || p.status === 'reimbursed'), 'date', period, customRange),
    [state.payables, period, customStart, customEnd]
  )

  const totalIn = periodContributions.reduce((s, c) => s + c.amount, 0)
  const totalOut = periodPayables.reduce((s, p) => s + p.amount, 0)
  const monthly = getMonthlyData(state.contributions, state.payables, 12)

  const categoryData = useMemo(() => {
    const sums = {}
    periodPayables.forEach((p) => {
      sums[p.category] = (sums[p.category] || 0) + p.amount
    })
    return Object.entries(sums).map(([name, value]) => ({ name, value }))
  }, [periodPayables])

  const memberRows = state.members
    .filter((m) => m.status === 'active')
    .map((m) => {
      const contributed = getMemberContributed(m.id, state.contributions)
      const receivable = getMemberPendingReceivable(m.id, state.receivables)
      const reimburse = getMemberReimbursementsDue(m.id, state.payables)
      const net = contributed - receivable + reimburse
      return {
        'Member Name': m.name,
        Target: m.targetAmount || '—',
        Contributed: contributed,
        'Receivable Pending': receivable,
        'Reimbursements Due': reimburse,
        'Net Position': net,
      }
    })

  const memberBar = state.members
    .filter((m) => m.status === 'active')
    .map((m) => ({
      name: m.name.split(' ')[0],
      contributed: getMemberContributed(m.id, state.contributions),
    }))

  const tooltipStyle = {
    backgroundColor: '#111318',
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#e2e2e9',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
  }

  return (
    <div className="space-y-section-margin">
      <div className="flex flex-wrap justify-between gap-4 no-print animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Reports & Summary</h1>
          <p className="text-body-md text-on-surface-variant/70">Pool analytics and exports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReportCsv(memberRows, 'member-summary')}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <Card className="no-print" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-gutter flex flex-wrap gap-3 items-end">
          <Select
            label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'this_month', label: 'This Month' },
              { value: 'last_month', label: 'Last Month' },
              { value: 'this_quarter', label: 'This Quarter' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
          {period === 'custom' && (
            <>
              <Input label="From" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <Input label="To" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </>
          )}
        </CardContent>
      </Card>

      <Card style={{ animationDelay: '0.3s' }}>
        <CardHeader><CardTitle>Pool summary</CardTitle></CardHeader>
        <CardContent className="p-gutter pt-0">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-label-caps font-label-caps text-on-surface-variant/70">Opening balance</p>
              <p className="mt-1 text-xl font-amount font-semibold text-on-surface">{formatAmount(state.settings?.openingBalance || 0, symbol)}</p>
            </div>
            <div>
              <p className="text-label-caps font-label-caps text-on-surface-variant/70">Total in (period)</p>
              <p className="mt-1 text-xl font-amount font-semibold text-primary-container">{formatAmount(totalIn, symbol)}</p>
            </div>
            <div>
              <p className="text-label-caps font-label-caps text-on-surface-variant/70">Total out (period)</p>
              <p className="mt-1 text-xl font-amount font-semibold text-error">{formatAmount(totalOut, symbol)}</p>
            </div>
            <div>
              <p className="text-label-caps font-label-caps text-on-surface-variant/70">Current balance</p>
              <p className="mt-1 text-xl font-amount font-semibold text-on-surface">
                {formatAmount(getPoolBalance(state.contributions, state.payables, state.settings), symbol)}
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs text-on-surface-variant/50">
            All-time collected: {formatAmount(getTotalCollected(state.contributions), symbol)}
          </p>
        </CardContent>
      </Card>

      <Card style={{ animationDelay: '0.4s' }}>
        <CardHeader><CardTitle>Per-member summary</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant/10 text-on-surface-variant/70 text-xs font-label-caps uppercase">
                <th className="p-gutter font-medium">Member</th>
                <th className="p-gutter font-medium text-right">Target</th>
                <th className="p-gutter font-medium text-right">Contributed</th>
                <th className="p-gutter font-medium text-right">Receivable</th>
                <th className="p-gutter font-medium text-right">Reimb. due</th>
                <th className="p-gutter font-medium text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {memberRows.map((row) => (
                <tr key={row['Member Name']} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-gutter font-medium text-on-surface">{row['Member Name']}</td>
                  <td className="p-gutter text-right font-amount text-on-surface-variant">{typeof row.Target === 'number' ? formatAmount(row.Target, symbol) : row.Target}</td>
                  <td className="p-gutter text-right font-amount text-primary-container">{formatAmount(row.Contributed, symbol)}</td>
                  <td className="p-gutter text-right font-amount text-error">{formatAmount(row['Receivable Pending'], symbol)}</td>
                  <td className="p-gutter text-right font-amount text-on-surface-variant">{formatAmount(row['Reimbursements Due'], symbol)}</td>
                  <td className={`p-gutter text-right font-amount font-semibold ${row['Net Position'] >= 0 ? 'text-primary-container' : 'text-error'}`}>
                    {formatAmount(row['Net Position'], symbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-card-gap lg:grid-cols-2 no-print">
        <Card style={{ animationDelay: '0.5s' }}>
          <CardHeader><CardTitle>Monthly contribution trend</CardTitle></CardHeader>
          <CardContent className="p-gutter pt-0">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={{ stroke: 'rgba(255,255,255,0.1)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={{ stroke: 'rgba(255,255,255,0.1)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatAmount(v, symbol)} />
                <Line type="monotone" dataKey="contributions" stroke="#FFD700" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card style={{ animationDelay: '0.6s' }}>
          <CardHeader><CardTitle>Category spend (period)</CardTitle></CardHeader>
          <CardContent className="p-gutter pt-0">
            {categoryData.length === 0 ? (
              <p className="text-body-md text-on-surface-variant/50 text-center py-8">No payables in period</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="rgba(255,255,255,0.05)">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatAmount(v, symbol)} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="no-print" style={{ animationDelay: '0.7s' }}>
        <CardHeader><CardTitle>Member contribution comparison</CardTitle></CardHeader>
        <CardContent className="p-gutter pt-0">
          <ResponsiveContainer width="100%" height={Math.max(200, memberBar.length * 40)}>
            <BarChart data={memberBar} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={{ stroke: 'rgba(255,255,255,0.1)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis type="category" dataKey="name" width={55} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatAmount(v, symbol)} />
              <Bar dataKey="contributed" fill="#FFD700" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
