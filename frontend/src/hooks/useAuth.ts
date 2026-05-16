import { useAppSelector, useAppDispatch } from './useAppDispatch'
import { logout } from '@/store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken, isLoading, isInitialized, error } = useAppSelector((s) => s.auth)

  return {
    user,
    accessToken,
    isLoading,
    isInitialized,
    error,
    isAuthenticated: !!user && !!accessToken,
    isAdmin: user?.role === 'ADMIN',
    // Legacy — always false in this simplified app
    isJobSeeker: false,
    isRecruiter: false,
    logout: () => dispatch(logout()),
  }
}
