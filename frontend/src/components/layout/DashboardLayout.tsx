import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, BookmarkCheck, FileText,
  Bell, Settings, User, LogOut, Menu, Building2,
  Users, BarChart3, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'

const seekerLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/jobs', icon: Briefcase },
  { label: 'My Applications', href: '/dashboard/applications', icon: FileText },
  { label: 'Saved Jobs', href: '/dashboard/saved', icon: BookmarkCheck },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const recruiterLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { label: 'Applications', href: '/dashboard/applications', icon: FileText },
  { label: 'Company Profile', href: '/dashboard/company', icon: Building2 },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const adminLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/dashboard/users', icon: Users },
  { label: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const links = user?.role === 'ADMIN' ? adminLinks : user?.role === 'RECRUITER' ? recruiterLinks : seekerLinks

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">CareerHub</span>
        </Link>
      </div>

      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <Avatar className="h-9 w-9">
            <AvatarImage src={undefined} />
            <AvatarFallback className="text-xs">AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
              {user?.username || 'Admin'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.href
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {link.label}
              {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center px-4 sm:px-6 gap-4">
          <button
            className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link
            to="/dashboard/notifications"
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 relative text-slate-600 dark:text-slate-400"
          >
            <Bell className="h-4 w-4" />
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
