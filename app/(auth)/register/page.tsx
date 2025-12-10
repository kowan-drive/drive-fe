'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Fingerprint, Loader2, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { registerWithWebAuthn, isWebAuthnSupported } from '@/lib/webauthn'
import { toast } from 'sonner'

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [deviceName, setDeviceName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isWebAuthnSupported()) {
            toast.error('WebAuthn is not supported in this browser')
            return
        }

        if (!email || !username || !deviceName) {
            toast.error('Please fill in all fields')
            return
        }

        setIsLoading(true)

        try {
            // Step 1: Get registration options
            const optionsResponse = await authApi.registerOptions({ email, username })

            if (!optionsResponse.success) {
                throw new Error(optionsResponse.error || 'Failed to start registration')
            }

            // Step 2: Start WebAuthn registration
            const credential = await registerWithWebAuthn(optionsResponse.data)

            // Step 3: Verify registration
            const verifyResponse = await authApi.registerVerify({
                email,
                username,
                credential,
                deviceName,
            })

            if (!verifyResponse.success) {
                throw new Error(verifyResponse.error || 'Registration failed')
            }

            setIsSuccess(true)
            toast.success('Registration successful! Redirecting to login...')

            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (error: any) {
            console.error('Registration error:', error)
            toast.error(error.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 p-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
                            <h2 className="text-2xl font-bold">Registration Successful!</h2>
                            <p className="text-muted-foreground">
                                Redirecting you to login...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center">Create Account</CardTitle>
                    <CardDescription className="text-center">
                        Set up your MiniDrive account with biometric security
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
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
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deviceName">Device Name</Label>
                            <Input
                                id="deviceName"
                                type="text"
                                placeholder="My MacBook Pro"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
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
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <Fingerprint className="mr-2 h-5 w-5" />
                                    Register with Biometrics
                                </>
                            )}
                        </Button>
                    </CardContent>
                </form>
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
