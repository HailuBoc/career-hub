import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Briefcase, FileText, Building2, TrendingUp, ArrowUpRight } from 'lucide-react'
import api from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import PageTransition from '@/components/shared/PageTransition'
import { getInitials, timeAgo, APPLICATION_STATUSES } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  const { stats, recentUsers, recentJobs, jobsByCategory, applicationsByStatus } = data || {}

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', change: '+12%' },
    { label: 'Active Jobs', value: stats?.totalJobs ?? 0, icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30', change: '+8%' },
    { label: 'Applications', value: stats?.totalApplications ?? 0, icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30', change: '+23%' },
    { label: 'Companies', value: stats?.totalCompanies ?? 0, icon: Building2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', change: '+5%' },
  ]

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Platform overview and analytics.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
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
                      <span className="flex items-center gap-0.5 text-xs text-green-600 font-semibold">
                        <ArrowUpRight className="h-3 w-3" />{stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold">{stat.value.toLocaleString()}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs by category */}
          <Card>
            <CardHeader><CardTitle className="text-base">Jobs by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={jobsByCategory?.map((c: { category: string; _count: { category: number } }) => ({ name: c.category, count: c._count.category })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Applications by status */}
          <Card>
            <CardHeader><CardTitle className="text-base">Applications by Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={applicationsByStatus?.map((s: { status: string; _count: { status: number } }) => ({
                      name: APPLICATION_STATUSES[s.status]?.label || s.status,
                      value: s._count.status,
                    })) || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(applicationsByStatus || []).map((_: unknown, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent users */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Users</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(recentUsers || []).map((user: { id: string; email: string; role: string; createdAt: string; profile?: { firstName?: string; lastName?: string; avatar?: string } }) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profile?.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.profile?.firstName, user.profile?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'RECRUITER' ? 'purple' : 'default'} className="text-xs">
                        {user.role}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(user.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent jobs */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Jobs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(recentJobs || []).map((job: { id: string; title: string; status: string; createdAt: string; company?: { name?: string } }) => (
                  <div key={job.id} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{job.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{job.company?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={job.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-xs">
                        {job.status}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
