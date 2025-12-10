'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Copy, Check } from 'lucide-react'
import { sharesApi } from '@/lib/api/shares'
import { FileItem } from '@/store/files'
import { toast } from 'sonner'

interface ShareDialogProps {
    file: FileItem
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function ShareDialog({ file, open, onOpenChange }: ShareDialogProps) {
    const [expiresIn, setExpiresIn] = useState('24')
    const [maxDownloads, setMaxDownloads] = useState('10')
    const [shareLink, setShareLink] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const handleCreateShare = async () => {
        setIsCreating(true)

        try {
            const response = await sharesApi.createShare({
                fileId: file.id,
                expiresInHours: parseInt(expiresIn),
                maxDownloads: parseInt(maxDownloads),
            })

            if (response.success) {
                const link = `${window.location.origin}/share/${response.data.shareToken}`
                setShareLink(link)
                toast.success('Share link created')
            }
        } catch (error) {
            console.error('Create share error:', error)
            toast.error('Failed to create share link')
        } finally {
            setIsCreating(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink)
            setIsCopied(true)
            toast.success('Link copied to clipboard')
            setTimeout(() => setIsCopied(false), 2000)
        } catch (error) {
            toast.error('Failed to copy link')
        }
    }

    const handleClose = () => {
        setShareLink('')
        setExpiresIn('24')
        setMaxDownloads('10')
        setIsCopied(false)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share "{file.name}"</DialogTitle>
                </DialogHeader>

                {!shareLink ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiresIn">Expires In</Label>
                            <Select value={expiresIn} onValueChange={setExpiresIn}>
                                <SelectTrigger id="expiresIn">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 hour</SelectItem>
                                    <SelectItem value="6">6 hours</SelectItem>
                                    <SelectItem value="24">24 hours</SelectItem>
                                    <SelectItem value="72">3 days</SelectItem>
                                    <SelectItem value="168">7 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxDownloads">Max Downloads</Label>
                            <Select value={maxDownloads} onValueChange={setMaxDownloads}>
                                <SelectTrigger id="maxDownloads">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 download</SelectItem>
                                    <SelectItem value="5">5 downloads</SelectItem>
                                    <SelectItem value="10">10 downloads</SelectItem>
                                    <SelectItem value="50">50 downloads</SelectItem>
                                    <SelectItem value="100">100 downloads</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleCreateShare} disabled={isCreating} className="w-full">
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Share Link'
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Share Link</Label>
                            <div className="flex gap-2">
                                <Input value={shareLink} readOnly />
                                <Button onClick={handleCopyLink} size="icon" variant="outline">
                                    {isCopied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>• Link expires in {expiresIn} hour{expiresIn !== '1' ? 's' : ''}</p>
                            <p>• Max {maxDownloads} download{maxDownloads !== '1' ? 's' : ''}</p>
                        </div>

                        <Button onClick={handleClose} className="w-full" variant="outline">
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
