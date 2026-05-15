import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch'
import { initializeAuth } from '@/store/slices/authSlice'
import { setTheme } from '@/store/slices/themeSlice'

import MainLayout from '@/components/layout/MainLayout'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

import HomePage from '@/pages/HomePage'
import ApplicantsPage from '@/pages/ApplicantsPage'
import AboutPage from '@/pages/AboutPage'
import LoginPage from '@/pages/auth/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'

function AppInitializer() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.theme.mode)
  useEffect(() => {
    dispatch(setTheme(theme))
    dispatch(initializeAuth())
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer />
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Auth — no layout */}
            <Route path="/login" element={<LoginPage />} />

            {/* Main layout */}
            <Route element={<MainLayout />}>
              <Route path="/"            element={<HomePage />} />
              <Route path="/applicants"  element={<ApplicantsPage />} />
              <Route path="/about"       element={<AboutPage />} />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />
          </Routes>
        </AnimatePresence>
      </ErrorBoundary>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
