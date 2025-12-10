import { create } from 'zustand'

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
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    setLoading: (loading: boolean) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('session_token') : null,
    isLoading: false,
    isAuthenticated: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    setToken: (token) => {
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('session_token', token)
            } else {
                localStorage.removeItem('session_token')
            }
        }
        set({ token, isAuthenticated: !!token })
    },

    setLoading: (loading) => set({ isLoading: loading }),

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('session_token')
        }
        set({ user: null, token: null, isAuthenticated: false })
    },
}))
