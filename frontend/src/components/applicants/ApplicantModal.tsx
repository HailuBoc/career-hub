import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, User } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import type { Applicant } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  applicant: Applicant | null
  onClose: () => void
  onSuccess: () => void
}

export default function ApplicantModal({ applicant, onClose, onSuccess }: Props) {
  const isEdit = !!applicant
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>(applicant?.photo || '')

  // Combine firstName + lastName into a single fullName field for display
  const initialFullName = applicant
    ? `${applicant.firstName} ${applicant.lastName}`.trim()
    : ''

  const [form, setForm] = useState({
    fullName:   initialFullName,
    age:        applicant?.age?.toString() || '',
    gender:     applicant?.gender    || 'MALE',
    passportNo: applicant?.passportNo || '',
    jobId:      applicant?.jobId      || '',
    status:     applicant?.status     || 'PENDING',
    notes:      applicant?.notes      || '',
  })

  const { data: jobsData } = useQuery({
    queryKey: ['jobs-list'],
    queryFn: () => api.get('/jobs').then((r) => r.data.data.jobs),
  })

  const mutation = useMutation({
    mutationFn: () => {
      // Split fullName into firstName + lastName for the backend
      const parts = form.fullName.trim().split(/\s+/)
      const firstName = parts[0] || ''
      const lastName  = parts.slice(1).join(' ') || parts[0] || ''

      const fd = new FormData()
      fd.append('firstName', firstName)
      fd.append('lastName',  lastName)
      if (form.age)        fd.append('age',        form.age)
      if (form.gender)     fd.append('gender',     form.gender)
      if (form.passportNo) fd.append('passportNo', form.passportNo)
      if (form.jobId)      fd.append('jobId',      form.jobId)
      if (form.status)     fd.append('status',     form.status)
      if (form.notes)      fd.append('notes',      form.notes)
      if (photoFile)       fd.append('photo',      photoFile)

      return isEdit
        ? api.put(`/applicants/${applicant!.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : api.post('/applicants', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Applicant updated' : 'Applicant added')
      onSuccess()
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save applicant')
    },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isEdit ? 'Edit Applicant' : 'Add New Applicant'}
          </h2>
          <button onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Photo upload */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview"
                className="h-20 w-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <User className="h-8 w-8 text-slate-400" />
              </div>
            )}
            <button onClick={() => photoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-lg">
              <Upload className="h-3.5 w-3.5" />
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Applicant Photo</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG up to 5MB</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Single full name field */}
          <Input
            label="Full Name *"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            placeholder="e.g. Abate Abiye Fenta"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age *"
              type="number"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder="25"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gender *</label>
              <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Input
            label="Passport Number *"
            value={form.passportNo}
            onChange={(e) => set('passportNo', e.target.value)}
            placeholder="EP1234567"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Job Position</label>
            <Select value={form.jobId || 'none'} onValueChange={(v) => set('jobId', v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Choose a job..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Not assigned —</SelectItem>
                {(jobsData || []).map((job: { id: string; title: string }) => (
                  <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <Select value={form.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Optional notes..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="gradient"
            className="flex-1"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {isEdit ? 'Save Changes' : 'Add Applicant'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
