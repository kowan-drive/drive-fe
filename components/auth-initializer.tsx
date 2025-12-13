'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const hasHydrated = useAuthStore((state) => state.hasHydrated)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        // Wait for store to hydrate before rendering
        const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
            setIsReady(true)
        })

        // If already hydrated, set ready immediately
        if (hasHydrated) {
            setIsReady(true)
        }

        return () => unsubscribe()
    }, [hasHydrated])

    // Show nothing until hydration is complete
    if (!isReady) {
        return null
    }

    return <>{children}</>
}
