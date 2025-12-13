'use client'

import EncryptionSetupDialog from '@/components/encryption-setup-dialog'
import StorageMeter from '@/components/storage-meter'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { authApi } from '@/lib/api/auth'
import { hasUserEncryptionKey } from '@/lib/encryption'
import { useAuthStore } from '@/store/auth'
import { HardDrive, LogOut, Settings, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, isAuthenticated, setUser, logout } = useAuthStore()
    const hasHydrated = useAuthStore((state) => state.hasHydrated)
    const [showEncryptionSetup, setShowEncryptionSetup] = useState(false)

    useEffect(() => {
        // Wait for hydration before checking auth
        if (!hasHydrated) {
            return
        }

        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        // Load user data if not already loaded
        if (!user) {
            loadUser()
        } else {
            // Check if user has encryption key
            checkEncryptionSetup()
        }
    }, [isAuthenticated, hasHydrated, user])

    const checkEncryptionSetup = async () => {
        if (user) {
            const hasKey = await hasUserEncryptionKey(user.id)
            if (!hasKey) {
                setShowEncryptionSetup(true)
            }
        }
    }

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

    // Show nothing while hydrating
    if (!hasHydrated) {
        return null
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-gradient-to-b from-card to-muted/40 flex flex-col shadow-sm">
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-2 shadow-md">
                                <HardDrive className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">MiniDrive</h1>
                                <p className="text-[10px] text-muted-foreground">Privacy-first storage</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/drive">
                        <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors">
                            <HardDrive className="mr-3 h-4 w-4" />
                            My Drive
                        </Button>
                    </Link>
                    <Link href="/shared">
                        <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors">
                            <Share2 className="mr-3 h-4 w-4" />
                            Shared Links
                        </Button>
                    </Link>
                    <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors">
                            <Settings className="mr-3 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 space-y-4">
                    <StorageMeter />

                    <Separator />

                    <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-medium text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="text-sm px-1">
                            <p className="font-medium truncate">{user?.username}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
            {/* Encryption Setup Dialog */}
            <EncryptionSetupDialog 
                open={showEncryptionSetup} 
                onOpenChange={setShowEncryptionSetup}
            />        </div>
    )
}
