import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MapPin, Clock, DollarSign, Bookmark, BookmarkCheck,
  Wifi, Building2, Users, Share2, ArrowLeft, CheckCircle,
  Briefcase, Calendar, Eye,
} from 'lucide-react'
import { jobService } from '@/services/job.service'
import { applicationService } from '@/services/application.service'
import { jobService as savedJobService } from '@/services/job.service'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import PageTransition from '@/components/shared/PageTransition'
import { formatSalary, timeAgo, formatDate, JOB_TYPES, EXPERIENCE_LEVELS } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import api from '@/services/api'

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated, isJobSeeker } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['job', slug],
    queryFn: () => jobService.getJobBySlug(slug!).then((r) => r.data.data.job),
    enabled: !!slug,
  })

  const saveMutation = useMutation({
    mutationFn: (jobId: string) => api.post(`/saved-jobs/${jobId}`),
    onSuccess: (res) => {
      toast.success(res.data.message)
      queryClient.invalidateQueries({ queryKey: ['job', slug] })
    },
  })

  const applyMutation = useMutation({
    mutationFn: () => {
      const form = new FormData()
      if (coverLetter) form.append('coverLetter', coverLetter)
      if (resumeFile) form.append('resume', resumeFile)
      return applicationService.apply(data!.id, form)
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!')
      setShowApplyModal(false)
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to apply')
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const job = data

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to jobs
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job header card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-start gap-4 mb-5">
                  <Link to={`/companies/${job.company?.slug}`}>
                    <Avatar className="h-16 w-16 rounded-2xl">
                      <AvatarImage src={job.company?.logo} />
                      <AvatarFallback className="rounded-2xl text-xl font-bold">
                        {job.company?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <h1 className="text-2xl font-extrabold mb-1">{job.title}</h1>
                    <Link
                      to={`/companies/${job.company?.slug}`}
                      className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-sm"
                    >
                      <Building2 className="h-4 w-4" />
                      {job.company?.name}
                      {job.company?.isVerified && <span className="text-indigo-500">✓</span>}
                    </Link>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 mb-5 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
                  {job.isRemote && <span className="flex items-center gap-1.5 text-cyan-600"><Wifi className="h-4 w-4" />Remote</span>}
                  {(job.salaryMin || job.salaryMax) && (
                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{timeAgo(job.createdAt)}</span>
                  <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{job.views} views</span>
                  {job._count && (
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{job._count.applications} applicants</span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">{JOB_TYPES[job.type]}</Badge>
                  <Badge variant="outline">{EXPERIENCE_LEVELS[job.experienceLevel]}</Badge>
                  <Badge variant="default">{job.category}</Badge>
                  {job.deadline && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline: {formatDate(job.deadline)}
                    </Badge>
                  )}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
              >
                <h2 className="text-lg font-bold mb-4">Job Description</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">{job.description}</p>
              </motion.div>

              {/* Responsibilities */}
              {job.responsibilities?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
                >
                  <h2 className="text-lg font-bold mb-4">Responsibilities</h2>
                  <ul className="space-y-2.5">
                    {job.responsibilities.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
                >
                  <h2 className="text-lg font-bold mb-4">Requirements</h2>
                  <ul className="space-y-2.5">
                    {job.requirements.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Skills */}
              {job.skills?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
                >
                  <h2 className="text-lg font-bold mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Apply card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sticky top-24"
              >
                <div className="space-y-3 mb-5">
                  {isAuthenticated && isJobSeeker ? (
                    <Button
                      className="w-full"
                      variant="gradient"
                      size="lg"
                      onClick={() => setShowApplyModal(true)}
                      leftIcon={<Briefcase className="h-4 w-4" />}
                    >
                      Apply Now
                    </Button>
                  ) : !isAuthenticated ? (
                    <Link to="/login" state={{ from: `/jobs/${slug}` }}>
                      <Button className="w-full" variant="gradient" size="lg">
                        Sign in to Apply
                      </Button>
                    </Link>
                  ) : null}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => saveMutation.mutate(job.id)}
                    isLoading={saveMutation.isPending}
                    leftIcon={job.isSaved ? <BookmarkCheck className="h-4 w-4 text-indigo-600" /> : <Bookmark className="h-4 w-4" />}
                  >
                    {job.isSaved ? 'Saved' : 'Save Job'}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    leftIcon={<Share2 className="h-4 w-4" />}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copied!')
                    }}
                  >
                    Share
                  </Button>
                </div>

                {/* Job overview */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-sm">Job Overview</h3>
                  {[
                    { label: 'Job Type', value: JOB_TYPES[job.type] },
                    { label: 'Experience', value: EXPERIENCE_LEVELS[job.experienceLevel] },
                    { label: 'Location', value: job.location },
                    { label: 'Category', value: job.category },
                    { label: 'Posted', value: formatDate(job.createdAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="font-medium text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Company card */}
              {job.company && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
                >
                  <h3 className="font-semibold text-sm mb-4">About the Company</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={job.company.logo} />
                      <AvatarFallback className="rounded-xl">{job.company.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{job.company.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{job.company.industry}</p>
                    </div>
                  </div>
                  {job.company.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-3">
                      {job.company.description}
                    </p>
                  )}
                  <Link to={`/companies/${job.company.slug}`}>
                    <Button variant="outline" size="sm" className="w-full">View Company</Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-1">Apply for {job.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{job.company?.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Cover Letter (optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Tell the employer why you're a great fit..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Resume (optional — uses profile resume if not uploaded)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                isLoading={applyMutation.isPending}
                onClick={() => applyMutation.mutate()}
              >
                Submit Application
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransition>
  )
}
