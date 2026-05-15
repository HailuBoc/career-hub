import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookmarkCheck } from 'lucide-react'
import api from '@/services/api'
import JobCard from '@/components/jobs/JobCard'
import { JobCardSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PageTransition from '@/components/shared/PageTransition'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function SavedJobsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => api.get('/saved-jobs').then((r) => r.data.data),
  })

  const toggleMutation = useMutation({
    mutationFn: (jobId: string) => api.post(`/saved-jobs/${jobId}`),
    onSuccess: (res) => {
      toast.success(res.data.message)
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
  })

  const savedJobs = (data || []).map((s: { job: unknown }) => s.job)

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">Saved Jobs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Jobs you've bookmarked for later.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : savedJobs.length === 0 ? (
          <EmptyState
            icon={BookmarkCheck}
            title="No saved jobs"
            description="Bookmark jobs you're interested in to review them later."
            action={{ label: 'Browse Jobs', onClick: () => navigate('/jobs') }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {savedJobs.map((job: import('@/types').Job) => (
              <JobCard
                key={job.id}
                job={{ ...job, isSaved: true }}
                onSave={(id) => toggleMutation.mutate(id)}
                isSaving={toggleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
