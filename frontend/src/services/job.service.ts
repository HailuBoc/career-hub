import api from './api'

export const jobService = {
  getJobs: () => api.get('/jobs'),
  createJob: (data: unknown) => api.post('/jobs', data),
  updateJob: (id: string, data: unknown) => api.put(`/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`),
}
