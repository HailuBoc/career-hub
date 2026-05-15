import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Eye } from 'lucide-react'
import api from '@/services/api'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PageTransition from '@/components/shared/PageTransition'
import { timeAgo } from '@/lib/utils'

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => api.get('/blog').then((r) => r.data),
  })

  const posts = data?.data || []

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 bg-white dark:bg-slate-900">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-4xl font-extrabold mb-3">Career Insights</h1>
            <p className="text-slate-400">Expert advice, industry trends, and career tips.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState icon={BookOpen} title="No posts yet" description="Check back soon for career insights." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: { id: string; slug: string; title: string; excerpt?: string; tags: string[]; views: number; createdAt: string; author?: { profile?: { firstName?: string; lastName?: string } } }, i: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-lg transition-all overflow-hidden h-full">
                      <div className="h-40 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white/50" />
                      </div>
                      <div className="p-5">
                        <div className="flex gap-2 mb-3">
                          {post.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        <h3 className="font-bold text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>{post.author?.profile?.firstName} {post.author?.profile?.lastName}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(post.createdAt)}</span>
                          </div>
                        </div>
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
