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
            toast.error(error.message || 'Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your MiniDrive account using biometric authentication
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-base"
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
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
