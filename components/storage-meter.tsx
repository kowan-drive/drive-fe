'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import { formatBytes } from '@/lib/utils'
import { HardDrive } from 'lucide-react'

export default function StorageMeter() {
    const [usage, setUsage] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadUsage()
    }, [])

    const loadUsage = async () => {
        try {
            const response = await subscriptionsApi.getUsage()
            if (response.success) {
                setUsage(response.data)
            }
        } catch (error) {
            console.error('Error loading usage:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading || !usage) {
        return (
            <div className="p-4 border rounded-lg space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-2 bg-muted animate-pulse rounded" />
            </div>
        )
    }

    const usedBytes = usage.usedBytes || 0
    const quotaBytes = usage.quotaBytes || 52428800 // 50MB default
    const percentage = (usedBytes / quotaBytes) * 100

    const getColor = () => {
        if (percentage >= 90) return 'destructive'
        if (percentage >= 70) return 'warning'
        return 'default'
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Storage</span>
                </div>
                <Badge variant={usage.tier === 'FREE' ? 'secondary' : 'default'}>
                    {usage.tier}
                </Badge>
            </div>

            <div className="space-y-1">
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatBytes(usedBytes)} used</span>
                    <span>{formatBytes(quotaBytes)} total</span>
                </div>
            </div>

            {percentage >= 80 && (
                <p className="text-xs text-muted-foreground">
                    {percentage >= 100
                        ? 'Storage full. Upgrade to continue.'
                        : 'Running low on storage'}
                </p>
            )}
        </div>
    )
}
