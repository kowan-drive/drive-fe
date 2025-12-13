'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Fingerprint, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { authenticateWithWebAuthn, isWebAuthnSupported } from '@/lib/webauthn'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const { setToken, setUser } = useAuthStore()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isWebAuthnSupported()) {
            toast.error('WebAuthn is not supported in this browser')
            return
        }

        if (!email) {
            toast.error('Please enter your email')
            return
        }

        setIsLoading(true)

        try {
            // Step 1: Get authentication options
            const optionsResponse = await authApi.loginOptions({ email })

            if (!optionsResponse.success) {
                throw new Error(optionsResponse.error || 'Failed to get login options')
            }

            // Step 2: Start WebAuthn authentication
            const credential = await authenticateWithWebAuthn(optionsResponse.data)

            // Step 3: Verify authentication
            const verifyResponse = await authApi.loginVerify({
                email,
                credential,
            })

            if (!verifyResponse.success) {
                throw new Error(verifyResponse.error || 'Authentication failed')
            }

            // Store token and user data
            setToken(verifyResponse.data.session.token)
            setUser(verifyResponse.data.user)

            toast.success('Login successful!')
            router.push('/drive')
        } catch (error: any) {
            console.error('Login error:', error)
            // Error is already handled by authApi with toast notification
            // handleApiError is called in the API layer
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-primary/10 p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-primary/20 relative backdrop-blur-sm bg-card/95">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                        <Fingerprint className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                        Sign in to your MiniDrive account using biometric authentication
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                className="h-11 border-primary/20 focus-visible:ring-primary/50"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Fingerprint className="mr-2 h-5 w-5" />
                                    Sign In with Biometrics
                                </>
                            )}
                        </Button>
                    </CardContent>
                </form>
                <CardFooter className="flex flex-col space-y-2 pb-6">
                    <div className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline font-semibold transition-colors">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
