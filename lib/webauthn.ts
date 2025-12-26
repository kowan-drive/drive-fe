import {
    startRegistration,
    startAuthentication,
} from '@simplewebauthn/browser'
import type {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'

export async function registerWithWebAuthn(
    options: PublicKeyCredentialCreationOptionsJSON
) {
    try {
        const credential = await startRegistration({optionsJSON: options})
        return credential
    } catch (error) {
        console.error('WebAuthn registration error:', error)
        throw error
    }
}

export async function authenticateWithWebAuthn(
    options: PublicKeyCredentialRequestOptionsJSON
) {
    try {
        const credential = await startAuthentication({optionsJSON: options})
        return credential
    } catch (error) {
        console.error('WebAuthn authentication error:', error)
        throw error
    }
}

export function isWebAuthnSupported() {
    return (
        typeof window !== 'undefined' &&
        window.PublicKeyCredential !== undefined &&
        typeof window.PublicKeyCredential === 'function'
    )
}
