export function slugifyFilename(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
  return base || 'document'
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadText(content: string, filename: string, mime: string) {
  downloadBlob(new Blob([content], { type: mime }), filename)
}

export function supportsFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window
}
