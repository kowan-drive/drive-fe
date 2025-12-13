import apiClient from './client'
import { handleApiError } from './error-handler'

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
        try {
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
        } catch (error: any) {
            handleApiError(error, 'upload file')
            throw error
        }
    },

    listFiles: async (params: ListFilesParams = {}) => {
        try {
            const response = await apiClient.get('/api/v1/files', { params })
            return response.data
        } catch (error: any) {
            handleApiError(error, 'load files')
            throw error
        }
    },

    downloadFile: async (fileId: string) => {
        try {
            const response = await apiClient.get(`/api/v1/files/${fileId}/download`, {
                responseType: 'blob',
            })
            return response
        } catch (error: any) {
            handleApiError(error, 'download file')
            throw error
        }
    },

    getFileMetadata: async (fileId: string) => {
        try {
            const response = await apiClient.get(`/api/v1/files/${fileId}/metadata`)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'get file information')
            throw error
        }
    },

    deleteFile: async (fileId: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/files/${fileId}`)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'delete file')
            throw error
        }
    },

    moveFile: async (data: MoveFileRequest) => {
        try {
            const response = await apiClient.put(`/api/v1/files/${data.id}/move`, data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'move file')
            throw error
        }
    },
}
