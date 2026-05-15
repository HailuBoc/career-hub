import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Building2 } from 'lucide-react'
import { companyService } from '@/services/company.service'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PageTransition from '@/components/shared/PageTransition'

export default function CompaniesPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search],
    queryFn: () => companyService.getCompanies({ search, limit: 24 }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const companies = data?.data || []

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 bg-white dark:bg-slate-900">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-4xl font-extrabold mb-3">Explore Companies</h1>
            <p className="text-slate-400 mb-8">Discover top employers and find your perfect workplace.</p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <EmptyState icon={Building2} title="No companies found" description="Try a different search term." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {companies.map((company: import('@/types').Company, i: number) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link to={`/companies/${company.slug}`}>
                    <div className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-14 w-14 rounded-xl">
                          <AvatarImage src={company.logo} />
                          <AvatarFallback className="rounded-xl text-lg font-bold">{company.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-bold text-sm truncate group-hover:text-indigo-600 transition-colors">{company.name}</p>
                            {company.isVerified && <span className="text-indigo-500 text-xs">✓</span>}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{company.industry}</p>
                        </div>
                      </div>
                      {company.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{company.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{company.size}</Badge>
                        <span className="text-xs text-indigo-600 font-semibold">{company._count?.jobs ?? 0} jobs</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
