'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    FileText,
    Image as ImageIcon,
    FileArchive,
    FileCode,
    Video,
    Music,
    File as FileIcon,
    MoreVertical,
    Download,
    Share2,
    Trash2,
    Loader2,
} from 'lucide-react'
import { formatBytes, formatDate, getFileIcon } from '@/lib/utils'
import { filesApi } from '@/lib/api/files'
import { FileItem } from '@/store/files'
import { toast } from 'sonner'
import ShareDialog from './share-dialog'
import { triggerStorageUpdate } from '@/lib/storage-events'
import { useAuthStore } from '@/store/auth'
import { getUserEncryptionKey, decryptFileKey, decryptFile } from '@/lib/encryption'

interface FileCardProps {
    file: FileItem
    viewMode: 'grid' | 'list'
    onUpdate: () => void
}

const iconMap: Record<string, any> = {
    'file-text': FileText,
    'image': ImageIcon,
    'file-archive': FileArchive,
    'file-code': FileCode,
    'video': Video,
    'music': Music,
    'file': FileIcon,
}

export default function FileCard({ file, viewMode, onUpdate }: FileCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)
    const { user } = useAuthStore()

    const iconName = getFileIcon(file.name)
    const Icon = iconMap[iconName] || FileIcon

    const handleDownload = async () => {
        try {
            toast.info('Downloading and decrypting file...')
            
            // Get file metadata to get encryption keys
            const metadata = await filesApi.getFileMetadata(file.id)
            
            // Download encrypted file
            const response = await filesApi.downloadFile(file.id)
            const encryptedBlob = new Blob([response.data])
            
            // If file has encryption metadata, decrypt it
            if (metadata.data.encryptedFileKey && metadata.data.encryptionIv && user) {
                try {
                    // Get user's encryption key
                    const userKey = await getUserEncryptionKey(user.id)
                    
                    // Decrypt the file encryption key
                    const fileKey = await decryptFileKey(
                        metadata.data.encryptedFileKey,
                        metadata.data.encryptionIv,
                        userKey
                    )
                    
                    // Decrypt the file content
                    const decryptedBlob = await decryptFile(encryptedBlob, fileKey)
                    
                    // Download decrypted file
                    const url = window.URL.createObjectURL(decryptedBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', file.name)
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                    window.URL.revokeObjectURL(url)
                    toast.success('File decrypted and downloaded')
                } catch (decryptError) {
                    console.error('Decryption error:', decryptError)
                    toast.error('Failed to decrypt file')
                }
            } else {
                // Download without decryption (legacy files)
                const url = window.URL.createObjectURL(encryptedBlob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', file.name)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
                toast.success('Download started')
            }
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download file')
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
            return
        }

        setIsDeleting(true)
        try {
            await filesApi.deleteFile(file.id)
            toast.success('File deleted')
            triggerStorageUpdate()
            onUpdate()
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete file')
        } finally {
            setIsDeleting(false)
        }
    }

    if (viewMode === 'list') {
        return (
            <Card className="hover:bg-accent/50 hover:border-primary/20 transition-all duration-200">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-2 border border-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {formatBytes(file.size)} · {formatDate(file.createdAt)}
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isDeleting}>
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <MoreVertical className="h-4 w-4" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardContent>
                <ShareDialog
                    file={file}
                    open={showShareDialog}
                    onOpenChange={setShowShareDialog}
                />
            </Card>
        )
    }

    return (
        <>
            <Card className="group hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 p-4 border border-primary/10 shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all duration-300">
                            <Icon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <MoreVertical className="h-4 w-4" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="space-y-1.5">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors" title={file.name}>
                            {file.name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-medium">{formatBytes(file.size)}</span>
                            <span>{formatDate(file.createdAt)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ShareDialog
                file={file}
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
            />
        </>
    )
}
