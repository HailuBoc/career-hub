import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Bell, Moon, Sun, Shield, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PageTransition from '@/components/shared/PageTransition'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch'
import { toggleTheme } from '@/store/slices/themeSlice'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.theme.mode)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 bg-white dark:bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences.</p>
          </div>

          {/* Appearance */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5" />Appearance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Theme</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
                </div>
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className={`relative h-6 w-11 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Change Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input label="Current password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} required />
                <Input label="New password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} required />
                <Input label="Confirm new password" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} required />
                <Button type="submit" variant="gradient" isLoading={loading}>Update Password</Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Application updates', desc: 'Get notified when your application status changes' },
                { label: 'New job matches', desc: 'Receive alerts for jobs matching your profile' },
                { label: 'Newsletter', desc: 'Weekly career tips and industry news' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-indigo-600">
                    <span className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white shadow" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader><CardTitle className="flex items-center gap-2 text-red-500"><Shield className="h-5 w-5" />Danger Zone</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Delete Account</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm" leftIcon={<Trash2 className="h-4 w-4" />}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
