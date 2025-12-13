'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Lock, Shield } from 'lucide-react'
import { initializeUserEncryption, hasUserEncryptionKey } from '@/lib/encryption'
import { useAuthStore } from '@/store/auth'

interface EncryptionSetupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function EncryptionSetupDialog({ open, onOpenChange }: EncryptionSetupDialogProps) {
    const { user } = useAuthStore()
    const [passphrase, setPassphrase] = useState('')
    const [confirmPassphrase, setConfirmPassphrase] = useState('')
    const [isInitializing, setIsInitializing] = useState(false)

    const handleInitialize = async () => {
        if (!user) {
            toast.error('User not found')
            return
        }

        if (!passphrase || !confirmPassphrase) {
            toast.error('Please enter a passphrase')
            return
        }

        if (passphrase !== confirmPassphrase) {
            toast.error('Passphrases do not match')
            return
        }

        if (passphrase.length < 8) {
            toast.error('Passphrase must be at least 8 characters')
            return
        }

        setIsInitializing(true)

        try {
            await initializeUserEncryption(user.id, passphrase)
            toast.success('Encryption initialized successfully')
            onOpenChange(false)
        } catch (error) {
            console.error('Encryption initialization error:', error)
            toast.error('Failed to initialize encryption')
        } finally {
            setIsInitializing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <DialogTitle>Enable End-to-End Encryption</DialogTitle>
                    </div>
                    <DialogDescription className="space-y-2">
                        <p>
                            Protect your files with client-side encryption. Your files will be encrypted
                            in your browser before upload, ensuring complete privacy.
                        </p>
                        <div className="bg-muted p-3 rounded-md mt-3">
                            <div className="flex items-start gap-2">
                                <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                <div className="text-xs text-muted-foreground">
                                    <p className="font-semibold mb-1">Important:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Your passphrase is never sent to our servers</li>
                                        <li>If you forget your passphrase, your files cannot be recovered</li>
                                        <li>Store your passphrase securely</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="passphrase">Encryption Passphrase</Label>
                        <Input
                            id="passphrase"
                            type="password"
                            placeholder="Enter a strong passphrase"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            disabled={isInitializing}
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum 8 characters. Use a strong, unique passphrase.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassphrase">Confirm Passphrase</Label>
                        <Input
                            id="confirmPassphrase"
                            type="password"
                            placeholder="Re-enter your passphrase"
                            value={confirmPassphrase}
                            onChange={(e) => setConfirmPassphrase(e.target.value)}
                            disabled={isInitializing}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isInitializing}>
                        Skip for Now
                    </Button>
                    <Button onClick={handleInitialize} disabled={isInitializing}>
                        {isInitializing ? 'Initializing...' : 'Enable Encryption'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
