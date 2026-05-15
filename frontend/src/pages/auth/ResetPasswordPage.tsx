import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-slate-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {done ? (
          <div className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Password reset!</h1>
            <p className="text-slate-500 dark:text-slate-400">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold mb-2">Set new password</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Choose a strong password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" leftIcon={<Lock className="h-4 w-4" />} required />
              <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" leftIcon={<Lock className="h-4 w-4" />} required />
              <Button type="submit" variant="gradient" size="lg" className="w-full" isLoading={loading}>Reset Password</Button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-indigo-600 hover:underline">Back to sign in</Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
