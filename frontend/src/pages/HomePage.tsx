import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, CheckCircle, Clock, XCircle, ArrowRight, Shield,
  User, BookOpen, Briefcase, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/services/api'
import PageTransition from '@/components/shared/PageTransition'
import type { Applicant, ApplicantStatus, ApplicantsResponse, ColumnData } from '@/types'

const jobCategories = [
  { name: 'Construction',   color: 'from-orange-500 to-amber-600',  icon: '🏗️', desc: 'Building & infrastructure work' },
  { name: 'Healthcare',     color: 'from-red-500 to-rose-600',      icon: '🏥', desc: 'Nursing, caregiving & medical' },
  { name: 'Human Services', color: 'from-blue-500 to-indigo-600',   icon: '🤝', desc: 'Domestic, nanny & personal care' },
  { name: 'Security',       color: 'from-slate-600 to-slate-700',   icon: '🛡️', desc: 'Guards & safety personnel' },
  { name: 'Transport',      color: 'from-green-500 to-emerald-600', icon: '🚗', desc: 'Drivers & logistics' },
  { name: 'Hospitality',    color: 'from-pink-500 to-rose-500',     icon: '🏨', desc: 'Hotels, cleaning & service' },
  { name: 'Manufacturing',  color: 'from-violet-500 to-purple-600', icon: '🏭', desc: 'Factory & production work' },
  { name: 'Logistics',      color: 'from-cyan-500 to-teal-600',     icon: '📦', desc: 'Warehouse & supply chain' },
]

const columns: {
  key: ApplicantStatus
  label: string
  icon: typeof CheckCircle
  color: string
  bg: string
  border: string
  badge: string
}[] = [
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-950/20',  border: 'border-green-800/50',  badge: 'bg-green-500'  },
  { key: 'PENDING',  label: 'Pending',  icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-950/20', border: 'border-yellow-800/50', badge: 'bg-yellow-500' },
  { key: 'REJECTED', label: 'Rejected', icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-950/20',    border: 'border-red-800/50',    badge: 'bg-red-500'    },
]

function ApplicantMiniCard({ applicant }: { applicant: Applicant }) {
  const genderLabel = applicant.gender === 'MALE' ? 'Male' : applicant.gender === 'FEMALE' ? 'Female' : 'Other'
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition-colors">
      <div className="flex items-start gap-3">
        {applicant.photo ? (
          <img src={applicant.photo} alt={applicant.firstName}
            className="h-10 w-10 rounded-xl object-cover flex-shrink-0 border border-white/10" />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">
            {applicant.firstName} {applicant.lastName}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{applicant.age} years • {genderLabel}</p>
        </div>
      </div>
      <div className="mt-2.5 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <BookOpen className="h-3 w-3 flex-shrink-0" />
          <span>Passport: <span className="text-slate-300">{applicant.passportNo}</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Briefcase className="h-3 w-3 flex-shrink-0" />
          {applicant.job
            ? <span>Job: <span className="text-indigo-400">{applicant.job.title}</span></span>
            : <span className="text-slate-500">Job: Not assigned</span>
          }
        </div>
      </div>
    </div>
  )
}

type Pages = { ACCEPTED: number; PENDING: number; REJECTED: number }

export default function HomePage() {
  const [pages, setPages] = useState<Pages>({ ACCEPTED: 1, PENDING: 1, REJECTED: 1 })

  const { data, isLoading } = useQuery({
    queryKey: ['applicants-home', pages],
    queryFn: () =>
      api.get('/applicants', {
        params: {
          acceptedPage: pages.ACCEPTED,
          pendingPage:  pages.PENDING,
          rejectedPage: pages.REJECTED,
        },
      }).then((r) => r.data.data as ApplicantsResponse),
    retry: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (prev: ApplicantsResponse | undefined) => prev,
  })

  const accepted = data?.accepted?.total ?? 0
  const pending  = data?.pending?.total  ?? 0
  const rejected = data?.rejected?.total ?? 0
  const total    = accepted + pending + rejected

  const getColData = (key: ApplicantStatus): ColumnData =>
    data?.[key.toLowerCase() as keyof ApplicantsResponse] ?? { data: [], total: 0, page: 1, totalPages: 1 }

  const setPage = (key: ApplicantStatus, page: number) =>
    setPages((p) => ({ ...p, [key]: page }))

  return (
    <PageTransition>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
          <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
              <Shield className="h-4 w-4" />
              Admin-managed applicant tracking system
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Applicant<br /><span className="gradient-text">Management</span><br />Platform
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Track, manage and process job applicants across construction, healthcare, human services and more.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/applicants">
                <Button variant="gradient" size="xl" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  View Applicants
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Live stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Total Applicants', value: total,    icon: Users,       color: 'text-indigo-400' },
              { label: 'Accepted',         value: accepted, icon: CheckCircle, color: 'text-green-400'  },
              { label: 'Pending',          value: pending,  icon: Clock,       color: 'text-yellow-400' },
              { label: 'Rejected',         value: rejected, icon: XCircle,     color: 'text-red-400'    },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Applicants Board ── */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-indigo-400 font-semibold text-sm mb-2">Live Board</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Applicants Overview</h2>
              <p className="text-slate-400 mt-1 text-sm">Current applicant status across all positions</p>
            </div>
            <Link to="/applicants">
              <Button variant="outline" size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                rightIcon={<ArrowRight className="h-4 w-4" />}>
                Full Board
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {columns.map((col) => {
              const colData = getColData(col.key)
              const applicants: Applicant[] = colData.data
              const Icon = col.icon

              return (
                <div key={col.key} className={`rounded-2xl border ${col.border} ${col.bg} overflow-hidden`}>
                  {/* Column header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${col.color}`} />
                      <span className="font-bold text-white">{col.label}</span>
                    </div>
                    <span className={`${col.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center`}>
                      {colData.total}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="p-3 space-y-2.5 min-h-[120px]">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
                      ))
                    ) : applicants.length === 0 ? (
                      <div className="flex items-center justify-center h-24 text-slate-500 text-sm">
                        No applicants
                      </div>
                    ) : (
                      <AnimatePresence>
                        {applicants.map((applicant, i) => (
                          <motion.div key={applicant.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}>
                            <ApplicantMiniCard applicant={applicant} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Pagination */}
                  {colData.totalPages > 1 && (
                    <div className="p-3 border-t border-white/10 flex items-center justify-between">
                      <button
                        disabled={colData.page <= 1}
                        onClick={() => setPage(col.key, colData.page - 1)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-400"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-slate-400 font-medium">
                        {colData.page} / {colData.totalPages}
                      </span>
                      <button
                        disabled={colData.page >= colData.totalPages}
                        onClick={() => setPage(col.key, colData.page + 1)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-400"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Job Categories ── */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-indigo-600 font-semibold text-sm mb-3">Available Positions</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-slate-900 dark:text-slate-100">
              Job Categories
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              We manage applicants across a wide range of industries and job types.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {jobCategories.map((cat, i) => (
              <motion.div key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all text-center cursor-default">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {cat.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{cat.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
