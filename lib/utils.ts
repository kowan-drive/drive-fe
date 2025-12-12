import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number | string, decimals = 2) {
    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
    if (numBytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(numBytes) / Math.log(k))

    return parseFloat((numBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase()

    const iconMap: Record<string, string> = {
        // Images
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
        gif: 'image',
        svg: 'image',
        webp: 'image',
        // Documents
        pdf: 'file-text',
        doc: 'file-text',
        docx: 'file-text',
        txt: 'file-text',
        // Spreadsheets
        xls: 'sheet',
        xlsx: 'sheet',
        csv: 'sheet',
        // Presentations
        ppt: 'presentation',
        pptx: 'presentation',
        // Archives
        zip: 'file-archive',
        rar: 'file-archive',
        '7z': 'file-archive',
        // Code
        js: 'file-code',
        ts: 'file-code',
        jsx: 'file-code',
        tsx: 'file-code',
        html: 'file-code',
        css: 'file-code',
        py: 'file-code',
        java: 'file-code',
        // Video
        mp4: 'video',
        avi: 'video',
        mov: 'video',
        // Audio
        mp3: 'music',
        wav: 'music',
        ogg: 'music',
    }

    return iconMap[ext || ''] || 'file'
}

export function isImageFile(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')
}
