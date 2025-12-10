import apiClient from './client'

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
        const response = await apiClient.post('/api/v1/auth/register/options', data)
        return response.data
    },

    registerVerify: async (data: RegisterVerifyRequest) => {
        const response = await apiClient.post('/api/v1/auth/register/verify', data)
        return response.data
    },

    loginOptions: async (data: LoginOptionsRequest) => {
        const response = await apiClient.post('/api/v1/auth/login/options', data)
        return response.data
    },

    loginVerify: async (data: LoginVerifyRequest) => {
        const response = await apiClient.post('/api/v1/auth/login/verify', data)
        return response.data
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/api/v1/auth/me')
        return response.data
    },

    logout: async () => {
        const response = await apiClient.post('/api/v1/auth/logout')
        return response.data
    },
}
