// Legacy stub — not used in this app
export const notificationService = {
  getNotifications: (_params?: unknown) => Promise.resolve({ data: { data: [], pagination: {} } }),
  markAsRead: (_id: string) => Promise.resolve({ data: {} }),
  delete: (_id: string) => Promise.resolve({ data: {} }),
}
