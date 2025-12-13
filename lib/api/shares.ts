import apiClient from './client'
import { handleApiError } from './error-handler'

export interface CreateShareRequest {
    fileId: string
    expiresInHours: number
    maxDownloads: number
}

export const sharesApi = {
    createShare: async (data: CreateShareRequest) => {
        try {
            const response = await apiClient.post('/api/v1/shares', data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'create share link')
            throw error
        }
    },

    listShares: async () => {
        try {
            const response = await apiClient.get('/api/v1/shares')
            return response.data
        } catch (error: any) {
            handleApiError(error, 'load share links')
            throw error
        }
    },

    getSharedFile: async (shareToken: string) => {
        try {
            const response = await apiClient.get(`/api/v1/shares/${shareToken}`)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'access shared file')
            throw error
        }
    },

    deleteShare: async (shareId: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/shares/${shareId}`)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'delete share link')
            throw error
        }
    },
}
