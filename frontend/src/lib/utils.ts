import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min?: number | null, max?: number | null, currency = 'USD') {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return 'Competitive'
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?'
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export const JOB_TYPES: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
}

export const EXPERIENCE_LEVELS: Record<string, string> = {
  ENTRY: 'Entry Level',
  JUNIOR: 'Junior',
  MID: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
}

export const APPLICATION_STATUSES: Record<string, { label: string; color: string }> = {
  PENDING:     { label: 'Pending',     color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  REVIEWING:   { label: 'Reviewing',   color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  REJECTED:    { label: 'Rejected',    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  HIRED:       { label: 'Hired',       color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
}
