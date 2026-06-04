import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle, Bell, Ban } from 'lucide-react'
import { usePool } from '../context/PoolContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { ReceivableForm } from '../components/forms/ReceivableForm'
import { ContributionForm } from '../components/forms/ContributionForm'
import { formatAmount, formatDate, daysOverdue } from '../utils/calculations'
import { cn } from '../utils/cn'

const statusVariant = {
  pending: 'warning',
  partially_paid: 'info',
  paid: 'success',
  waived: 'outline',
}

export default function Receivables() {
  const { state, dispatch, symbol, stats } = usePool()
  const { toast } = useToast()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [payReceivable, setPayReceivable] = useState(null)
  const [waiveId, setWaiveId] = useState(null)
  const [waiveReason, setWaiveReason] = useState('')

  const memberMap = Object.fromEntries(state.members.map((m) => [m.id, m.name]))
  const overdue = stats.overdueReceivables
  const oldest = overdue.length
    ? overdue.reduce((a, b) => (daysOverdue(a.dueDate) > daysOverdue(b.dueDate) ? a : b))
    : null

  const copyReminder = (r) => {
    const name = memberMap[r.memberId]
    const owed = r.amount - (r.amountPaid || 0)
    const text = `Hi ${name}, reminder: ₹${owed.toLocaleString('en-IN')} is due for "${r.description}" (due ${formatDate(r.dueDate)}). Please pay at your earliest.`
    navigator.clipboard.writeText(text)
    toast('Reminder copied to clipboard', 'info')
  }

  return (
    <div className="space-y-section-margin">
      <div className="flex justify-between items-start animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Receivables</h1>
          <p className="text-body-md text-on-surface-variant/70">Amounts owed to the pool</p>
        </div>
        <Button onClick={() => setModal({ type: 'add' })} variant="primary">
          <Plus className="h-4 w-4" /> Add receivable
        </Button>
      </div>

      <div className="grid gap-card-gap sm:grid-cols-3">
        <Card style={{ animationDelay: '0.2s' }}>
          <CardContent className="pt-6">
            <p className="text-label-caps font-label-caps text-error">Total outstanding</p>
            <p className="mt-2 text-2xl font-amount font-bold text-error">{formatAmount(stats.totalReceivables, symbol)}</p>
          </CardContent>
        </Card>
        <Card style={{ animationDelay: '0.3s' }}>
          <CardContent className="pt-6">
            <p className="text-label-caps font-label-caps text-on-surface-variant/70">Overdue items</p>
            <p className="mt-2 text-2xl font-bold text-error">{overdue.length}</p>
          </CardContent>
        </Card>
        <Card style={{ animationDelay: '0.4s' }}>
          <CardContent className="pt-6">
            <p className="text-label-caps font-label-caps text-on-surface-variant/70">Oldest overdue</p>
            <p className="mt-2 text-sm font-medium text-on-surface">
              {oldest ? `${memberMap[oldest.memberId]} — ${daysOverdue(oldest.dueDate)} days` : 'None'}
            </p>
          </CardContent>
        </Card>
      </div>

      {state.receivables.length === 0 ? (
        <EmptyState title="No receivables" description="Track what members owe the pool." actionLabel="Add receivable" onAction={() => setModal({ type: 'add' })} />
      ) : (
        <Card style={{ animationDelay: '0.5s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant/10 text-on-surface-variant/70 text-xs font-label-caps uppercase">
                  <th className="p-gutter font-medium">Member</th>
                  <th className="p-gutter font-medium text-right">Amount due</th>
                  <th className="p-gutter font-medium">Due date</th>
                  <th className="p-gutter font-medium">Overdue</th>
                  <th className="p-gutter font-medium">Status</th>
                  <th className="p-gutter font-medium">Notes</th>
                  <th className="p-gutter font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {state.receivables.map((r) => {
                  const overdueDays = daysOverdue(r.dueDate)
                  const isOverdue =
                    overdueDays > 0 && (r.status === 'pending' || r.status === 'partially_paid')
                  const remaining = r.amount - (r.amountPaid || 0)
                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        'hover:bg-white/[0.02] transition-colors group',
                        isOverdue && 'bg-error-container/5 hover:bg-error-container/10'
                      )}
                    >
                      <td className="p-gutter font-medium text-on-surface">{memberMap[r.memberId]}</td>
                      <td className="p-gutter text-right font-amount text-primary-container">{formatAmount(remaining, symbol)}</td>
                      <td className="p-gutter text-on-surface-variant">{formatDate(r.dueDate)}</td>
                      <td className="p-gutter">
                        {isOverdue ? (
                          <Badge variant="danger">{overdueDays} days overdue</Badge>
                        ) : (
                          <span className="text-on-surface-variant/50">—</span>
                        )}
                      </td>
                      <td className="p-gutter">
                        <Badge variant={statusVariant[r.status]}>{r.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="p-gutter text-on-surface-variant/70 max-w-[160px] truncate">{r.description}</td>
                      <td className="p-gutter">
                        <div className="flex justify-end gap-1 flex-wrap">
                          {r.status !== 'paid' && r.status !== 'waived' && (
                            <>
                              <button type="button" title="Mark paid" className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" onClick={() => setPayReceivable(r)}>
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button type="button" title="Reminder" className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" onClick={() => copyReminder(r)}>
                                <Bell className="h-4 w-4" />
                              </button>
                              <button type="button" title="Waive" className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" onClick={() => setWaiveId(r.id)}>
                                <Ban className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button type="button" className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" onClick={() => setModal({ type: 'edit', ...r })}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" className="p-1.5 rounded hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors" onClick={() => setDeleteId(r.id)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal?.type === 'add'} onClose={() => setModal(null)} title="Add receivable">
        <ReceivableForm
          members={state.members}
          onSubmit={(data) => {
            dispatch({ type: 'ADD_RECEIVABLE', payload: data })
            toast('Receivable added ✓')
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit receivable">
        <ReceivableForm
          members={state.members}
          initial={modal}
          onSubmit={(data) => {
            dispatch({ type: 'UPDATE_RECEIVABLE', payload: { id: modal.id, ...data } })
            toast('Receivable updated ✓')
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <Modal open={!!payReceivable} onClose={() => setPayReceivable(null)} title="Mark as paid — log contribution">
        <ContributionForm
          members={state.members}
          initial={{
            memberId: payReceivable?.memberId,
            amount: payReceivable ? payReceivable.amount - (payReceivable.amountPaid || 0) : '',
            status: 'confirmed',
          }}
          onSubmit={(data) => {
            dispatch({
              type: 'ADD_CONTRIBUTION',
              payload: data,
              targetReceivableId: payReceivable.id,
            })
            toast('Payment recorded ✓')
            setPayReceivable(null)
          }}
          onCancel={() => setPayReceivable(null)}
        />
      </Modal>
      <Modal open={!!waiveId} onClose={() => setWaiveId(null)} title="Waive receivable" size="sm">
        <textarea
          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all mb-4"
          placeholder="Reason for waiving..."
          value={waiveReason}
          onChange={(e) => setWaiveReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setWaiveId(null)}>Cancel</Button>
          <Button
            onClick={() => {
              dispatch({ type: 'WAIVE_RECEIVABLE', payload: { id: waiveId, reason: waiveReason } })
              toast('Receivable waived')
              setWaiveId(null)
              setWaiveReason('')
            }}
          >
            Waive
          </Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          dispatch({ type: 'DELETE_RECEIVABLE', payload: deleteId })
          toast('Receivable deleted')
        }}
        title="Delete receivable"
        message="Remove this receivable?"
        danger
      />
    </div>
  )
}
