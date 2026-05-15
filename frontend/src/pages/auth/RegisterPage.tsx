import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAuth } from '@/hooks/useAuth'
import { registerUser, clearError } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['JOBSEEKER', 'RECRUITER']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const defaultRole = searchParams.get('role') === 'RECRUITER' ? 'RECRUITER' : 'JOBSEEKER'

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  })

  const role = watch('role')

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) toast.error(error)
    return () => { dispatch(clearError()) }
  }, [error, dispatch])

  const onSubmit = (data: FormData) => {
    dispatch(registerUser({ ...data }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">CareerHub</span>
        </div>

        <h1 className="text-3xl font-extrabold mb-2">Create your account</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Join thousands of professionals on CareerHub</p>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: 'JOBSEEKER', label: 'Job Seeker', icon: User, desc: 'Find your dream job' },
            { value: 'RECRUITER', label: 'Recruiter', icon: Building2, desc: 'Hire top talent' },
          ].map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('role', value as 'JOBSEEKER' | 'RECRUITER')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                role === value
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <Icon className={`h-5 w-5 mb-2 ${role === value ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`} />
              <p className={`font-semibold text-sm ${role === value ? 'text-indigo-600' : ''}`}>{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              label="First name"
              placeholder="John"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.firstName?.message}
            />
            <Input
              {...register('lastName')}
              label="Last name"
              placeholder="Doe"
              error={errors.lastName?.message}
            />
          </div>

          <Input
            {...register('email')}
            label="Email address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          />

          <Input
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
          />

          <Input
            {...register('confirmPassword')}
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
          />

          <p className="text-xs text-slate-500 dark:text-slate-400">
            By creating an account, you agree to our{' '}
            <Link to="/" className="text-indigo-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
          </p>

          <Button type="submit" variant="gradient" size="lg" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
