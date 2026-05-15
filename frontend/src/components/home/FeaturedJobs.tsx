import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase } from 'lucide-react'
import { jobService } from '@/services/job.service'
import JobCard from '@/components/jobs/JobCard'
import { JobCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export default function FeaturedJobs() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: () => jobService.getFeaturedJobs().then((r) => r.data.data.jobs),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-3">
              <Briefcase className="h-4 w-4" />
              Featured Opportunities
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Jobs Picked For You
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg">
              Handpicked opportunities from top companies actively hiring right now.
            </p>
          </div>
          <Link to="/jobs" className="hidden sm:block">
            <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View all jobs
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
            : data?.map((job: import('@/types').Job, i: number) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))
          }
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link to="/jobs">
            <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View all jobs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
