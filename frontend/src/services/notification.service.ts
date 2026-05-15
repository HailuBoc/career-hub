import api from './api'

export const notificationService = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/all/read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}
