'use client'

import { useFilesStore } from '@/store/files'
import { Button } from '@/components/ui/button'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs() {
    const { breadcrumbs, navigateToFolder, setBreadcrumbs, setCurrentFolderId } = useFilesStore()

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            // Navigate to root
            navigateToFolder(null)
        } else {
            // Navigate to specific breadcrumb and trim the path
            const targetBreadcrumb = breadcrumbs[index]
            setCurrentFolderId(targetBreadcrumb.id)
            setBreadcrumbs(breadcrumbs.slice(0, index + 1))
        }
    }

    return (
        <div className="flex items-center gap-1 text-sm">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleBreadcrumbClick(-1)}
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
                        onClick={() => handleBreadcrumbClick(index)}
                    >
                        {breadcrumb.name}
                    </Button>
                </div>
            ))}
        </div>
    )
}
