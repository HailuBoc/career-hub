// Legacy stub — not used in this app
export const applicationService = {
  getMyApplications: (_params?: unknown) => Promise.resolve({ data: { data: [], pagination: {} } }),
  getJobApplications: (_jobId: string, _params?: unknown) => Promise.resolve({ data: { data: [] } }),
  apply: (_jobId: string, _data: FormData) => Promise.resolve({ data: {} }),
  updateStatus: (_id: string, _status: string) => Promise.resolve({ data: {} }),
  withdraw: (_id: string) => Promise.resolve({ data: {} }),
}
