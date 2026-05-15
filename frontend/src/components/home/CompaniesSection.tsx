import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { companyService } from '@/services/company.service'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ArrowRight, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function CompaniesSection() {
  const { data } = useQuery({
    queryKey: ['companies-home'],
    queryFn: () => companyService.getCompanies({ limit: 8 }).then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  })

  return (
    <section className="py-24 bg-slate-100/20 dark:bg-slate-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-3">
              <Building2 className="h-4 w-4" />
              Top Employers
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold">Companies Hiring Now</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Join thousands of professionals working at these leading companies.
            </p>
          </div>
          <Link to="/companies" className="hidden sm:block">
            <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
              All companies
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(data || []).map((company: import('@/types').Company, i: number) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link to={`/companies/${company.slug}`}>
                <div className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 rounded-xl">
                      <AvatarImage src={company.logo} />
                      <AvatarFallback className="rounded-xl font-bold">
                        {company.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {company.name}
                        </p>
                        {company.isVerified && (
                          <span className="text-indigo-500 text-xs flex-shrink-0">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{company.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{company.size} employees</Badge>
                    <span className="text-xs text-indigo-600 font-semibold">
                      {company._count?.jobs ?? 0} open roles
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
