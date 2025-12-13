/**
 * Trigger a storage update event to refresh storage meters
 */
export function triggerStorageUpdate() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage-updated'))
    }
}
