import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Briefcase, Grid3X3, List } from 'lucide-react'
import { jobService, type JobFilters } from '@/services/job.service'
import JobCard from '@/components/jobs/JobCard'
import JobFiltersPanel from '@/components/jobs/JobFilters'
import { JobCardSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PageTransition from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/Button'
import type { Job } from '@/types'

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const getFiltersFromParams = useCallback((): JobFilters => ({
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    type: searchParams.get('type') || undefined,
    experienceLevel: searchParams.get('experienceLevel') || undefined,
    location: searchParams.get('location') || undefined,
    isRemote: searchParams.get('isRemote') === 'true' ? true : undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
  }), [searchParams])

  const filters = getFiltersFromParams()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getJobs(filters).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  })

  const handleFilterChange = (newFilters: JobFilters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) params.set(k, String(v))
    })
    setSearchParams(params)
  }

  const handleReset = () => setSearchParams({})

  const jobs: Job[] = data?.data || []
  const pagination = data?.pagination

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white mb-8">
              <h1 className="text-4xl font-extrabold mb-3">Browse All Jobs</h1>
              <p className="text-slate-400">
                {pagination?.total
                  ? `${pagination.total.toLocaleString()} opportunities waiting for you`
                  : 'Find your next opportunity'}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <JobFiltersPanel filters={filters} onChange={handleFilterChange} onReset={handleReset} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isLoading ? 'Loading...' : `${pagination?.total ?? 0} jobs found`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isLoading || isFetching ? (
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {Array.from({ length: 8 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found"
              description="Try adjusting your filters or search terms."
              action={{ label: 'Clear filters', onClick: handleReset }}
            />
          ) : (
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {jobs.map((job: Job, i: number) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <JobCard job={job} variant={viewMode === 'list' ? 'compact' : 'default'} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage}
                onClick={() => handleFilterChange({ ...filters, page: (filters.page || 1) - 1 })}>
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button key={page} onClick={() => handleFilterChange({ ...filters, page })}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        page === pagination.page ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                      {page}
                    </button>
                  )
                })}
              </div>
              <Button variant="outline" size="sm" disabled={!pagination.hasNextPage}
                onClick={() => handleFilterChange({ ...filters, page: (filters.page || 1) + 1 })}>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
