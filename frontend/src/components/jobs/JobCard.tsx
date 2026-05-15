import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Wifi, Building2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { formatSalary, timeAgo, JOB_TYPES, EXPERIENCE_LEVELS } from '@/lib/utils'
import type { Job } from '@/types'

interface Props {
  job: Job
  onSave?: (jobId: string) => void
  isSaving?: boolean
  variant?: 'default' | 'compact'
}

export default function JobCard({ job, onSave, isSaving, variant = 'default' }: Props) {
  const typeColors: Record<string, 'success' | 'warning' | 'purple' | 'cyan' | 'default'> = {
    FULL_TIME: 'success',
    PART_TIME: 'warning',
    CONTRACT: 'purple',
    INTERNSHIP: 'cyan',
    FREELANCE: 'default',
  }

  if (variant === 'compact') {
    return (
      <Link to={`/jobs/${job.slug}`}>
        <motion.div
          whileHover={{ y: -1 }}
          className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer"
        >
          <Avatar className="h-10 w-10 rounded-xl flex-shrink-0">
            <AvatarImage src={job.company?.logo} />
            <AvatarFallback className="rounded-xl text-xs">{job.company?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{job.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{job.company?.name} · {job.location}</p>
          </div>
          <Badge variant={typeColors[job.type]}>{JOB_TYPES[job.type]}</Badge>
        </motion.div>
      </Link>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <Link to={`/companies/${job.company?.slug}`}>
            <Avatar className="h-14 w-14 rounded-xl flex-shrink-0">
              <AvatarImage src={job.company?.logo} />
              <AvatarFallback className="rounded-xl text-lg font-bold">
                {job.company?.name?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/jobs/${job.slug}`}>
              <h3 className="font-bold text-base hover:text-indigo-600 transition-colors line-clamp-1 text-slate-900 dark:text-slate-100">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 mt-1">
              <Link
                to={`/companies/${job.company?.slug}`}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1"
              >
                <Building2 className="h-3.5 w-3.5" />
                {job.company?.name}
              </Link>
              {job.company?.isVerified && <span className="text-indigo-500 text-xs">✓</span>}
            </div>
          </div>
        </div>

        {onSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(job.id) }}
            disabled={isSaving}
            className="flex-shrink-0 h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-indigo-500 hover:text-indigo-600 transition-all text-slate-500 dark:text-slate-400"
            aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
          >
            {job.isSaved
              ? <BookmarkCheck className="h-4 w-4 text-indigo-600" />
              : <Bookmark className="h-4 w-4" />
            }
          </button>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant={typeColors[job.type]}>{JOB_TYPES[job.type]}</Badge>
        <Badge variant="outline">{EXPERIENCE_LEVELS[job.experienceLevel]}</Badge>
        {job.isRemote && (
          <Badge variant="cyan" className="flex items-center gap-1">
            <Wifi className="h-3 w-3" /> Remote
          </Badge>
        )}
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
          {(job.salaryMin || job.salaryMax) && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <DollarSign className="h-3.5 w-3.5" />
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </span>
          )}
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(job.createdAt)}</span>
          {job._count && (
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{job._count.applications}</span>
          )}
        </div>
        <Link to={`/jobs/${job.slug}`}>
          <Button size="sm" variant="outline" className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
            View Job
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
