'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { LogOut, HardDrive, Share2, Settings } from 'lucide-react'
import StorageMeter from '@/components/storage-meter'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, isAuthenticated, setUser, logout } = useAuthStore()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        // Load user data if not already loaded
        if (!user) {
            loadUser()
        }
    }, [isAuthenticated])

    const loadUser = async () => {
        try {
            const response = await authApi.getCurrentUser()
            if (response.success) {
                setUser(response.data)
            }
        } catch (error) {
            console.error('Error loading user:', error)
        }
    }

    const handleLogout = async () => {
        try {
            await authApi.logout()
            logout()
            toast.success('Logged out successfully')
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
            logout()
            router.push('/login')
        }
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/40 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HardDrive className="h-6 w-6" />
                        MiniDrive
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">Privacy-first storage</p>
                </div>

                <Separator />

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/drive">
                        <Button variant="ghost" className="w-full justify-start">
                            <HardDrive className="mr-2 h-4 w-4" />
                            My Drive
                        </Button>
                    </Link>
                    <Link href="/shared">
                        <Button variant="ghost" className="w-full justify-start">
                            <Share2 className="mr-2 h-4 w-4" />
                            Shared Links
                        </Button>
                    </Link>
                    <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 space-y-4">
                    <StorageMeter />

                    <Separator />

                    <div className="space-y-2">
                        <div className="text-sm">
                            <p className="font-medium">{user?.username}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {children}
            </main>
        </div>
    )
}
