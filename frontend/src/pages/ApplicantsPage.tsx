import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, CheckSquare, Square, CheckCircle,
  Clock, XCircle, Edit2, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import PageTransition from '@/components/shared/PageTransition'
import ApplicantModal from '@/components/applicants/ApplicantModal'
import ApplicantCard from '@/components/applicants/ApplicantCard'
import type { Applicant, ApplicantStatus, ApplicantsResponse } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

type Pages = { accepted: number; pending: number; rejected: number }

const columns: { key: ApplicantStatus; label: string; icon: typeof CheckCircle; color: string; bg: string; border: string; badge: string }[] = [
  {
    key: 'ACCEPTED',
    label: 'Accepted',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-500',
  },
  {
    key: 'PENDING',
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-500',
  },
  {
    key: 'REJECTED',
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-500',
  },
]

export default function ApplicantsPage() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pages, setPages] = useState<Pages>({ accepted: 1, pending: 1, rejected: 1 })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [editApplicant, setEditApplicant] = useState<Applicant | null>(null)

  const queryKey = ['applicants', search, pages]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      api.get('/applicants', {
        params: {
          search: search || undefined,
          acceptedPage: pages.accepted,
          pendingPage: pages.pending,
          rejectedPage: pages.rejected,
        },
      }).then((r) => r.data.data as ApplicantsResponse),
    staleTime: 30 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/applicants/${id}`),
    onSuccess: () => {
      toast.success('Applicant deleted')
      queryClient.invalidateQueries({ queryKey: ['applicants'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/applicants/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] })
    },
  })

  const handleSelectAll = (status: ApplicantStatus) => {
    const col = data?.[status.toLowerCase() as keyof ApplicantsResponse] as { data: Applicant[] } | undefined
    if (!col) return
    const ids = col.data.map((a) => a.id)
    const allSelected = ids.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }

  const handleUnselectAll = () => setSelected(new Set())

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const setPage = (col: keyof Pages, page: number) => {
    setPages((p) => ({ ...p, [col]: page }))
  }

  const openCreate = () => { setEditApplicant(null); setModalOpen(true) }
  const openEdit = (a: Applicant) => { setEditApplicant(a); setModalOpen(true) }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-white">
                <h1 className="text-3xl font-extrabold">Applicants</h1>
                <p className="text-slate-400 mt-1">
                  {(data?.accepted.total ?? 0) + (data?.pending.total ?? 0) + (data?.rejected.total ?? 0)} total applicants
                </p>
              </div>
              {isAuthenticated && (
                <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                  Add Applicant
                </Button>
              )}
            </div>

            {/* Search + bulk actions */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPages({ accepted: 1, pending: 1, rejected: 1 }) }}
                  placeholder="Search by name or passport..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">{selected.size} selected</span>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleUnselectAll}>
                    Unselect All
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => {
              const colKey = col.key.toLowerCase() as keyof ApplicantsResponse
              const colData = data?.[colKey]
              const applicants: Applicant[] = colData?.data || []
              const total = colData?.total ?? 0
              const currentPage = colData?.page ?? 1
              const totalPages = colData?.totalPages ?? 1
              const Icon = col.icon
              const pageKey = col.key.toLowerCase() as keyof Pages

              return (
                <div key={col.key} className={`rounded-2xl border ${col.border} ${col.bg} overflow-hidden`}>
                  {/* Column header */}
                  <div className="p-4 border-b border-inherit">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${col.color}`} />
                        <span className="font-bold text-slate-900 dark:text-slate-100">{col.label}</span>
                      </div>
                      <span className={`${col.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center`}>
                        {total}
                      </span>
                    </div>
                    {/* Select all / Unselect all */}
                    {isAuthenticated && applicants.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSelectAll(col.key)}
                          className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                          Select All
                        </button>
                        {applicants.some((a) => selected.has(a.id)) && (
                          <button
                            onClick={() => {
                              setSelected((prev) => {
                                const next = new Set(prev)
                                applicants.forEach((a) => next.delete(a.id))
                                return next
                              })
                            }}
                            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                          >
                            <Square className="h-3.5 w-3.5" />
                            Unselect All
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="p-3 space-y-3 min-h-[200px]">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 rounded-xl" />
                      ))
                    ) : applicants.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                        No applicants
                      </div>
                    ) : (
                      <AnimatePresence>
                        {applicants.map((applicant, i) => (
                          <motion.div
                            key={applicant.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <ApplicantCard
                              applicant={applicant}
                              isSelected={selected.has(applicant.id)}
                              onToggleSelect={() => toggleSelect(applicant.id)}
                              onEdit={() => openEdit(applicant)}
                              onDelete={() => deleteMutation.mutate(applicant.id)}
                              onStatusChange={(status) => statusMutation.mutate({ id: applicant.id, status })}
                              isAdmin={isAuthenticated}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-3 border-t border-inherit flex items-center justify-between">
                      <button
                        disabled={currentPage <= 1}
                        onClick={() => setPage(pageKey, currentPage - 1)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage(pageKey, currentPage + 1)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
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
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ApplicantModal
            applicant={editApplicant}
            onClose={() => setModalOpen(false)}
            onSuccess={() => {
              setModalOpen(false)
              queryClient.invalidateQueries({ queryKey: ['applicants'] })
            }}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
