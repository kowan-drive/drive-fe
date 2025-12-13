import apiClient from './client'
import { handleApiError } from './error-handler'

export interface CreateFolderRequest {
    name: string
    parentId?: string
}

export interface UpdateFolderRequest {
    id: string
    name: string
}

export interface ListFoldersParams {
    parentId?: string
}

export const foldersApi = {
    createFolder: async (data: CreateFolderRequest) => {
        try {
            const response = await apiClient.post('/api/v1/folders', data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'create folder')
            throw error
        }
    },

    listFolders: async (params: ListFoldersParams = {}) => {
        try {
            const response = await apiClient.get('/api/v1/folders', { params })
            return response.data
        } catch (error: any) {
            handleApiError(error, 'load folders')
            throw error
        }
    },

    updateFolder: async (data: UpdateFolderRequest) => {
        try {
            const response = await apiClient.put(`/api/v1/folders/${data.id}`, data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'update folder')
            throw error
        }
    },

    deleteFolder: async (folderId: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/folders/${folderId}`)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'delete folder')
            throw error
        }
    },
}
