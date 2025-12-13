import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
    id: string
    email: string
    username: string
    tier: 'FREE' | 'PRO' | 'PREMIUM'
    createdAt: string
}

interface AuthState {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    hasHydrated: boolean
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    setLoading: (loading: boolean) => void
    refreshUser: () => Promise<void>
    logout: () => void
    setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            hasHydrated: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setToken: (token) => {
                set({ token, isAuthenticated: !!token })
            },

            setLoading: (loading) => set({ isLoading: loading }),

            refreshUser: async () => {
                try {
                    // Import dynamically to avoid circular dependency
                    const { authApi } = await import('@/lib/api/auth')
                    const response = await authApi.getCurrentUser()
                    if (response.success && response.data) {
                        set({ user: response.data })
                    }
                } catch (error) {
                    console.error('Failed to refresh user:', error)
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false })
            },

            setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Set isAuthenticated based on token after hydration
                    state.isAuthenticated = !!state.token
                    state.hasHydrated = true
                }
            },
        }
    )
)
