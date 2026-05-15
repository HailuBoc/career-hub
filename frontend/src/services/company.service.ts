import api from './api'

export const companyService = {
  getCompanies: (params = {}) => api.get('/companies', { params }),
  getCompanyBySlug: (slug: string) => api.get(`/companies/${slug}`),
  getMyCompany: () => api.get('/companies/my'),
  createOrUpdate: (data: unknown) => api.post('/companies', data),
  uploadLogo: (file: File) => {
    const form = new FormData()
    form.append('logo', file)
    return api.post('/companies/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}
