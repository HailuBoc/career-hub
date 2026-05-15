import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Is CareerHub free to use?',
    a: 'Yes! Our Free plan lets you browse unlimited jobs and apply to up to 5 positions per month. Upgrade to Pro for unlimited applications and premium features.',
  },
  {
    q: 'How do I apply for a job?',
    a: 'Create an account, complete your profile, upload your resume, and click "Apply" on any job listing. You can track all your applications from your dashboard.',
  },
  {
    q: 'Can I post jobs as a recruiter?',
    a: 'Absolutely. Sign up with a Recruiter account, create your company profile, and start posting jobs immediately. Our Recruiter plan includes advanced applicant tracking tools.',
  },
  {
    q: 'How does the AI career recommendation work?',
    a: 'Our AI analyzes your profile, skills, experience, and application history to suggest jobs that are the best match for your background and career goals.',
  },
  {
    q: 'Is my data secure?',
    a: 'We take security seriously. All data is encrypted in transit and at rest. We never sell your personal information to third parties.',
  },
  {
    q: 'Can I apply with my LinkedIn profile?',
    a: 'You can import your LinkedIn data to quickly fill out your CareerHub profile. We also support direct resume uploads in PDF and Word formats.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-24 bg-slate-100/20 dark:bg-slate-800/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="text-indigo-600 font-semibold text-sm mb-3">FAQ</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400">Everything you need to know about CareerHub.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-semibold text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
