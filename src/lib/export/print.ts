/**
 * Opens the browser print dialog for PDF export.
 * Temporarily sets document.title so "Save as PDF" suggests a sensible filename.
 */
export function exportPdfViaPrint(title?: string) {
  const previousTitle = document.title
  if (title?.trim()) {
    document.title = title.trim()
  }

  const restore = () => {
    document.title = previousTitle
    window.removeEventListener('afterprint', restore)
  }

  window.addEventListener('afterprint', restore)

  // Let the print tree paint before the dialog opens.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.print()
      // Fallback restore if afterprint is delayed/missing
      window.setTimeout(restore, 2000)
    })
  })
}
