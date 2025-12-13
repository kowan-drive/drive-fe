import { toast } from 'sonner'

export interface ApiError {
    success: false
    error?: string
    message?: string
    status?: number
}

/**
 * Handles API errors and shows appropriate toast notifications
 * @param error - The error object from the API
 * @param context - Additional context for the error (e.g., 'login', 'upload', 'delete')
 * @returns The error message to display
 */
export function handleApiError(error: any, context?: string): string {
    // Extract error message from various error formats
    let errorMessage = 'An unexpected error occurred'
    
    if (typeof error === 'string') {
        errorMessage = error
    } else if (error?.error) {
        errorMessage = error.error
    } else if (error?.message) {
        errorMessage = error.message
    } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
    } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
    }

    // Handle specific error cases
    if (errorMessage.toLowerCase().includes('user not found') || 
        errorMessage.toLowerCase().includes('no credentials registered')) {
        toast.error('Account not found', {
            description: 'Please sign up to create an account',
            action: {
                label: 'Sign Up',
                onClick: () => {
                    if (typeof window !== 'undefined') {
                        window.location.href = '/register'
                    }
                },
            },
            duration: 5000,
        })
        // Auto-redirect after 3 seconds
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.location.href = '/register'
            }
        }, 3000)
        return errorMessage
    }

    if (errorMessage.toLowerCase().includes('authentication required') ||
        errorMessage.toLowerCase().includes('invalid or expired session')) {
        toast.error('Session expired', {
            description: 'Please log in again',
        })
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                window.location.href = '/login'
            }, 2000)
        }
        return errorMessage
    }

    if (errorMessage.toLowerCase().includes('storage quota exceeded') ||
        errorMessage.toLowerCase().includes('quota exceeded')) {
        toast.error('Storage quota exceeded', {
            description: 'Please upgrade your plan or delete some files',
        })
        return errorMessage
    }

    if (errorMessage.toLowerCase().includes('file not found')) {
        toast.error('File not found', {
            description: 'The file you are looking for does not exist',
        })
        return errorMessage
    }

    if (errorMessage.toLowerCase().includes('failed to fetch') ||
        errorMessage.toLowerCase().includes('network error')) {
        toast.error('Network error', {
            description: 'Please check your internet connection and try again',
        })
        return errorMessage
    }

    // Generic error handling with context
    const contextMessage = context ? `Failed to ${context}` : 'Operation failed'
    toast.error(contextMessage, {
        description: errorMessage,
    })

    return errorMessage
}

