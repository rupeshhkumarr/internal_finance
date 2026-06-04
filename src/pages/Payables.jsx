import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { usePool } from '../context/PoolContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Select } from '../components/ui/Input'
import { PayableForm } from '../components/forms/PayableForm'
import { formatAmount, formatDate } from '../utils/calculations'

const categories = ['food', 'travel', 'office', 'utility', 'misc']

export default function Payables() {
  const { state, dispatch, symbol } = usePool()
  const { toast } = useToast()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const memberMap = Object.fromEntries(state.members.map((m) => [m.id, m.name]))

  const categorySummary = useMemo(() => {
    const sums = {}
    categories.forEach((c) => { sums[c] = 0 })
    state.payables.forEach((p) => {
      if (p.status === 'paid' || p.status === 'reimbursed') {
        sums[p.category] = (sums[p.category] || 0) + p.amount
      }
    })
    return sums
  }, [state.payables])

  const filtered = state.payables.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false
    if (statusFilter && p.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-section-margin">
      <div className="flex justify-between animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Payables</h1>
          <p className="text-body-md text-on-surface-variant/70">Pool expenses and reimbursements</p>
        </div>
        <Button onClick={() => setModal({ type: 'add' })} variant="primary">
          <Plus className="h-4 w-4" /> Add payable
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {categories.map((cat) => (
          <Card key={cat}>
            <CardContent className="p-gutter">
              <p className="text-label-caps font-label-caps text-on-surface-variant/70">{cat}</p>
              <p className="font-amount font-semibold text-on-surface mt-1">{formatAmount(categorySummary[cat] || 0, symbol)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card style={{ animationDelay: '0.3s' }}>
        <CardContent className="flex gap-3 flex-wrap p-gutter">
          <Select
            placeholder="All categories"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <Select
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'reimbursed', label: 'Reimbursed' },
            ]}
          />
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No payables" description="Record expenses paid from the pool." actionLabel="Add payable" onAction={() => setModal({ type: 'add' })} />
      ) : (
        <Card style={{ animationDelay: '0.4s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant/10 text-on-surface-variant/70 text-xs font-label-caps uppercase">
                  <th className="p-gutter font-medium">Date</th>
                  <th className="p-gutter font-medium">Description</th>
                  <th className="p-gutter font-medium">Category</th>
                  <th className="p-gutter font-medium text-right">Amount</th>
                  <th className="p-gutter font-medium">Paid to</th>
                  <th className="p-gutter font-medium">Paid by</th>
                  <th className="p-gutter font-medium">Status</th>
                  <th className="p-gutter font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-gutter text-on-surface-variant">{formatDate(p.date)}</td>
                    <td className="p-gutter font-medium text-on-surface">{p.description}</td>
                    <td className="p-gutter capitalize text-on-surface-variant">{p.category}</td>
                    <td className="p-gutter text-right font-amount text-error">{formatAmount(p.amount, symbol)}</td>
                    <td className="p-gutter text-on-surface-variant">{p.paidTo || '—'}</td>
                    <td className="p-gutter text-on-surface-variant">{p.paidById ? memberMap[p.paidById] : '—'}</td>
                    <td className="p-gutter">
                      <Badge variant={p.status === 'reimbursed' ? 'success' : p.status === 'pending' ? 'warning' : 'default'}>
                        {p.paidById && p.status === 'pending' ? 'Pending reimbursement' : p.status}
                      </Badge>
                    </td>
                    <td className="p-gutter">
                      <div className="flex justify-end gap-1">
                        {p.paidById && p.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              dispatch({ type: 'UPDATE_PAYABLE', payload: { id: p.id, status: 'reimbursed' } })
                              toast('Marked as reimbursed ✓')
                            }}
                          >
                            Reimburse
                          </Button>
                        )}
                        <button type="button" className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" onClick={() => setModal({ type: 'edit', ...p })}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1.5 rounded hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors" onClick={() => setDeleteId(p.id)}>
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

      <Modal open={modal?.type === 'add'} onClose={() => setModal(null)} title="Add payable" size="lg">
        <PayableForm
          members={state.members}
          onSubmit={(data) => {
            dispatch({ type: 'ADD_PAYABLE', payload: data })
            toast('Payable added ✓')
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit payable" size="lg">
        <PayableForm
          members={state.members}
          initial={modal}
          onSubmit={(data) => {
            dispatch({ type: 'UPDATE_PAYABLE', payload: { id: modal.id, ...data } })
            toast('Payable updated ✓')
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          dispatch({ type: 'DELETE_PAYABLE', payload: deleteId })
          toast('Payable deleted')
        }}
        title="Delete payable"
        message="Remove this expense record?"
        danger
      />
    </div>
  )
}
