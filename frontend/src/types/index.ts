export interface AdminUser {
  id: string
  username: string
  role: 'ADMIN'
}

export interface Job {
  id: string
  title: string
  category: string
  description?: string
  location?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  applicantCount?: number
  _count?: { applicants: number }
}

export type ApplicantStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface Applicant {
  id: string
  firstName: string
  lastName: string
  age: number
  gender: Gender
  passportNo: string
  photo?: string
  jobId?: string
  status: ApplicantStatus
  notes?: string
  createdAt: string
  updatedAt: string
  job?: { id: string; title: string }
}

export interface ColumnData {
  data: Applicant[]
  total: number
}

export interface ApplicantsResponse {
  accepted: ColumnData
  pending: ColumnData
  rejected: ColumnData
}

// Legacy aliases kept so old unused files compile without errors
export type Company = {
  id: string
  name: string
  slug: string
  logo?: string
  industry?: string
  size?: string
  location?: string
  isVerified: boolean
  createdAt: string
  _count?: { jobs: number; reviews: number }
}

export type Application = {
  id: string
  jobId: string
  userId: string
  status: string
  createdAt: string
  updatedAt: string
  job?: { id: string; title: string; slug: string; company?: { name: string; logo?: string } }
  user?: { id: string; email: string; profile?: { firstName: string; lastName: string; avatar?: string; headline?: string; skills?: string[] } }
}

export type Notification = {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  link?: string
  createdAt: string
}
