import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started with your job search.',
    features: [
      'Browse unlimited jobs',
      'Apply to 5 jobs/month',
      'Basic profile',
      'Email notifications',
      'Job alerts',
    ],
    cta: 'Get Started Free',
    href: '/register',
    popular: false,
    variant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: 19,
    description: 'For serious job seekers who want every advantage.',
    features: [
      'Everything in Free',
      'Unlimited applications',
      'Priority profile visibility',
      'Resume review',
      'AI career recommendations',
      'Advanced analytics',
      'Direct recruiter messaging',
    ],
    cta: 'Start Pro Trial',
    href: '/register',
    popular: true,
    variant: 'gradient' as const,
  },
  {
    name: 'Recruiter',
    price: 99,
    description: 'For companies ready to find top talent fast.',
    features: [
      'Post unlimited jobs',
      'Advanced candidate search',
      'Applicant tracking system',
      'Team collaboration',
      'Analytics dashboard',
      'Priority support',
      'Company branding',
    ],
    cta: 'Start Hiring',
    href: '/register?role=RECRUITER',
    popular: false,
    variant: 'outline' as const,
  },
]

export default function PricingSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="text-indigo-600 font-semibold text-sm mb-3">Pricing</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? 'border-indigo-500 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-card shadow-xl shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg">
                    <Zap className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-slate-500 dark:text-slate-400">/month</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.popular ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Check className={`h-3 w-3 ${plan.popular ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to={plan.href}>
                <Button variant={plan.variant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
