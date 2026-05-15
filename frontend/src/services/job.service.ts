import api from './api'

export interface JobFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  type?: string
  experienceLevel?: string
  location?: string
  isRemote?: boolean
  salaryMin?: number
  salaryMax?: number
  sortBy?: string
  order?: string
}

export const jobService = {
  getJobs: (filters: JobFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) params.append(k, String(v))
    })
    return api.get(`/jobs?${params}`)
  },

  getFeaturedJobs: () => api.get('/jobs/featured'),

  getJobBySlug: (slug: string) => api.get(`/jobs/${slug}`),

  getCategories: () => api.get('/jobs/categories'),

  getMyJobs: (params = {}) => api.get('/jobs/my-jobs', { params }),

  createJob: (data: unknown) => api.post('/jobs', data),

  updateJob: (id: string, data: unknown) => api.put(`/jobs/${id}`, data),

  deleteJob: (id: string) => api.delete(`/jobs/${id}`),
}
