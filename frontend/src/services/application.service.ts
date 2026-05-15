import api from './api'

export const applicationService = {
  apply: (jobId: string, data: FormData) =>
    api.post(`/applications/job/${jobId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMyApplications: (params = {}) => api.get('/applications/my', { params }),

  getJobApplications: (jobId: string, params = {}) =>
    api.get(`/applications/job/${jobId}`, { params }),

  updateStatus: (id: string, status: string, notes?: string) =>
    api.put(`/applications/${id}/status`, { status, notes }),

  withdraw: (id: string) => api.delete(`/applications/${id}`),
}
