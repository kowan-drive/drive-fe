import apiClient from './client'
import { handleApiError } from './error-handler'

export interface RegisterOptionsRequest {
    email: string
    username: string
}

export interface RegisterVerifyRequest {
    email: string
    username: string
    credential: any
    deviceName: string
}

export interface LoginOptionsRequest {
    email: string
}

export interface LoginVerifyRequest {
    email: string
    credential: any
}

export const authApi = {
    registerOptions: async (data: RegisterOptionsRequest) => {
        try {
            const response = await apiClient.post('/api/v1/auth/register/options', data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'registration')
            throw error
        }
    },

    registerVerify: async (data: RegisterVerifyRequest) => {
        try {
            const response = await apiClient.post('/api/v1/auth/register/verify', data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'registration')
            throw error
        }
    },

    loginOptions: async (data: LoginOptionsRequest) => {
        try {
            const response = await apiClient.post('/api/v1/auth/login/options', data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'login')
            throw error
        }
    },

    loginVerify: async (data: LoginVerifyRequest) => {
        try {
            const response = await apiClient.post('/api/v1/auth/login/verify', data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'login')
            throw error
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/api/v1/auth/me')
            return response.data
        } catch (error: any) {
            handleApiError(error, 'fetch user data')
            throw error
        }
    },

    logout: async () => {
        try {
            const response = await apiClient.post('/api/v1/auth/logout')
            return response.data
        } catch (error: any) {
            handleApiError(error, 'logout')
            throw error
        }
    },
}
