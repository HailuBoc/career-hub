import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, UserCheck, UserX, Users } from 'lucide-react'
import api from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PageTransition from '@/components/shared/PageTransition'
import { getInitials, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () =>
      api.get('/admin/users', {
        params: {
          search: search || undefined,
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          limit: 50,
        },
      }).then((r) => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/toggle`),
    onSuccess: (res) => {
      toast.success(res.data.message)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Failed to update user'),
  })

  const users = data?.data || []

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">Manage Users</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{data?.pagination?.total ?? 0} total users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'JOBSEEKER', 'RECRUITER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  roleFilter === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Try adjusting your search." />
        ) : (
          <div className="space-y-3">
            {users.map((user: {
              id: string; email: string; role: string; isActive: boolean;
              isEmailVerified: boolean; createdAt: string;
              profile?: { firstName?: string; lastName?: string; avatar?: string }
            }, i: number) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={!user.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={user.profile?.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.profile?.firstName, user.profile?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </p>
                          {!user.isActive && <Badge variant="destructive" className="text-xs">Deactivated</Badge>}
                          {!user.isEmailVerified && <Badge variant="warning" className="text-xs">Unverified</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Joined {timeAgo(user.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'RECRUITER' ? 'purple' : 'default'}
                          className="text-xs"
                        >
                          {user.role}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={toggleMutation.isPending}
                          onClick={() => toggleMutation.mutate(user.id)}
                          leftIcon={user.isActive
                            ? <UserX className="h-3.5 w-3.5 text-red-500" />
                            : <UserCheck className="h-3.5 w-3.5 text-green-500" />
                          }
                          className={user.isActive ? 'hover:border-red-300 hover:text-red-500' : 'hover:border-green-300 hover:text-green-500'}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
