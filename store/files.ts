import { create } from 'zustand'

export interface FileItem {
    id: string
    name: string
    size: string // Changed from number to match backend response (BigInt serialized as string)
    mimeType: string
    folderId: string | null
    ownerId: string
    createdAt: string
    updatedAt: string
}

export interface FolderItem {
    id: string
    name: string
    parentId: string | null
    ownerId: string
    createdAt: string
    updatedAt: string
}

export interface BreadcrumbItem {
    id: string
    name: string
}

interface FilesState {
    files: FileItem[]
    folders: FolderItem[]
    currentFolderId: string | null
    breadcrumbs: BreadcrumbItem[]
    uploadProgress: Record<string, number>
    isLoading: boolean

    setFiles: (files: FileItem[]) => void
    setFolders: (folders: FolderItem[]) => void
    setCurrentFolderId: (folderId: string | null) => void
    setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
    navigateToFolder: (folder: FolderItem | null) => void
    setUploadProgress: (fileId: string, progress: number) => void
    clearUploadProgress: (fileId: string) => void
    setLoading: (loading: boolean) => void
    addFile: (file: FileItem) => void
    removeFile: (fileId: string) => void
    addFolder: (folder: FolderItem) => void
    removeFolder: (folderId: string) => void
}

export const useFilesStore = create<FilesState>((set) => ({
    files: [],
    folders: [],
    currentFolderId: null,
    breadcrumbs: [],
    uploadProgress: {},
    isLoading: false,

    setFiles: (files) => set({ files }),
    setFolders: (folders) => set({ folders }),
    setCurrentFolderId: (folderId) => set({ currentFolderId: folderId }),
    setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
    
    navigateToFolder: (folder) => set((state) => {
        if (!folder) {
            // Navigate to root
            return { currentFolderId: null, breadcrumbs: [] }
        }
        
        // Navigate to folder - add to breadcrumbs
        return {
            currentFolderId: folder.id,
            breadcrumbs: [...state.breadcrumbs, { id: folder.id, name: folder.name }]
        }
    }),

    setUploadProgress: (fileId, progress) =>
        set((state) => ({
            uploadProgress: { ...state.uploadProgress, [fileId]: progress },
        })),

    clearUploadProgress: (fileId) =>
        set((state) => {
            const newProgress = { ...state.uploadProgress }
            delete newProgress[fileId]
            return { uploadProgress: newProgress }
        }),

    setLoading: (loading) => set({ isLoading: loading }),

    addFile: (file) =>
        set((state) => ({ files: [...state.files, file] })),

    removeFile: (fileId) =>
        set((state) => ({
            files: state.files.filter((f) => f.id !== fileId),
        })),

    addFolder: (folder) =>
        set((state) => ({ folders: [...state.folders, folder] })),

    removeFolder: (folderId) =>
        set((state) => ({
            folders: state.folders.filter((f) => f.id !== folderId),
        })),
}))
