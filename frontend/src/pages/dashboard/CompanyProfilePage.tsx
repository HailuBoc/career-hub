import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Building2, Save } from 'lucide-react'
import { companyService } from '@/services/company.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import PageTransition from '@/components/shared/PageTransition'
import toast from 'react-hot-toast'

export default function CompanyProfilePage() {
  const queryClient = useQueryClient()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '', description: '', website: '', industry: '',
    size: '', founded: '', location: '', linkedin: '', twitter: '',
  })
  const [initialized, setInitialized] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['my-company'],
    queryFn: () => companyService.getMyCompany().then((r) => r.data.data.company),
  })

  useEffect(() => {
    if (data && !initialized) {
      setForm({
        name: (data as { name?: string }).name || '',
        description: (data as { description?: string }).description || '',
        website: (data as { website?: string }).website || '',
        industry: (data as { industry?: string }).industry || '',
        size: (data as { size?: string }).size || '',
        founded: (data as { founded?: number }).founded ? String((data as { founded?: number }).founded) : '',
        location: (data as { location?: string }).location || '',
        linkedin: (data as { linkedin?: string }).linkedin || '',
        twitter: (data as { twitter?: string }).twitter || '',
      })
      setInitialized(true)
    }
  }, [data, initialized])

  const saveMutation = useMutation({
    mutationFn: (data: unknown) => companyService.createOrUpdate(data),
    onSuccess: () => {
      toast.success('Company profile saved!')
      queryClient.invalidateQueries({ queryKey: ['my-company'] })
    },
    onError: () => toast.error('Failed to save company profile'),
  })

  const logoMutation = useMutation({
    mutationFn: (file: File) => companyService.uploadLogo(file),
    onSuccess: () => {
      toast.success('Logo updated!')
      queryClient.invalidateQueries({ queryKey: ['my-company'] })
    },
    onError: () => toast.error('Failed to upload logo'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const company = data

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-extrabold">Company Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your company's public profile.</p>
        </div>

        {/* Logo */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 rounded-2xl">
                  <AvatarImage src={company?.logo} />
                  <AvatarFallback className="rounded-2xl text-2xl font-bold">
                    {form.name?.[0] || <Building2 className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) logoMutation.mutate(file)
                  }}
                />
              </div>
              <div>
                <h2 className="font-bold text-lg">{form.name || 'Your Company'}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{form.industry || 'Add your industry'}</p>
                {company?.isVerified && (
                  <span className="text-xs text-indigo-600 font-semibold">✓ Verified</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Company Name *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Acme Corporation"
            />
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="Tell candidates about your company culture, mission, and what makes you unique..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Industry" value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} placeholder="Technology" />
              <Input label="Company Size" value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))} placeholder="51-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Founded Year" value={form.founded} onChange={(e) => setForm((p) => ({ ...p, founded: e.target.value }))} placeholder="2015" type="number" />
              <Input label="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="San Francisco, CA" />
            </div>
            <Input label="Website" value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://yourcompany.com" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="LinkedIn" value={form.linkedin} onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/company/..." />
              <Input label="Twitter" value={form.twitter} onChange={(e) => setForm((p) => ({ ...p, twitter: e.target.value }))} placeholder="https://twitter.com/..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            variant="gradient"
            size="lg"
            isLoading={saveMutation.isPending}
            onClick={() => saveMutation.mutate(form)}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Company Profile
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
