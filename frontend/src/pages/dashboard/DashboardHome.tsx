import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Briefcase, FileText, BookmarkCheck, Bell,
  TrendingUp, ArrowRight, CheckCircle, Clock,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Application, Job } from '@/types'
import { applicationService } from '@/services/application.service'
import { jobService } from '@/services/job.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { APPLICATION_STATUSES, timeAgo } from '@/lib/utils'
import PageTransition from '@/components/shared/PageTransition'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const activityData = [
  { month: 'Jan', applications: 2 },
  { month: 'Feb', applications: 5 },
  { month: 'Mar', applications: 3 },
  { month: 'Apr', applications: 8 },
  { month: 'May', applications: 6 },
  { month: 'Jun', applications: 12 },
]

const statusColors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
void statusColors // suppress unused warning

export default function DashboardHome() {
  const { user, isJobSeeker, isRecruiter } = useAuth()
  const profile = user?.profile

  const { data: applicationsData } = useQuery({
    queryKey: ['my-applications', { limit: 5 }],
    queryFn: () => applicationService.getMyApplications({ limit: 5 }).then((r) => r.data),
    enabled: isJobSeeker,
  })

  const { data: recruiterJobsData } = useQuery({
    queryKey: ['recruiter-jobs', { limit: 5 }],
    queryFn: () => jobService.getMyJobs({ limit: 5 }).then((r) => r.data),
    enabled: isRecruiter,
  })

  const applications: Application[] = applicationsData?.data || []
  const recruiterJobs: Job[] = recruiterJobsData?.data || []

  // Compute status breakdown for pie chart (used for future analytics)
  const _statusBreakdown = Object.entries(
    applications.reduce((acc: Record<string, number>, app: Application) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const completionPercent = (() => {
    if (!profile) return 0
    let score = 0
    if (profile.firstName) score += 20
    if (profile.headline) score += 15
    if (profile.bio) score += 15
    if (profile.skills?.length > 0) score += 20
    if (profile.resumeUrl) score += 20
    if (profile.avatar) score += 10
    return score
  })()

  const stats = isJobSeeker
    ? [
        { label: 'Applications', value: applicationsData?.pagination?.total ?? 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
        { label: 'Saved Jobs', value: 0, icon: BookmarkCheck, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
        { label: 'Profile Views', value: 142, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
        { label: 'Notifications', value: 3, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
      ]
    : [
        { label: 'Active Jobs', value: recruiterJobsData?.pagination?.total ?? 0, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
        { label: 'Total Applications', value: 0, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
        { label: 'Profile Views', value: 89, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
        { label: 'Notifications', value: 2, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
      ]

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">
              Good morning, {profile?.firstName || 'there'} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your career today.</p>
          </div>
          {isJobSeeker && (
            <Link to="/jobs">
              <Button variant="gradient" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Browse Jobs
              </Button>
            </Link>
          )}
          {isRecruiter && (
            <Link to="/dashboard/jobs/new">
              <Button variant="gradient" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Post a Job
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold">{stat.value}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Application Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="applications" stroke="#6366f1" fill="url(#colorApps)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profile completion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#6366f1" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercent / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-extrabold">{completionPercent}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Basic info', done: !!(profile?.firstName && profile?.headline) },
                  { label: 'Bio added', done: !!profile?.bio },
                  { label: 'Skills listed', done: (profile?.skills?.length ?? 0) > 0 },
                  { label: 'Resume uploaded', done: !!profile?.resumeUrl },
                  { label: 'Photo added', done: !!profile?.avatar },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    {done
                      ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      : <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    }
                    <span className={done ? 'line-through text-slate-500 dark:text-slate-400' : ''}>{label}</span>
                  </div>
                ))}
              </div>
              <Link to="/profile" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent applications / jobs */}
        {isJobSeeker && applications.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <Link to="/dashboard/applications">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications.map((app) => {
                  const statusInfo = APPLICATION_STATUSES[app.status]
                  return (
                    <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{app.job?.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{app.job?.company?.name} · {timeAgo(app.createdAt)}</p>
                      </div>
                      <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {isRecruiter && recruiterJobs.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Your Job Listings</CardTitle>
              <Link to="/dashboard/jobs">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recruiterJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{job.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{job._count?.applications ?? 0} applicants · {timeAgo(job.createdAt)}</p>
                    </div>
                    <Badge variant={job.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  )
}
