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

    const iconName = getFileIcon(file.name)
    const Icon = iconMap[iconName] || FileIcon

    const handleDownload = async () => {
        try {
            const response = await filesApi.downloadFile(file.id)
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', file.name)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success('Download started')
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
            <Card className="hover:bg-accent transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <Icon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
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
            <Card className="group hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-muted p-3">
                            <Icon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div className="space-y-1">
                        <p className="font-medium truncate" title={file.name}>
                            {file.name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatBytes(file.size)}</span>
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
