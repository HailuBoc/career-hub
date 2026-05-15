import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, ExternalLink, Trash2 } from 'lucide-react'
import { applicationService } from '@/services/application.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PageTransition from '@/components/shared/PageTransition'
import { APPLICATION_STATUSES, timeAgo } from '@/lib/utils'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const statusFilters = ['ALL', 'PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED']

export default function ApplicationsPage() {
  const [activeStatus, setActiveStatus] = useState('ALL')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications', activeStatus],
    queryFn: () =>
      applicationService.getMyApplications({
        status: activeStatus === 'ALL' ? undefined : activeStatus,
        limit: 20,
      }).then((r) => r.data),
  })

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => applicationService.withdraw(id),
    onSuccess: () => {
      toast.success('Application withdrawn')
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to withdraw')
    },
  })

  const applications = data?.data || []

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">My Applications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track all your job applications in one place.</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeStatus === status
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status === 'ALL' ? 'All' : APPLICATION_STATUSES[status]?.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Start applying to jobs to track your progress here."
            action={{ label: 'Browse Jobs', onClick: () => window.location.href = '/jobs' }}
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app: import('@/types').Application, i: number) => {
              const statusInfo = APPLICATION_STATUSES[app.status]
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 rounded-xl flex-shrink-0">
                          <AvatarImage src={app.job?.company?.logo} />
                          <AvatarFallback className="rounded-xl">
                            {app.job?.company?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link to={`/jobs/${app.job?.slug}`}>
                                <h3 className="font-bold hover:text-indigo-600 transition-colors">
                                  {app.job?.title}
                                </h3>
                              </Link>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {app.job?.company?.name} · Applied {timeAgo(app.createdAt)}
                              </p>
                            </div>
                            <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                          </div>

                          <div className="flex items-center gap-3 mt-3">
                            {app.resumeUrl && (
                              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                                  Resume
                                </Button>
                              </a>
                            )}
                            {app.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                                isLoading={withdrawMutation.isPending}
                                onClick={() => withdrawMutation.mutate(app.id)}
                              >
                                Withdraw
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
