import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Frontend Engineer',
    company: 'TechNova Inc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    content: 'CareerHub completely transformed my job search. Within 3 weeks I had 5 interviews and landed my dream role at a top tech company. The platform is incredibly intuitive.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Designer',
    company: 'DesignCraft Studio',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    content: 'As a designer, I was blown away by the quality of companies on CareerHub. The filtering system is excellent and I found exactly the type of creative role I was looking for.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Data Scientist',
    company: 'DataStream Analytics',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    content: 'The AI career recommendations were spot on. CareerHub suggested roles I hadn\'t even considered but were perfect for my skill set. Highly recommend to any data professional.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'DevOps Engineer',
    company: 'GreenPath Energy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    content: 'I\'ve used many job platforms but CareerHub stands out. The application tracking dashboard is a game changer — I always knew exactly where I stood with each company.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Manager',
    company: 'FinEdge Capital',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    content: 'Found my current role through CareerHub in just 2 weeks. The platform made it easy to showcase my portfolio and the companies here are genuinely looking for talent.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Full Stack Developer',
    company: 'TechNova Inc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    content: 'The resume upload feature and profile completion system helped me present myself professionally. Got hired at my target company within a month of joining CareerHub.',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="text-indigo-600 font-semibold text-sm mb-3">Success Stories</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">What Our Users Say</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Thousands of professionals have found their dream jobs through CareerHub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-indigo-100 dark:text-indigo-900" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800"
                />
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
