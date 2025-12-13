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
import { Folder, MoreVertical, Trash2, Edit, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { foldersApi } from '@/lib/api/folders'
import { FolderItem, useFilesStore } from '@/store/files'
import { toast } from 'sonner'

interface FolderCardProps {
    folder: FolderItem
    viewMode: 'grid' | 'list'
    onUpdate: () => void
}

export default function FolderCard({ folder, viewMode, onUpdate }: FolderCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { navigateToFolder } = useFilesStore()

    const handleClick = () => {
        navigateToFolder(folder)
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!confirm(`Are you sure you want to delete "${folder.name}" and all its contents?`)) {
            return
        }

        setIsDeleting(true)
        try {
            await foldersApi.deleteFolder(folder.id)
            toast.success('Folder deleted')
            onUpdate()
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete folder')
        } finally {
            setIsDeleting(false)
        }
    }

    if (viewMode === 'list') {
        return (
            <Card
                onClick={handleClick}
                className="hover:bg-accent/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer"
            >
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/5 p-2 border border-blue-500/20">
                            <Folder className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{folder.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDate(folder.createdAt)}
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" disabled={isDeleting}>
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <MoreVertical className="h-4 w-4" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            onClick={handleClick}
            className="group hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
        >
            <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-4 border border-blue-500/20 shadow-sm group-hover:shadow-md group-hover:border-blue-500/30 transition-all duration-300">
                        <Folder className="h-10 w-10 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="space-y-1.5">
                    <p className="font-semibold truncate group-hover:text-blue-500 transition-colors" title={folder.name}>
                        {folder.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                        {formatDate(folder.createdAt)}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
