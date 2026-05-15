import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2, Palette, BarChart3, Megaphone, DollarSign,
  Database, Package, Headphones, Scale, Smartphone,
  PenTool, Server, ArrowRight,
} from 'lucide-react'

const categories = [
  { name: 'Engineering', icon: Code2, count: 2840, color: 'from-blue-500 to-indigo-600' },
  { name: 'Design', icon: Palette, count: 1230, color: 'from-pink-500 to-rose-600' },
  { name: 'Data Science', icon: BarChart3, count: 980, color: 'from-violet-500 to-purple-600' },
  { name: 'Marketing', icon: Megaphone, count: 760, color: 'from-orange-500 to-amber-600' },
  { name: 'Finance', icon: DollarSign, count: 640, color: 'from-green-500 to-emerald-600' },
  { name: 'Product', icon: Package, count: 520, color: 'from-cyan-500 to-teal-600' },
  { name: 'DevOps', icon: Server, count: 480, color: 'from-slate-500 to-gray-600' },
  { name: 'Mobile', icon: Smartphone, count: 390, color: 'from-yellow-500 to-orange-600' },
  { name: 'Content', icon: PenTool, count: 350, color: 'from-red-500 to-pink-600' },
  { name: 'Support', icon: Headphones, count: 290, color: 'from-teal-500 to-cyan-600' },
  { name: 'Legal', icon: Scale, count: 180, color: 'from-indigo-500 to-blue-600' },
  { name: 'Database', icon: Database, count: 420, color: 'from-purple-500 to-violet-600' },
]

export default function CategoriesSection() {
  const navigate = useNavigate()

  return (
    <section className="py-24 bg-slate-100/30 dark:bg-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="text-indigo-600 font-semibold text-sm mb-3">Browse by Category</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Explore Job Categories</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Find opportunities in your field of expertise across dozens of industries.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon
            return (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => navigate(`/jobs?category=${cat.name}`)}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all text-center"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-indigo-600 transition-colors">{cat.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cat.count.toLocaleString()} jobs</p>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:gap-3 transition-all"
          >
            View all categories <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
