'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { foldersApi } from '@/lib/api/folders'
import { useFilesStore } from '@/store/files'
import { toast } from 'sonner'

interface CreateFolderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onFolderCreated: () => void
}

export default function CreateFolderDialog({
    open,
    onOpenChange,
    onFolderCreated,
}: CreateFolderDialogProps) {
    const { currentFolderId } = useFilesStore()
    const [folderName, setFolderName] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!folderName.trim()) {
            toast.error('Please enter a folder name')
            return
        }

        setIsCreating(true)

        try {
            const response = await foldersApi.createFolder({
                name: folderName,
                parentId: currentFolderId || undefined,
            })

            if (response.success) {
                toast.success('Folder created successfully')
                setFolderName('')
                onOpenChange(false)
                onFolderCreated()
            } else {
                toast.error(response.error || 'Failed to create folder')
            }
        } catch (error) {
            console.error('Create folder error:', error)
            toast.error('Failed to create folder')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="folderName">Folder Name</Label>
                        <Input
                            id="folderName"
                            placeholder="My Folder"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            disabled={isCreating}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Folder'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
