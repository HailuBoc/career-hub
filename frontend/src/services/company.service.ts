// Legacy stub — not used in this app
export const companyService = {
  getCompanies: (_params?: unknown) => Promise.resolve({ data: { data: [] } }),
  getCompanyBySlug: (_slug: string) => Promise.resolve({ data: {} }),
  getMyCompany: () => Promise.resolve({ data: {} }),
  createOrUpdate: (_data: unknown) => Promise.resolve({ data: {} }),
  uploadLogo: (_file: File) => Promise.resolve({ data: {} }),
}
