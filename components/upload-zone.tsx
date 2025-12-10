'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, FileIcon, Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useFilesStore } from '@/store/files'
import { filesApi } from '@/lib/api/files'
import { formatBytes } from '@/lib/utils'
import { toast } from 'sonner'

interface UploadZoneProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onUploadComplete: () => void
}

interface UploadFile {
    file: File
    progress: number
    error?: string
}

export default function UploadZone({ open, onOpenChange, onUploadComplete }: UploadZoneProps) {
    const { currentFolderId } = useFilesStore()
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        addFiles(files)
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            addFiles(files)
        }
    }, [])

    const addFiles = (files: File[]) => {
        const newUploadFiles = files.map(file => ({
            file,
            progress: 0,
        }))
        setUploadFiles(prev => [...prev, ...newUploadFiles])
    }

    const removeFile = (index: number) => {
        setUploadFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleUpload = async () => {
        if (uploadFiles.length === 0) return

        setIsUploading(true)

        for (let i = 0; i < uploadFiles.length; i++) {
            const uploadFile = uploadFiles[i]

            try {
                // Update progress
                setUploadFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, progress: 50 } : f
                    )
                )

                await filesApi.uploadFile({
                    file: uploadFile.file,
                    folderId: currentFolderId || undefined,
                })

                // Update progress to 100%
                setUploadFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, progress: 100 } : f
                    )
                )
            } catch (error) {
                console.error('Upload error:', error)
                setUploadFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, error: 'Upload failed' } : f
                    )
                )
            }
        }

        setIsUploading(false)
        toast.success('Files uploaded successfully')
        setUploadFiles([])
        onUploadComplete()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>

                <div
                    className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        Drag and drop files here
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        or click the button below to select files
                    </p>
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <label htmlFor="file-upload">
                        <Button variant="outline" asChild disabled={isUploading}>
                            <span>Select Files</span>
                        </Button>
                    </label>
                </div>

                {uploadFiles.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {uploadFiles.map((uploadFile, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                                <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {uploadFile.file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatBytes(uploadFile.file.size)}
                                    </p>
                                    {uploadFile.progress > 0 && (
                                        <Progress value={uploadFile.progress} className="mt-1" />
                                    )}
                                    {uploadFile.error && (
                                        <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                                    )}
                                </div>
                                {!isUploading && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFile(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={uploadFiles.length === 0 || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            `Upload ${uploadFiles.length} file${uploadFiles.length !== 1 ? 's' : ''}`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
