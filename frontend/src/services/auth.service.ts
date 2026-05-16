import api from './api'

export const authService = {
  login: (password: string) => api.post('/auth/login', { password }),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
}
