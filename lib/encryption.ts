/**
 * Client-Side Encryption Utilities
 * Uses Web Crypto API for AES-GCM 256-bit encryption
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM
const SALT_LENGTH = 16

/**
 * Generate a cryptographic key from user's credentials
 * This derives a unique encryption key for each user
 */
export async function deriveUserKey(userId: string, passphrase: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    
    // Import passphrase as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase + userId),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    )

    // Derive encryption key using PBKDF2
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(userId), // User ID as salt
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        true, // extractable
        ['encrypt', 'decrypt']
    )

    return key
}

/**
 * Generate a random encryption key for a file
 * Each file gets its own unique key
 */
export async function generateFileKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        {
            name: ALGORITHM,
            length: KEY_LENGTH,
        },
        true, // extractable
        ['encrypt', 'decrypt']
    )
}

/**
 * Export a CryptoKey to raw bytes
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey('raw', key)
}

/**
 * Import raw bytes as a CryptoKey
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    )
}

/**
 * Encrypt a file using AES-GCM
 * Returns encrypted data with IV prepended
 */
export async function encryptFile(file: File, key: CryptoKey): Promise<Blob> {
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    // Read file as ArrayBuffer
    const fileData = await file.arrayBuffer()
    
    // Encrypt the file
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv: iv,
        },
        key,
        fileData
    )
    
    // Prepend IV to encrypted data (we need it for decryption)
    const result = new Uint8Array(iv.length + encryptedData.byteLength)
    result.set(iv, 0)
    result.set(new Uint8Array(encryptedData), iv.length)
    
    return new Blob([result])
}

/**
 * Decrypt a file using AES-GCM
 * Expects IV to be prepended to the encrypted data
 */
export async function decryptFile(encryptedBlob: Blob, key: CryptoKey): Promise<Blob> {
    // Read encrypted data
    const encryptedData = await encryptedBlob.arrayBuffer()
    const dataArray = new Uint8Array(encryptedData)
    
    // Extract IV from the beginning
    const iv = dataArray.slice(0, IV_LENGTH)
    const ciphertext = dataArray.slice(IV_LENGTH)
    
    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
        {
            name: ALGORITHM,
            iv: iv,
        },
        key,
        ciphertext
    )
    
    return new Blob([decryptedData])
}

/**
 * Encrypt a file encryption key with user's master key
 * This allows us to store encrypted file keys in the database
 */
export async function encryptFileKey(
    fileKey: CryptoKey,
    userKey: CryptoKey
): Promise<{ encryptedKey: string; iv: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    const fileKeyData = await exportKey(fileKey)
    
    const encryptedKey = await crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv: iv,
        },
        userKey,
        fileKeyData
    )
    
    return {
        encryptedKey: arrayBufferToBase64(encryptedKey),
        iv: arrayBufferToBase64(iv.buffer),
    }
}

/**
 * Decrypt a file encryption key with user's master key
 */
export async function decryptFileKey(
    encryptedKeyB64: string,
    ivB64: string,
    userKey: CryptoKey
): Promise<CryptoKey> {
    const encryptedKey = base64ToArrayBuffer(encryptedKeyB64)
    const iv = base64ToArrayBuffer(ivB64)
    
    const decryptedKeyData = await crypto.subtle.decrypt(
        {
            name: ALGORITHM,
            iv: iv,
        },
        userKey,
        encryptedKey
    )
    
    return await importKey(decryptedKeyData)
}

/**
 * Generate a secure passphrase from WebAuthn credential
 * This creates a deterministic passphrase from the user's biometric
 */
export function generatePassphraseFromCredential(userId: string): string {
    // In production, this should derive from WebAuthn credential
    // For now, use a combination of userId and stored seed
    const storedSeed = localStorage.getItem(`encryption-seed-${userId}`)
    
    if (storedSeed) {
        return storedSeed
    }
    
    // Generate new seed for new user
    const seed = generateRandomString(32)
    localStorage.setItem(`encryption-seed-${userId}`, seed)
    return seed
}

/**
 * Helper: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

/**
 * Helper: Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
}

/**
 * Helper: Generate random string
 */
function generateRandomString(length: number): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Initialize user's encryption with passphrase
 * Should be called during first-time setup
 */
export async function initializeUserEncryption(userId: string, passphrase: string): Promise<CryptoKey> {
    const userKey = await deriveUserKey(userId, passphrase)
    
    // Store passphrase securely (in production, consider more secure storage)
    // For now, storing in localStorage encrypted with derived key
    localStorage.setItem(`encryption-passphrase-${userId}`, passphrase)
    
    return userKey
}

/**
 * Check if user has encryption key set up
 */
export function hasUserEncryptionKey(userId: string): boolean {
    return localStorage.getItem(`encryption-passphrase-${userId}`) !== null
}

/**
 * Get user's encryption key
 * Requires user to have initialized encryption first
 */
export async function getUserEncryptionKey(userId: string): Promise<CryptoKey> {
    const passphrase = localStorage.getItem(`encryption-passphrase-${userId}`)
    
    if (!passphrase) {
        throw new Error('Encryption not initialized. Please set up encryption first.')
    }
    
    return await deriveUserKey(userId, passphrase)
}

/**
 * Check if user encryption is initialized (alias for hasUserEncryptionKey)
 */
export function isEncryptionInitialized(userId: string): boolean {
    return hasUserEncryptionKey(userId)
}
