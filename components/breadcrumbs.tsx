'use client'

import { useFilesStore } from '@/store/files'
import { Button } from '@/components/ui/button'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs() {
    const { currentFolderId, folders, setCurrentFolderId } = useFilesStore()

    // Build breadcrumb trail
    const buildBreadcrumbs = () => {
        if (!currentFolderId) return []

        const breadcrumbs: Array<{ id: string; name: string }> = []
        let current = folders.find(f => f.id === currentFolderId)

        while (current) {
            breadcrumbs.unshift({ id: current.id, name: current.name })
            current = current.parentId ? folders.find(f => f.id === current!.parentId) : undefined
        }

        return breadcrumbs
    }

    const breadcrumbs = buildBreadcrumbs()

    return (
        <div className="flex items-center gap-1 text-sm">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setCurrentFolderId(null)}
            >
                <Home className="h-4 w-4" />
                <span className="ml-1">My Drive</span>
            </Button>

            {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.id} className="flex items-center gap-1">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setCurrentFolderId(breadcrumb.id)}
                    >
                        {breadcrumb.name}
                    </Button>
                </div>
            ))}
        </div>
    )
}
