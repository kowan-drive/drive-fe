import apiClient from './client'

export interface CreateShareRequest {
    fileId: string
    expiresInHours: number
    maxDownloads: number
}

export const sharesApi = {
    createShare: async (data: CreateShareRequest) => {
        const response = await apiClient.post('/api/v1/shares', data)
        return response.data
    },

    listShares: async () => {
        const response = await apiClient.get('/api/v1/shares')
        return response.data
    },

    getSharedFile: async (shareToken: string) => {
        const response = await apiClient.get(`/api/v1/shares/${shareToken}`)
        return response.data
    },

    deleteShare: async (shareId: string) => {
        const response = await apiClient.delete(`/api/v1/shares/${shareId}`)
        return response.data
    },
}
