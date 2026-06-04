import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users, Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { usePool } from '../context/PoolContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { MemberForm } from '../components/forms/MemberForm'
import { ContributionForm } from '../components/forms/ContributionForm'
import { ReceivableForm } from '../components/forms/ReceivableForm'
import {
  formatAmount,
  formatDate,
  getMemberContributed,
  getMemberPendingReceivable,
} from '../utils/calculations'

export default function Members() {
  const { state, dispatch, symbol, getMember } = usePool()
  const { toast } = useToast()
  const [params] = useSearchParams()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selectedId, setSelectedId] = useState(params.get('member') || null)

  const selected = selectedId ? getMember(selectedId) : null

  const handleAdd = (data) => {
    dispatch({ type: 'ADD_MEMBER', payload: data })
    toast('Member added ✓')
    setModal(null)
  }

  const handleUpdate = (data) => {
    dispatch({ type: 'UPDATE_MEMBER', payload: { id: modal.id, ...data } })
    toast('Member updated ✓')
    setModal(null)
  }

  const handleDelete = () => {
    dispatch({ type: 'DELETE_MEMBER', payload: deleteId })
    toast('Member deleted')
    setDeleteId(null)
    if (selectedId === deleteId) setSelectedId(null)
  }

  if (selected) {
    const contributed = getMemberContributed(selected.id, state.contributions)
    const owed = getMemberPendingReceivable(selected.id, state.receivables)
    const net = contributed - owed
    const history = [
      ...state.contributions.filter((c) => c.memberId === selected.id).map((c) => ({
        type: 'contribution',
        date: c.date,
        desc: `Contribution (${c.status})`,
        amount: c.amount,
        positive: true,
      })),
      ...state.receivables.filter((r) => r.memberId === selected.id).map((r) => ({
        type: 'receivable',
        date: r.dueDate,
        desc: r.description,
        amount: r.amount - (r.amountPaid || 0),
        positive: false,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))

    return (
      <div className="space-y-section-margin">
        <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <button type="button" onClick={() => setSelectedId(null)} className="text-sm text-primary hover:underline mb-2 transition-all">
              ← Back to members
            </button>
            <h1 className="text-headline-md font-headline-md text-on-surface">{selected.name}</h1>
            <p className="text-body-md text-on-surface-variant/70">{selected.department} · {selected.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setModal({ type: 'contribution', memberId: selected.id })}>
              Add contribution
            </Button>
            <Button variant="outline" onClick={() => setModal({ type: 'receivable', memberId: selected.id })}>
              Mark receivable
            </Button>
          </div>
        </div>

        <div className="grid gap-card-gap sm:grid-cols-3">
          <Card style={{ animationDelay: '0.2s' }}><CardContent className="pt-6"><p className="text-label-caps font-label-caps text-on-surface-variant/70">Contributed</p><p className="text-xl font-amount font-semibold text-primary-container mt-2">{formatAmount(contributed, symbol)}</p></CardContent></Card>
          <Card style={{ animationDelay: '0.3s' }}><CardContent className="pt-6"><p className="text-label-caps font-label-caps text-on-surface-variant/70">Owed</p><p className="text-xl font-amount font-semibold text-error mt-2">{formatAmount(owed, symbol)}</p></CardContent></Card>
          <Card style={{ animationDelay: '0.4s' }}><CardContent className="pt-6"><p className="text-label-caps font-label-caps text-on-surface-variant/70">Net</p><p className={`text-xl font-amount font-semibold mt-2 ${net >= 0 ? 'text-primary-container' : 'text-error'}`}>{formatAmount(net, symbol)}</p></CardContent></Card>
        </div>

        <Card style={{ animationDelay: '0.5s' }}>
          <CardHeader><CardTitle>Transaction history</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low">
                  <tr className="border-b border-outline-variant/10 text-left text-on-surface-variant/70 text-xs font-label-caps uppercase">
                    <th className="p-gutter">Date</th>
                    <th className="p-gutter">Description</th>
                    <th className="p-gutter text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-gutter text-on-surface-variant">{formatDate(h.date)}</td>
                      <td className="p-gutter text-on-surface">{h.desc}</td>
                      <td className={`p-gutter text-right font-amount ${h.positive ? 'text-primary-container' : 'text-error'}`}>
                        {h.positive ? '+' : '-'}{formatAmount(h.amount, symbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <MemberDetailModals modal={modal} setModal={setModal} selected={selected} state={state} dispatch={dispatch} toast={toast} />
      </div>
    )
  }

  return (
    <div className="space-y-section-margin">
      <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Members</h1>
          <p className="text-body-md text-on-surface-variant/70">{state.members.length} team members</p>
        </div>
        <Button onClick={() => setModal({ type: 'add' })} variant="primary">
          <Plus className="h-4 w-4" /> Add member
        </Button>
      </div>

      {state.members.length === 0 ? (
        <EmptyState icon={Users} title="No members yet" description="Add team members to start tracking contributions." actionLabel="Add member" onAction={() => setModal({ type: 'add' })} />
      ) : (
        <Card style={{ animationDelay: '0.2s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant/10 text-on-surface-variant/70 text-xs font-label-caps uppercase">
                  <th className="p-gutter font-medium">Name</th>
                  <th className="p-gutter font-medium">Role / Dept</th>
                  <th className="p-gutter font-medium text-right">Contributed</th>
                  <th className="p-gutter font-medium text-right">Pending receivable</th>
                  <th className="p-gutter font-medium">Status</th>
                  <th className="p-gutter font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {state.members.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-gutter">
                      <button type="button" className="font-medium text-primary hover:underline" onClick={() => setSelectedId(m.id)}>
                        {m.name}
                      </button>
                    </td>
                    <td className="p-gutter text-on-surface-variant">{m.department || '—'}</td>
                    <td className="p-gutter text-right font-amount text-on-surface">{formatAmount(getMemberContributed(m.id, state.contributions), symbol)}</td>
                    <td className="p-gutter text-right font-amount text-error">{formatAmount(getMemberPendingReceivable(m.id, state.receivables), symbol)}</td>
                    <td className="p-gutter">
                      <Badge variant={m.status === 'active' ? 'success' : 'outline'}>{m.status}</Badge>
                    </td>
                    <td className="p-gutter">
                      <div className="flex justify-end gap-1">
                        <button type="button" className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" title="Edit" onClick={() => setModal({ type: 'edit', ...m })}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" title="View ledger" onClick={() => setSelectedId(m.id)}>
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1.5 rounded hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors" title="Delete" onClick={() => setDeleteId(m.id)}>
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

      <Modal open={modal?.type === 'add'} onClose={() => setModal(null)} title="Add member">
        <MemberForm members={state.members} onSubmit={handleAdd} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit member">
        <MemberForm initial={modal} members={state.members} onSubmit={handleUpdate} onCancel={() => setModal(null)} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete member" message="This cannot be undone. Related records will remain." danger />
    </div>
  )
}

function MemberDetailModals({ modal, setModal, selected, state, dispatch, toast }) {
  return (
    <>
      <Modal open={modal?.type === 'contribution'} onClose={() => setModal(null)} title="Add contribution">
        <ContributionForm
          members={state.members}
          initial={{ memberId: modal?.memberId || selected.id }}
          onSubmit={(data) => {
            dispatch({ type: 'ADD_CONTRIBUTION', payload: data })
            toast('Contribution added ✓')
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <Modal open={modal?.type === 'receivable'} onClose={() => setModal(null)} title="Add receivable">
        <ReceivableForm
          members={state.members}
          initial={{ memberId: modal?.memberId || selected.id }}
          onSubmit={(data) => {
            dispatch({ type: 'ADD_RECEIVABLE', payload: data })
            toast('Receivable added ✓')
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </>
  )
}
