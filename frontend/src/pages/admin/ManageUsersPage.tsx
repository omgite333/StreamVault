import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Shield, ShieldOff } from 'lucide-react'
import { adminService } from '../../services/admin.service'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { formatDate } from '../../lib/utils'
import { getErrorMessage } from '../../lib/utils'
import { useToast } from '../../components/ui/toast-context'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { User } from '../../types'

export const ManageUsersPage = () => {
  usePageTitle('Manage Users')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await adminService.getUsers()).data.data,
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: User['role'] }) => adminService.updateUserRole(id, role),
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: role === 'ADMIN' ? 'User promoted to admin' : 'User demoted to student',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({ title: 'Could not update role', description: getErrorMessage(error), variant: 'error' })
    },
  })

  const toggleRole = (user: User) => {
    roleMutation.mutate({ id: user.id, role: user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">Promote users to administrators or demote them.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(users ?? []).map((user) => (
            <Card key={user.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="break-words text-sm text-muted-foreground">
                        {user.email} · Joined {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                <div className="flex items-center gap-3">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' ? 'Admin' : 'Student'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={roleMutation.isPending}
                    onClick={() => toggleRole(user)}
                  >
                    {user.role === 'ADMIN' ? (
                      <>
                        <ShieldOff />
                        Demote
                      </>
                    ) : (
                      <>
                        <Shield />
                        Promote
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Link to="/admin" className="text-sm text-primary hover:underline">
        Back to Dashboard
      </Link>
    </div>
  )
}
