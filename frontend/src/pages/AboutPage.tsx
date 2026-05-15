import { motion } from 'framer-motion'
import { Users, Shield, Target, CheckCircle } from 'lucide-react'
import PageTransition from '@/components/shared/PageTransition'

const features = [
  { icon: Users,       title: 'Applicant Tracking',  desc: 'Manage all applicants in a clear kanban board with Accepted, Pending and Rejected columns.',       color: 'from-indigo-500 to-blue-600' },
  { icon: Shield,      title: 'Admin-Only Access',   desc: 'Secure admin login ensures only authorized personnel can add, edit or delete applicant records.',    color: 'from-violet-500 to-purple-600' },
  { icon: Target,      title: 'Job Assignment',      desc: 'Assign applicants to specific job positions across construction, healthcare, human services and more.', color: 'from-green-500 to-emerald-600' },
  { icon: CheckCircle, title: 'Status Management',   desc: 'Quickly update applicant status and track progress through the hiring pipeline.',                    color: 'from-orange-500 to-amber-600' },
]

const jobTypes = [
  'Construction Worker', 'Scaffolding Technician', 'Electrician', 'Plumber',
  'Registered Nurse', 'Caregiver / Home Nurse', 'Hospital Cleaner',
  'Personal Assistant', 'Domestic Worker', 'Nanny / Childcare Worker',
  'Security Guard', 'Driver / Chauffeur', 'Warehouse Worker',
  'Factory Worker', 'Hotel Housekeeper',
]

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen pt-20 bg-white dark:bg-slate-950">
        {/* Hero */}
        <section className="py-24 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              About ApplicantHub
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl font-extrabold mb-6">
              A Simple, Powerful<br /><span className="gradient-text">Applicant Manager</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl leading-relaxed">
              ApplicantHub is a streamlined platform for managing job applicants across multiple industries.
              Built for administrators who need a clear, organized view of their applicant pipeline.
            </motion.p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold mb-4 text-slate-900 dark:text-slate-100">What We Offer</h2>
            <p className="text-slate-500 dark:text-slate-400">Everything you need to manage your applicant pipeline.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2 text-slate-900 dark:text-slate-100">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Job types */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold mb-4 text-slate-900 dark:text-slate-100">Supported Job Types</h2>
              <p className="text-slate-500 dark:text-slate-400">We manage applicants for the following positions:</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {jobTypes.map((job) => (
                <span key={job}
                  className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                  {job}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
