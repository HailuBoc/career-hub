import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, FileText, ExternalLink, ChevronDown } from 'lucide-react'
import { applicationService } from '@/services/application.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PageTransition from '@/components/shared/PageTransition'
import { APPLICATION_STATUSES, getInitials, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function JobApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['job-applicants', jobId],
    queryFn: () => applicationService.getJobApplications(jobId!, { limit: 50 }).then((r) => r.data),
    enabled: !!jobId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  const applications = data?.data || []

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">Applicants</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {data?.pagination?.total ?? 0} total applicants
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState icon={Users} title="No applicants yet" description="Share your job listing to attract candidates." />
        ) : (
          <div className="space-y-4">
            {applications.map((app: import('@/types').Application, i: number) => {
              const profile = app.user?.profile
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
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={profile?.avatar} />
                          <AvatarFallback>
                            {getInitials(profile?.firstName, profile?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold">
                                {profile?.firstName} {profile?.lastName}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {profile?.headline || app.user?.email}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Applied {timeAgo(app.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                            </div>
                          </div>

                          {profile?.skills && profile.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {profile.skills.slice(0, 5).map((skill: string) => (
                                <span key={skill} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-3">
                            {app.resumeUrl && (
                              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>
                                  Resume
                                </Button>
                              </a>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">Update status:</span>
                              <Select
                                value={app.status}
                                onValueChange={(status) => statusMutation.mutate({ id: app.id, status })}
                              >
                                <SelectTrigger className="h-8 w-36 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(APPLICATION_STATUSES).map(([value, { label }]) => (
                                    <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {app.coverLetter && (
                            <details className="mt-3">
                              <summary className="text-xs text-indigo-600 cursor-pointer hover:underline flex items-center gap-1">
                                <ChevronDown className="h-3 w-3" /> View cover letter
                              </summary>
                              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 leading-relaxed">
                                {app.coverLetter}
                              </p>
                            </details>
                          )}
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
