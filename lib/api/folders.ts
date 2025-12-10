import apiClient from './client'

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
        const response = await apiClient.post('/api/v1/folders', data)
        return response.data
    },

    listFolders: async (params: ListFoldersParams = {}) => {
        const response = await apiClient.get('/api/v1/folders', { params })
        return response.data
    },

    updateFolder: async (data: UpdateFolderRequest) => {
        const response = await apiClient.put(`/api/v1/folders/${data.id}`, data)
        return response.data
    },

    deleteFolder: async (folderId: string) => {
        const response = await apiClient.delete(`/api/v1/folders/${folderId}`)
        return response.data
    },
}
