// Legacy stub — not used in this app
export const profileService = {
  getProfile: () => Promise.resolve({ data: { data: { profile: null } } }),
  updateProfile: (_data: unknown) => Promise.resolve({ data: {} }),
  uploadAvatar: (_file: File) => Promise.resolve({ data: {} }),
  uploadResume: (_file: File) => Promise.resolve({ data: {} }),
  completeOnboarding: (_step: number) => Promise.resolve({ data: {} }),
}
