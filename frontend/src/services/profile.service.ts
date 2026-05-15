import api from './api'

export const profileService = {
  getProfile: () => api.get('/profile'),

  updateProfile: (data: unknown) => api.put('/profile', data),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  uploadResume: (file: File) => {
    const form = new FormData()
    form.append('resume', file)
    return api.post('/profile/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  completeOnboarding: (step: number) => api.post('/profile/onboarding', { step }),
}
