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
  page: number
  totalPages: number
}

export interface ApplicantsResponse {
  accepted: ColumnData
  pending: ColumnData
  rejected: ColumnData
}
