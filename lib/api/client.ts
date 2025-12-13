import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/auth'

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        // Try to get token from Zustand persisted storage
        if (typeof window !== 'undefined') {
            try {
                const authStorage = localStorage.getItem('auth-storage')
                if (authStorage) {
                    const { state } = JSON.parse(authStorage)
                    if (state?.token) {
                        config.headers.Authorization = `Bearer ${state.token}`
                    }
                }
            } catch (error) {
                console.error('Failed to parse auth storage:', error)
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        // Check if response has error in data (success: false)
        if (response.data && response.data.success === false) {
            // Reject so it can be caught and handled by the API functions
            return Promise.reject(response.data)
        }
        return response
    },
    (error: AxiosError) => {
        // Extract error from response
        const errorData = error.response?.data as any
        
        // Handle 401 unauthorized - clear auth state
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                // Use the store's logout method to properly clear all auth state
                useAuthStore.getState().logout()
            }
        }
        
        // Return the error data so API functions can handle it
        return Promise.reject(errorData || error)
    }
)

export default apiClient
