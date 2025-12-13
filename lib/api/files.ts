import apiClient from './client'

export interface UploadFileRequest {
    file: File
    folderId?: string
    encryptedFileKey?: string
    encryptionIv?: string
}

export interface ListFilesParams {
    folderId?: string
    page?: number
    limit?: number
}

export interface MoveFileRequest {
    id: string
    folderId: string | null
}

export const filesApi = {
    uploadFile: async ({ file, folderId, encryptedFileKey, encryptionIv }: UploadFileRequest) => {
        const formData = new FormData()
        formData.append('file', file)
        if (folderId) {
            formData.append('folderId', folderId)
        }
        if (encryptedFileKey) {
            formData.append('encryptedFileKey', encryptedFileKey)
        }
        if (encryptionIv) {
            formData.append('encryptionIv', encryptionIv)
        }

        const response = await apiClient.post('/api/v1/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    listFiles: async (params: ListFilesParams = {}) => {
        const response = await apiClient.get('/api/v1/files', { params })
        return response.data
    },

    downloadFile: async (fileId: string) => {
        const response = await apiClient.get(`/api/v1/files/${fileId}/download`, {
            responseType: 'blob',
        })
        return response
    },

    getFileMetadata: async (fileId: string) => {
        const response = await apiClient.get(`/api/v1/files/${fileId}/metadata`)
        return response.data
    },

    deleteFile: async (fileId: string) => {
        const response = await apiClient.delete(`/api/v1/files/${fileId}`)
        return response.data
    },

    moveFile: async (data: MoveFileRequest) => {
        const response = await apiClient.put(`/api/v1/files/${data.id}/move`, data)
        return response.data
    },
}
