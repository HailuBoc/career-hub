import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Camera, Upload, Plus, X, Save, Globe, MapPin, Phone } from 'lucide-react'
import { profileService } from '@/services/profile.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import PageTransition from '@/components/shared/PageTransition'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { updateUser } from '@/store/slices/authSlice'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [skillInput, setSkillInput] = useState('')
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', headline: '', bio: '',
    phone: '', location: '', website: '', linkedin: '', github: '',
    skills: [] as string[],
  })
  const [initialized, setInitialized] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile().then((r) => r.data.data.profile),
  })

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        headline: data.headline || '',
        bio: data.bio || '',
        phone: data.phone || '',
        location: data.location || '',
        website: data.website || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
        skills: data.skills || [],
      })
      setInitialized(true)
    }
  }, [data, initialized])

  const updateMutation = useMutation({
    mutationFn: (data: unknown) => profileService.updateProfile(data),
    onSuccess: (res) => {
      toast.success('Profile updated!')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      dispatch(updateUser({ profile: res.data.data.profile }))
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: () => {
      toast.success('Avatar updated!')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error('Failed to upload avatar'),
  })

  const resumeMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadResume(file),
    onSuccess: () => {
      toast.success('Resume uploaded!')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error('Failed to upload resume'),
  })

  const addSkill = () => {
    const skill = skillInput.trim()
    if (skill && !formData.skills.includes(skill)) {
      setFormData((p) => ({ ...p, skills: [...p.skills, skill] }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-8"><ProfileSkeleton /></div>
      </div>
    )
  }

  const profile = data

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">My Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your professional profile and resume.</p>
          </div>

          {/* Avatar & basic */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar} />
                    <AvatarFallback className="text-xl">
                      {getInitials(formData.firstName, formData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) avatarMutation.mutate(file)
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{formData.firstName} {formData.lastName}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{formData.headline || 'Add a headline'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal info */}
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                />
                <Input
                  label="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <Input
                label="Professional headline"
                value={formData.headline}
                onChange={(e) => setFormData((p) => ({ ...p, headline: e.target.value }))}
                placeholder="e.g. Senior Frontend Engineer at TechCorp"
              />
              <div>
                <label className="block text-sm font-medium mb-1.5">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  placeholder="Tell employers about yourself..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  leftIcon={<Phone className="h-4 w-4" />}
                  placeholder="+1 (555) 000-0000"
                />
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  leftIcon={<MapPin className="h-4 w-4" />}
                  placeholder="City, Country"
                />
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader><CardTitle>Links & Social</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Website" value={formData.website} onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))} leftIcon={<Globe className="h-4 w-4" />} placeholder="https://yoursite.com" />
              <Input label="LinkedIn" value={formData.linkedin} onChange={(e) => setFormData((p) => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/username" />
              <Input label="GitHub" value={formData.github} onChange={(e) => setFormData((p) => ({ ...p, github: e.target.value }))} placeholder="https://github.com/username" />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (press Enter)"
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="button" variant="outline" onClick={addSkill} leftIcon={<Plus className="h-4 w-4" />}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader><CardTitle>Resume</CardTitle></CardHeader>
            <CardContent>
              {profile?.resumeUrl ? (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{profile.resumeName || 'Resume'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded resume</p>
                  </div>
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">View</Button>
                  </a>
                </div>
              ) : null}
              <div>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) resumeMutation.mutate(file)
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => resumeInputRef.current?.click()}
                  isLoading={resumeMutation.isPending}
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  {profile?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">PDF, DOC, or DOCX. Max 10MB.</p>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              variant="gradient"
              size="lg"
              isLoading={updateMutation.isPending}
              onClick={() => updateMutation.mutate(formData)}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
