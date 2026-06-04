import { Shield, Pencil, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Navigate } from 'react-router-dom'
import { formatDateTime } from '../utils/calculations'

export default function Admin() {
  const { isAdmin, profiles, setUserEditAccess, user, refreshProfiles } = useAuth()
  const { toast } = useToast()

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const handleToggle = async (profile) => {
    if (profile.role === 'admin') return
    try {
      await setUserEditAccess(profile.id, !profile.can_edit)
      toast(
        profile.can_edit
          ? `Revoked edit access for ${profile.email}`
          : `Granted edit access to ${profile.email}`
      )
    } catch {
      toast('Failed to update access', 'error')
    }
  }

  return (
    <div className="space-y-section-margin max-w-3xl">
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary-container" />
          Admin panel
        </h1>
        <p className="text-body-md text-on-surface-variant/70 mt-1">
          Control who can edit the shared budget pool. You are signed in as{' '}
          <strong className="text-on-surface">{user?.email}</strong>.
        </p>
      </div>

      <Card className="bg-primary-container/5 border-primary-container/20" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-gutter text-body-md text-on-surface-variant">
          <p>
            <strong className="text-on-surface">Viewers</strong> see the same data as everyone else but cannot add or change records.
          </p>
          <p className="mt-2">
            <strong className="text-on-surface">Editors</strong> can manage members, contributions, receivables, and payables.
          </p>
          <p className="mt-2">
            Ask teammates to <strong className="text-on-surface">sign up</strong> with their work email, then grant edit access below.
          </p>
        </CardContent>
      </Card>

      <Card style={{ animationDelay: '0.3s' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users & access</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refreshProfiles()}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant/10 text-on-surface-variant/70 text-xs font-label-caps uppercase">
                  <th className="p-gutter font-medium">Email</th>
                  <th className="p-gutter font-medium">Role</th>
                  <th className="p-gutter font-medium">Joined</th>
                  <th className="p-gutter font-medium text-right">Edit access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {profiles.map((p) => {
                  const isSelf = p.id === user?.id
                  const isAdminUser = p.role === 'admin'
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-gutter font-medium text-on-surface">
                        {p.email}
                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-on-surface-variant/50">(you)</span>
                        )}
                      </td>
                      <td className="p-gutter">
                        <Badge variant={isAdminUser ? 'info' : p.can_edit ? 'success' : 'outline'}>
                          {p.role}
                        </Badge>
                      </td>
                      <td className="p-gutter text-on-surface-variant">{formatDateTime(p.created_at)}</td>
                      <td className="p-gutter text-right">
                        {isAdminUser ? (
                          <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant/70">
                            <Pencil className="h-3 w-3" /> Full access
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={p.can_edit ? 'outline' : 'primary'}
                            onClick={() => handleToggle(p)}
                          >
                            {p.can_edit ? (
                              <>
                                <Eye className="h-3 w-3" /> Revoke edit
                              </>
                            ) : (
                              <>
                                <Pencil className="h-3 w-3" /> Grant edit
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {profiles.length === 0 && (
              <p className="text-body-md text-on-surface-variant/50 py-8 text-center">No users yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
