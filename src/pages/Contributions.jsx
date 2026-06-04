import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Download, CheckSquare } from 'lucide-react'
import { usePool } from '../context/PoolContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Select } from '../components/ui/Input'
import { ContributionForm } from '../components/forms/ContributionForm'
import { formatAmount, formatDate } from '../utils/calculations'
import { exportContributionsCsv } from '../utils/export'

export default function Contributions() {
  const { state, dispatch, symbol } = usePool()
  const { toast } = useToast()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selected, setSelected] = useState([])
  const [filters, setFilters] = useState({ member: '', status: '', method: '', search: '', sort: 'date-desc' })

  const memberMap = Object.fromEntries(state.members.map((m) => [m.id, m.name]))

  const filtered = useMemo(() => {
    let list = [...state.contributions]
    if (filters.member) list = list.filter((c) => c.memberId === filters.member)
    if (filters.status) list = list.filter((c) => c.status === filters.status)
    if (filters.method) list = list.filter((c) => c.method === filters.method)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (c) =>
          c.referenceNo?.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q) ||
          memberMap[c.memberId]?.toLowerCase().includes(q)
      )
    }
    const [field, dir] = filters.sort.split('-')
    list.sort((a, b) => {
      let cmp = 0
      if (field === 'date') cmp = new Date(a.date) - new Date(b.date)
      else if (field === 'amount') cmp = a.amount - b.amount
      else cmp = (memberMap[a.memberId] || '').localeCompare(memberMap[b.memberId] || '')
      return dir === 'desc' ? -cmp : cmp
    })
    return list
  }, [state.contributions, filters, memberMap])

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const bulkConfirm = () => {
    dispatch({ type: 'BULK_CONFIRM_CONTRIBUTIONS', ids: selected })
    toast(`${selected.length} contribution(s) confirmed ✓`)
    setSelected([])
  }

  return (
    <div className="space-y-section-margin">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Contributions</h1>
          <p className="text-body-md text-on-surface-variant/70">Money collected into the pool</p>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <>
              <Button variant="success" size="sm" onClick={bulkConfirm}>
                <CheckSquare className="h-4 w-4" /> Mark confirmed ({selected.length})
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportContributionsCsv(
                state.contributions.filter((c) => selected.includes(c.id)),
                state.members,
                symbol
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </>
          )}
          <Button onClick={() => setModal({ type: 'add' })} variant="primary">
            <Plus className="h-4 w-4" /> Add contribution
          </Button>
        </div>
      </div>

      <Card style={{ animationDelay: '0.2s' }}>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              placeholder="All members"
              value={filters.member}
              onChange={(e) => setFilters({ ...filters, member: e.target.value })}
              options={state.members.map((m) => ({ value: m.id, label: m.name }))}
            />
            <Select
              placeholder="All statuses"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
            <Select
              placeholder="All methods"
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              options={['cash', 'upi', 'bank_transfer', 'other'].map((m) => ({
                value: m,
                label: m.replace('_', ' '),
              }))}
            />
            <Input
              placeholder="Search ref / notes..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              options={[
                { value: 'date-desc', label: 'Date (newest)' },
                { value: 'date-asc', label: 'Date (oldest)' },
                { value: 'amount-desc', label: 'Amount (high)' },
                { value: 'member-asc', label: 'Member A–Z' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No contributions" description="Record money received into the pool." actionLabel="Add contribution" onAction={() => setModal({ type: 'add' })} />
      ) : (
        <Card style={{ animationDelay: '0.3s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant/10 text-on-surface-variant/70 text-xs font-label-caps uppercase">
                  <th className="p-gutter w-10" />
                  <th className="p-gutter font-medium">Date</th>
                  <th className="p-gutter font-medium">Member</th>
                  <th className="p-gutter font-medium text-right">Amount</th>
                  <th className="p-gutter font-medium">Method</th>
                  <th className="p-gutter font-medium">Reference</th>
                  <th className="p-gutter font-medium">Status</th>
                  <th className="p-gutter font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-gutter">
                      <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-outline-variant/20 bg-surface-container text-primary-container focus:ring-primary-container/30" />
                    </td>
                    <td className="p-gutter text-on-surface-variant">{formatDate(c.date)}</td>
                    <td className="p-gutter font-medium text-on-surface">{memberMap[c.memberId]}</td>
                    <td className="p-gutter text-right font-amount text-primary-container">{formatAmount(c.amount, symbol)}</td>
                    <td className="p-gutter capitalize text-on-surface-variant">{c.method?.replace('_', ' ')}</td>
                    <td className="p-gutter text-on-surface-variant/70">{c.referenceNo || '—'}</td>
                    <td className="p-gutter">
                      <Badge variant={c.status === 'confirmed' ? 'success' : 'warning'}>{c.status}</Badge>
                    </td>
                    <td className="p-gutter">
                      <div className="flex justify-end gap-1">
                        <button type="button" className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" onClick={() => setModal({ type: 'edit', ...c })}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1.5 rounded hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal?.type === 'add'} onClose={() => setModal(null)} title="Add contribution">
        <ContributionForm
          members={state.members}
          onSubmit={(data) => {
            dispatch({ type: 'ADD_CONTRIBUTION', payload: data })
            toast('Contribution added ✓')
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit contribution">
        <ContributionForm
          members={state.members}
          initial={modal}
          onSubmit={(data) => {
            dispatch({ type: 'UPDATE_CONTRIBUTION', payload: { id: modal.id, ...data } })
            toast('Contribution updated ✓')
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          dispatch({ type: 'DELETE_CONTRIBUTION', payload: deleteId })
          toast('Contribution deleted')
        }}
        title="Delete contribution"
        message="Remove this contribution record?"
        danger
      />
    </div>
  )
}
