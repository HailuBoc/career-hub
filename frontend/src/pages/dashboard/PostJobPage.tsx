import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, X, ArrowLeft, Briefcase } from 'lucide-react'
import { jobService } from '@/services/job.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import PageTransition from '@/components/shared/PageTransition'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  type: z.string().min(1, 'Job type is required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  location: z.string().min(1, 'Location is required'),
  isRemote: z.boolean(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  salaryCurrency: z.string(),
  deadline: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const categories = [
  'Engineering', 'Design', 'Marketing', 'Sales', 'Finance',
  'Data Science', 'Product', 'Operations', 'HR', 'Legal',
  'Customer Support', 'Mobile', 'Content', 'DevOps',
]

export default function PostJobPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [requirements, setRequirements] = useState<string[]>([''])
  const [responsibilities, setResponsibilities] = useState<string[]>([''])
  const [skills, setSkills] = useState<string[]>([''])

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'FULL_TIME', experienceLevel: 'MID', salaryCurrency: 'USD', isRemote: false },
  })

  const mutation = useMutation({
    mutationFn: (data: unknown) => jobService.createJob(data),
    onSuccess: () => {
      toast.success('Job posted successfully!')
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] })
      navigate('/dashboard/jobs')
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to post job')
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      ...data,
      requirements: requirements.filter(Boolean),
      responsibilities: responsibilities.filter(Boolean),
      skills: skills.filter(Boolean),
      salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
    })
  }

  const updateListItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const updated = [...list]
    updated[index] = value
    setList(updated)
  }

  const addListItem = (setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList((prev) => [...prev, ''])
  }

  const removeListItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    if (list.length > 1) setList(list.filter((_, i) => i !== index))
  }

  const ListEditor = ({
    label,
    items,
    setItems,
    placeholder,
  }: {
    label: string
    items: string[]
    setItems: React.Dispatch<React.SetStateAction<string[]>>
    placeholder: string
  }) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => updateListItem(items, setItems, i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => removeListItem(items, setItems, i)}
              className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addListItem(setItems)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          Add item
        </Button>
      </div>
    </div>
  )

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold">Post a New Job</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details to attract the right candidates.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input
                {...register('title')}
                label="Job Title"
                placeholder="e.g. Senior Frontend Engineer"
                error={errors.title?.message}
              />

              <div>
                <label className="block text-sm font-medium mb-1.5">Job Description *</label>
                <textarea
                  {...register('description')}
                  rows={6}
                  placeholder="Describe the role, team, and what makes this opportunity exciting..."
                  className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category *</label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Job Type *</label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">Full Time</SelectItem>
                          <SelectItem value="PART_TIME">Part Time</SelectItem>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                          <SelectItem value="INTERNSHIP">Internship</SelectItem>
                          <SelectItem value="FREELANCE">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Experience Level *</label>
                  <Controller
                    name="experienceLevel"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENTRY">Entry Level</SelectItem>
                          <SelectItem value="JUNIOR">Junior</SelectItem>
                          <SelectItem value="MID">Mid Level</SelectItem>
                          <SelectItem value="SENIOR">Senior</SelectItem>
                          <SelectItem value="LEAD">Lead</SelectItem>
                          <SelectItem value="EXECUTIVE">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Input
                  {...register('location')}
                  label="Location *"
                  placeholder="e.g. San Francisco, CA"
                  error={errors.location?.message}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isRemote')} className="h-4 w-4 rounded border-slate-200 dark:border-slate-700 text-indigo-600" />
                <span className="text-sm font-medium">This is a remote position</span>
              </label>
            </CardContent>
          </Card>

          {/* Salary */}
          <Card>
            <CardHeader><CardTitle>Salary Range</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Input {...register('salaryMin')} label="Min Salary" type="number" placeholder="80000" />
                <Input {...register('salaryMax')} label="Max Salary" type="number" placeholder="120000" />
                <div>
                  <label className="block text-sm font-medium mb-1.5">Currency</label>
                  <Controller
                    name="salaryCurrency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <Input {...register('deadline')} label="Application Deadline (optional)" type="date" className="mt-4 max-w-xs" />
            </CardContent>
          </Card>

          {/* Lists */}
          <Card>
            <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <ListEditor label="Responsibilities" items={responsibilities} setItems={setResponsibilities} placeholder="e.g. Build and maintain frontend features" />
              <ListEditor label="Requirements" items={requirements} setItems={setRequirements} placeholder="e.g. 3+ years of React experience" />
              <ListEditor label="Required Skills" items={skills} setItems={setSkills} placeholder="e.g. React" />
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="gradient" size="lg" isLoading={mutation.isPending}>
              Post Job
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  )
}
