import { useState } from 'react'
import { Edit2, Trash2, User, BookOpen, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Applicant, ApplicantStatus } from '@/types'

interface Props {
  applicant: Applicant
  isSelected: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: ApplicantStatus) => void
  isAdmin: boolean
}

const statusOptions: { value: ApplicantStatus; label: string; color: string }[] = [
  { value: 'ACCEPTED', label: 'Accepted', color: 'text-green-600' },
  { value: 'PENDING',  label: 'Pending',  color: 'text-yellow-600' },
  { value: 'REJECTED', label: 'Rejected', color: 'text-red-600' },
]

export default function ApplicantCard({
  applicant, isSelected, onToggleSelect, onEdit, onDelete, onStatusChange, isAdmin,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fullName = `${applicant.firstName} ${applicant.lastName}`
  const genderLabel = applicant.gender === 'MALE' ? 'Male' : applicant.gender === 'FEMALE' ? 'Female' : 'Other'

  return (
    <div className={`rounded-xl border bg-white dark:bg-slate-900 p-4 transition-all ${
      isSelected
        ? 'border-indigo-400 dark:border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-900/20'
        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
    }`}>
      {/* Top row: checkbox + photo + name */}
      <div className="flex items-start gap-3">
        {isAdmin && (
          <button
            onClick={onToggleSelect}
            className="mt-0.5 flex-shrink-0 h-4 w-4 rounded border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors hover:border-indigo-500"
            style={{ background: isSelected ? '#6366f1' : 'transparent', borderColor: isSelected ? '#6366f1' : undefined }}
          >
            {isSelected && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </button>
        )}

        {/* Photo */}
        <div className="flex-shrink-0">
          {applicant.photo ? (
            <img
              src={applicant.photo}
              alt={fullName}
              className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <User className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {applicant.age} years • {genderLabel}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Passport: <span className="font-medium text-slate-700 dark:text-slate-300">{applicant.passportNo}</span></span>
        </div>
        {/* Only show job row when a job is assigned */}
        {applicant.job ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Job: <span className="font-medium text-indigo-600 dark:text-indigo-400">{applicant.job.title}</span></span>
          </div>
        ) : isAdmin ? (
          <div className="flex items-center gap-2 text-xs">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span className="text-indigo-500 dark:text-indigo-400 cursor-pointer hover:underline" onClick={onEdit}>
              Assign job
            </span>
          </div>
        ) : null}
      </div>

      {/* Actions */}
      {isAdmin && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Edit2 className="h-3.5 w-3.5" />}
              onClick={onEdit}
              className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 h-7 px-2 text-xs"
            >
              Edit
            </Button>
          </div>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => { onDelete(); setConfirmDelete(false) }}>
                Confirm
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
