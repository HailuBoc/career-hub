import { useForm } from 'react-hook-form'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import type { JobFilters } from '@/services/job.service'

interface Props {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  onReset: () => void
}

const categories = [
  'Engineering', 'Design', 'Marketing', 'Sales', 'Finance',
  'Data Science', 'Product', 'Operations', 'HR', 'Legal',
  'Customer Support', 'Mobile', 'Content', 'DevOps',
]

export default function JobFilters({ filters, onChange, onReset }: Props) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<JobFilters>({
    defaultValues: filters,
  })

  const onSubmit = (data: JobFilters) => onChange({ ...data, page: 1 })

  const handleReset = () => {
    reset({})
    onReset()
  }

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && v !== null && v !== 1 && v !== 10
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          {...register('search')}
          placeholder="Search jobs, companies, skills..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select value={watch('category') || ''} onValueChange={(v) => setValue('category', v === 'all' ? '' : v)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={watch('type') || ''} onValueChange={(v) => setValue('type', v === 'all' ? '' : v)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FULL_TIME">Full Time</SelectItem>
            <SelectItem value="PART_TIME">Part Time</SelectItem>
            <SelectItem value="CONTRACT">Contract</SelectItem>
            <SelectItem value="INTERNSHIP">Internship</SelectItem>
            <SelectItem value="FREELANCE">Freelance</SelectItem>
          </SelectContent>
        </Select>

        <Select value={watch('experienceLevel') || ''} onValueChange={(v) => setValue('experienceLevel', v === 'all' ? '' : v)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="ENTRY">Entry Level</SelectItem>
            <SelectItem value="JUNIOR">Junior</SelectItem>
            <SelectItem value="MID">Mid Level</SelectItem>
            <SelectItem value="SENIOR">Senior</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
            <SelectItem value="EXECUTIVE">Executive</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            {...register('location')}
            placeholder="Location"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer text-white">
          <input
            type="checkbox"
            {...register('isRemote')}
            className="h-4 w-4 rounded border-white/30 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium">Remote only</span>
        </label>
        <div className="flex-1" />
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}
            className="text-white hover:bg-white/10"
            leftIcon={<X className="h-4 w-4" />}>
            Clear
          </Button>
        )}
        <Button type="submit" size="sm" leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
          Apply Filters
        </Button>
      </div>
    </form>
  )
}
