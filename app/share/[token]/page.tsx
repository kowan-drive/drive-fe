'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Download, Loader2, Clock, FileIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface ShareInfo {
    presignedUrl: string
    filename: string
    size: number
    mimeType: string
    expiresAt: string
    downloadsRemaining: number | null
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default function SharePage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string
    
    const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        async function fetchShareInfo() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shares/${token}/info`)
                const data = await response.json()

                if (!data.success) {
                    throw new Error(data.error || 'Failed to load share')
                }

                setShareInfo(data.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load share')
            } finally {
                setIsLoading(false)
            }
        }

        if (token) {
            fetchShareInfo()
        }
    }, [token])

    const handleDownload = async () => {
        if (!shareInfo) return
        
        setIsDownloading(true)
        try {
            // Access the share (this increments download count and returns presigned URL)
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shares/${token}`
            
            // Refresh share info after download to update remaining downloads
            setTimeout(async () => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shares/${token}/info`)
                const data = await response.json()
                if (data.success) {
                    setShareInfo(data.data)
                }
                setIsDownloading(false)
            }, 2000)
        } catch (err) {
            setError('Failed to download file')
            setIsDownloading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !shareInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Share Not Available
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                            <p className="text-sm text-destructive">
                                {error || 'This share link is invalid, expired, or has reached its download limit.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const expiresIn = formatDistanceToNow(new Date(shareInfo.expiresAt), { addSuffix: true })

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md overflow-hidden">
                <CardHeader className="overflow-hidden">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                            <FileIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <h3 className="font-semibold text-lg truncate break-all" title={shareInfo.filename}>
                                {shareInfo.filename}
                            </h3>
                            <CardDescription className="truncate">{formatBytes(shareInfo.size)}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {expiresIn}
                        </Badge>
                        {shareInfo.downloadsRemaining !== null && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {shareInfo.downloadsRemaining} download{shareInfo.downloadsRemaining !== 1 ? 's' : ''} left
                            </Badge>
                        )}
                    </div>

                    <Button 
                        onClick={handleDownload} 
                        disabled={isDownloading}
                        className="w-full"
                        size="lg"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download File
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        This file was shared securely with MiniDrive
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
