import axios from 'axios'

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
        // Try to get token from localStorage (for persisted sessions)
        if (typeof window !== 'undefined') {
            const authStorage = localStorage.getItem('auth-storage')
            if (authStorage) {
                try {
                    const parsed = JSON.parse(authStorage)
                    const token = parsed.state?.token
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`
                    }
                } catch (e) {
                    console.error('Failed to parse auth storage:', e)
                }
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
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth storage and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-storage')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
