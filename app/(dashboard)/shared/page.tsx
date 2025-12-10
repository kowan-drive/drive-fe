'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { sharesApi } from '@/lib/api/shares'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function SharedPage() {
    const [shares, setShares] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadShares()
    }, [])

    const loadShares = async () => {
        setIsLoading(true)
        try {
            const response = await sharesApi.listShares()
            if (response.success) {
                setShares(response.data.shares || [])
            }
        } catch (error) {
            console.error('Error loading shares:', error)
            toast.error('Failed to load shares')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopyLink = async (shareToken: string) => {
        const link = `${window.location.origin}/share/${shareToken}`
        try {
            await navigator.clipboard.writeText(link)
            toast.success('Link copied to clipboard')
        } catch (error) {
            toast.error('Failed to copy link')
        }
    }

    const handleDelete = async (shareId: string) => {
        if (!confirm('Are you sure you want to revoke this share link?')) {
            return
        }

        try {
            await sharesApi.deleteShare(shareId)
            toast.success('Share link revoked')
            loadShares()
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to revoke share link')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="border-b bg-background/95 backdrop-blur">
                <div className="px-6 py-4">
                    <h2 className="text-2xl font-bold">Shared Links</h2>
                    <p className="text-sm text-muted-foreground">Manage your active share links</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {shares.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="rounded-full bg-muted p-6">
                            <ExternalLink className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">No shared links</h3>
                            <p className="text-muted-foreground">
                                Share files from your drive to create links
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 max-w-4xl">
                        {shares.map((share) => (
                            <Card key={share.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium truncate">{share.file?.name || 'Unknown File'}</h3>
                                                <Badge variant={share.isActive ? 'default' : 'secondary'}>
                                                    {share.isActive ? 'Active' : 'Expired'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>Created: {formatDate(share.createdAt)}</p>
                                                <p>Expires: {formatDate(share.expiresAt)}</p>
                                                <p>Downloads: {share.downloadCount} / {share.maxDownloads}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleCopyLink(share.shareToken)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDelete(share.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
