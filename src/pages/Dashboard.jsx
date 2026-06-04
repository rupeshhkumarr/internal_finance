import {
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
import { Wallet, TrendingUp, AlertCircle, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { usePool } from '../context/PoolContext'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import {
  formatAmount,
  formatDateTime,
  getMonthlyData,
  getMemberShare,
} from '../utils/calculations'
import { getRecentActivity } from '../utils/ledger'
import { cn } from '../utils/cn'

const COLORS = ['#FFD700', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

export default function Dashboard() {
  const { state, stats, ledger, symbol, getMember } = usePool()
  const { members, contributions, payables } = state

  const monthly = getMonthlyData(contributions, payables)
  const share = getMemberShare(members, contributions)
  const activity = getRecentActivity(ledger, 10)

  const activityColor = (entry) => {
    if (entry.credit > 0) return 'text-primary-container'
    if (entry.debit > 0) return 'text-error'
    return 'text-amber-500'
  }

  const tooltipStyle = {
    backgroundColor: '#1f1b10',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#eae2cf'
  }

  return (
    <div className="space-y-section-margin">
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-headline-md font-headline-md text-on-surface">Dashboard</h2>
        <p className="text-body-md font-body-md text-on-surface-variant">Pool overview and recent activity</p>
      </div>

      <div className="grid gap-card-gap sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pool Balance" value={stats.poolBalance} symbol={symbol} icon={Wallet} delay="0.2s" />
        <StatCard label="Total Collected" value={stats.totalCollected} symbol={symbol} icon={TrendingUp} delay="0.3s" />
        <StatCard label="Total Receivables" value={stats.totalReceivables} symbol={symbol} icon={AlertCircle} delay="0.4s" />
        <StatCard label="Total Payables" value={stats.totalPayables} symbol={symbol} icon={CreditCard} delay="0.5s" />
      </div>

      <div className="grid gap-card-gap lg:grid-cols-2">
        <Card className="min-h-[400px] flex flex-col" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle>Contribution share</CardTitle>
            <PieChart className="text-on-surface-variant/50 w-5 h-5" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            {share.length === 0 ? (
              <div className="text-center">
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-outline-variant/20 mx-auto flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-outline-variant text-5xl">incomplete_circle</span>
                </div>
                <p className="text-on-surface-variant font-body-md italic opacity-60">No contributions yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={share} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} stroke="none">
                    {share.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#eae2cf' }} formatter={(v) => formatAmount(v, symbol)} />
                  <Legend wrapperStyle={{ color: '#eae2cf', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[400px] flex flex-col" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle>Monthly in vs out (6 months)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#eae2cf' }} formatter={(v) => formatAmount(v, symbol)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend wrapperStyle={{ color: '#eae2cf', fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="contributions" name="Contributions" fill="#FFD700" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payables" name="Payables" fill="#ffb4ab" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card style={{ animationDelay: '0.8s' }}>
        <CardHeader>
          <CardTitle>Member contribution targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.filter((m) => m.status === 'active' && m.targetAmount).map((m) => {
            const contributed = state.contributions
              .filter((c) => c.memberId === m.id && c.status === 'confirmed')
              .reduce((s, c) => s + c.amount, 0)
            const pct = Math.min(100, Math.round((contributed / m.targetAmount) * 100))
            return (
              <div key={m.id} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-on-surface">{m.name}</span>
                  <span className="font-amount text-on-surface-variant font-data-lg text-sm">
                    {formatAmount(contributed, symbol)} <span className="opacity-50">/ {formatAmount(m.targetAmount, symbol)}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-container transition-all group-hover:brightness-125"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card style={{ animationDelay: '0.9s' }}>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-outline-variant/5">
            {activity.map((entry) => (
              <li key={entry.id} className="flex items-center gap-4 py-3 first:pt-0 group hover:bg-white/[0.02] transition-colors -mx-gutter px-gutter">
                <div className={cn('rounded-full p-2 bg-surface-container-high border border-outline-variant/20', activityColor(entry))}>
                  {entry.credit > 0 ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : entry.debit > 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{entry.description}</p>
                  <p className="text-xs text-on-surface-variant/70">
                    {entry.memberId ? getMember(entry.memberId)?.name : '—'} · {formatDateTime(entry.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  {entry.credit > 0 && (
                    <span className="font-amount text-sm text-primary-container">+{formatAmount(entry.credit, symbol)}</span>
                  )}
                  {entry.debit > 0 && (
                    <span className="font-amount text-sm text-error">-{formatAmount(entry.debit, symbol)}</span>
                  )}
                  {entry.credit === 0 && entry.debit === 0 && (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
