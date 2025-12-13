'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { filesApi } from '@/lib/api/files'
import { foldersApi } from '@/lib/api/folders'
import { useFilesStore } from '@/store/files'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Upload, FolderPlus, Grid3x3, List, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import FileCard from '@/components/file-card'
import FolderCard from '@/components/folder-card'
import Breadcrumbs from '@/components/breadcrumbs'
import UploadZone from '@/components/upload-zone'
import CreateFolderDialog from '@/components/create-folder-dialog'

export default function DrivePage() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const { files, folders, currentFolderId, setFiles, setFolders, setLoading, isLoading } = useFilesStore()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showUploadZone, setShowUploadZone] = useState(false)
    const [showCreateFolder, setShowCreateFolder] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadFileAndFolders()
    }, [isAuthenticated, currentFolderId])

    const loadFileAndFolders = async () => {
        setLoading(true)
        try {
            const [filesResponse, foldersResponse] = await Promise.all([
                filesApi.listFiles({ folderId: currentFolderId || undefined }),
                foldersApi.listFolders({ parentId: currentFolderId || undefined }),
            ])

            if (filesResponse.success) {
                setFiles(filesResponse.data.files || [])
            }

            if (foldersResponse.success) {
                setFolders(foldersResponse.data.folders || [])
            }
        } catch (error) {
            console.error('Error loading files:', error)
            toast.error('Failed to load files')
        } finally {
            setLoading(false)
        }
    }

    const handleUploadComplete = () => {
        setShowUploadZone(false)
        loadFileAndFolders()
    }

    const handleFolderCreated = () => {
        setShowCreateFolder(false)
        loadFileAndFolders()
    }

    if (isLoading && files.length === 0 && folders.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="border-b bg-gradient-to-r from-background to-muted/30 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                    <Breadcrumbs />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                        >
                            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateFolder(true)}
                            className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                        >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            New Folder
                        </Button>
                        <Button 
                            onClick={() => setShowUploadZone(true)}
                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-muted/20">
                {files.length === 0 && folders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-500">
                        <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-8 border border-primary/20 shadow-lg">
                            <Upload className="h-16 w-16 text-primary" />
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h3 className="text-2xl font-bold">No files yet</h3>
                            <p className="text-muted-foreground text-lg">
                                Upload your first file or create a folder to get started
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                onClick={() => setShowUploadZone(true)}
                                size="lg"
                                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Upload Files
                            </Button>
                            <Button 
                                variant="outline" 
                                size="lg"
                                onClick={() => setShowCreateFolder(true)}
                                className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                            >
                                <FolderPlus className="mr-2 h-5 w-5" />
                                Create Folder
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'
                                : 'flex flex-col gap-2'
                        }
                    >
                        {folders.map((folder) => (
                            <FolderCard
                                key={folder.id}
                                folder={folder}
                                viewMode={viewMode}
                                onUpdate={loadFileAndFolders}
                            />
                        ))}
                        {files.map((file) => (
                            <FileCard
                                key={file.id}
                                file={file}
                                viewMode={viewMode}
                                onUpdate={loadFileAndFolders}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <UploadZone
                open={showUploadZone}
                onOpenChange={setShowUploadZone}
                onUploadComplete={handleUploadComplete}
            />
            <CreateFolderDialog
                open={showCreateFolder}
                onOpenChange={setShowCreateFolder}
                onFolderCreated={handleFolderCreated}
            />
        </div>
    )
}
