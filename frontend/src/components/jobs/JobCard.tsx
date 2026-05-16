import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { timeAgo } from '@/lib/utils'
import type { Job } from '@/types'

interface Props {
  job: Job
  variant?: 'default' | 'compact'
}

export default function JobCard({ job, variant = 'default' }: Props) {
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -1 }}
        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all"
      >
        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{job.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{job.category} · {job.location}</p>
        </div>
        <Badge variant="default">{job.category}</Badge>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-7 w-7 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">{job.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{job.category}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="default">{job.category}</Badge>
        {job.isActive && <Badge variant="success">Active</Badge>}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          {job.location && (
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
          )}
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(job.createdAt)}</span>
          {job._count && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />{job._count.applicants} applicants
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
