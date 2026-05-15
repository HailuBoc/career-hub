import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, CheckCircle, Clock, XCircle, ArrowRight, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import PageTransition from '@/components/shared/PageTransition'

const jobCategories = [
  { name: 'Construction',   color: 'from-orange-500 to-amber-600',   icon: '🏗️', desc: 'Building & infrastructure work' },
  { name: 'Healthcare',     color: 'from-red-500 to-rose-600',       icon: '🏥', desc: 'Nursing, caregiving & medical' },
  { name: 'Human Services', color: 'from-blue-500 to-indigo-600',    icon: '🤝', desc: 'Domestic, nanny & personal care' },
  { name: 'Security',       color: 'from-slate-600 to-slate-700',    icon: '🛡️', desc: 'Guards & safety personnel' },
  { name: 'Transport',      color: 'from-green-500 to-emerald-600',  icon: '🚗', desc: 'Drivers & logistics' },
  { name: 'Hospitality',    color: 'from-pink-500 to-rose-500',      icon: '🏨', desc: 'Hotels, cleaning & service' },
  { name: 'Manufacturing',  color: 'from-violet-500 to-purple-600',  icon: '🏭', desc: 'Factory & production work' },
  { name: 'Logistics',      color: 'from-cyan-500 to-teal-600',      icon: '📦', desc: 'Warehouse & supply chain' },
]

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ['applicants-summary'],
    queryFn: () => api.get('/applicants').then((r) => r.data.data),
    retry: false,
  })

  const accepted = data?.accepted?.total ?? 0
  const pending  = data?.pending?.total  ?? 0
  const rejected = data?.rejected?.total ?? 0
  const total    = accepted + pending + rejected

  return (
    <PageTransition>
      {/* Hero */}
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
              Track, manage and process job applicants across construction, healthcare, human services and more — all in one place.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/applicants">
                <Button variant="gradient" size="xl" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  View Applicants
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="xl"
                  className="border-white/20 text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Live stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Total Applicants', value: total,    icon: Users,        color: 'text-indigo-400' },
              { label: 'Accepted',         value: accepted, icon: CheckCircle,  color: 'text-green-400'  },
              { label: 'Pending',          value: pending,  icon: Clock,        color: 'text-yellow-400' },
              { label: 'Rejected',         value: rejected, icon: XCircle,      color: 'text-red-400'    },
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

      {/* Job Categories */}
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

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="max-w-2xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">Ready to manage applicants?</h2>
          <p className="text-indigo-200 mb-8">Sign in as admin to add, edit and track all applicants.</p>
          <Link to="/login">
            <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 h-12 rounded-xl">
              Admin Login
            </Button>
          </Link>
        </div>
      </section>
    </PageTransition>
  )
}
