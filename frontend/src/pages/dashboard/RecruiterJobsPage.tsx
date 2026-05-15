import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Eye, Users, Briefcase } from 'lucide-react'
import { jobService } from '@/services/job.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PageTransition from '@/components/shared/PageTransition'
import { timeAgo, JOB_TYPES } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function RecruiterJobsPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobService.getMyJobs({ limit: 50 }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => {
      toast.success('Job deleted')
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] })
      setDeletingId(null)
    },
    onError: () => toast.error('Failed to delete job'),
  })

  const jobs = data?.data || []

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">My Job Listings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your posted jobs and view applicants.</p>
          </div>
          <Link to="/dashboard/jobs/new">
            <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />}>Post New Job</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Post your first job to start receiving applications."
            action={{ label: 'Post a Job', onClick: () => window.location.href = '/dashboard/jobs/new' }}
          />
        ) : (
          <div className="space-y-4">
            {jobs.map((job: import('@/types').Job, i: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-base truncate">{job.title}</h3>
                          <Badge variant={job.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {job.status}
                          </Badge>
                          <Badge variant="outline">{JOB_TYPES[job.type]}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {job._count?.applications ?? 0} applicants
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            {job.views} views
                          </span>
                          <span>Posted {timeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/jobs/${job.slug}`}>
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                            View
                          </Button>
                        </Link>
                        <Link to={`/dashboard/jobs/${job.id}/edit`}>
                          <Button variant="outline" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />}>
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/dashboard/applications/job/${job.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Users className="h-3.5 w-3.5" />}>
                            Applicants
                          </Button>
                        </Link>
                        {deletingId === job.id ? (
                          <div className="flex gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              isLoading={deleteMutation.isPending}
                              onClick={() => deleteMutation.mutate(job.id)}
                            >
                              Confirm
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => setDeletingId(job.id)}
                          >
                            Delete
                          </Button>
                        )}
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
