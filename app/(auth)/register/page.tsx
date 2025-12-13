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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-primary/10 p-4 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <Card className="w-full max-w-md shadow-2xl border-green-500/20 relative backdrop-blur-sm bg-card/95">
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl">
                                <CheckCircle2 className="h-10 w-10 text-white animate-in zoom-in duration-300" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                Registration Successful!
                            </h2>
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
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                        Set up your Vibedrive account with biometric security
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
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
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                required
                                className="h-11 border-primary/20 focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deviceName" className="text-sm font-medium">Device Name</Label>
                            <Input
                                id="deviceName"
                                type="text"
                                placeholder="My MacBook Pro"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
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
                <CardFooter className="flex flex-col space-y-2 pb-6">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-semibold transition-colors">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
