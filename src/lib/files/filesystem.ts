import { downloadText, slugifyFilename, supportsFileSystemAccess } from '@/lib/files/download'

export type OpenedFile = {
  content: string
  name: string
  handle: FileSystemFileHandle | null
}

declare global {
  interface Window {
    showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>
  }
}

type OpenFilePickerOptions = {
  multiple?: boolean
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
}

type SaveFilePickerOptions = {
  suggestedName?: string
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
}

const OPEN_TYPES = [
  {
    description: 'Markdown / Text',
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'text/plain': ['.txt'],
    },
  },
]

const SAVE_TYPES = [
  {
    description: 'Markdown',
    accept: {
      'text/markdown': ['.md'],
    },
  },
]

function readViaInput(): Promise<OpenedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt,text/markdown,text/plain'
    input.style.display = 'none'
    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      input.remove()
      if (!file) {
        resolve(null)
        return
      }
      const content = await file.text()
      resolve({ content, name: file.name, handle: null })
    })
    input.addEventListener('cancel', () => {
      input.remove()
      resolve(null)
    })
    document.body.appendChild(input)
    input.click()
  })
}

export async function openMarkdownFile(): Promise<OpenedFile | null> {
  if (supportsFileSystemAccess() && window.showOpenFilePicker) {
    try {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: OPEN_TYPES,
      })
      const file = await handle.getFile()
      const content = await file.text()
      return { content, name: file.name, handle }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return null
      // Fall through to input picker
    }
  }
  return readViaInput()
}

export async function saveMarkdownToHandle(
  handle: FileSystemFileHandle,
  content: string,
): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

export async function saveMarkdownAs(
  content: string,
  suggestedTitle: string,
  existingHandle: FileSystemFileHandle | null,
): Promise<{ name: string; handle: FileSystemFileHandle | null } | null> {
  const suggestedName = `${slugifyFilename(suggestedTitle)}.md`

  if (existingHandle) {
    try {
      await saveMarkdownToHandle(existingHandle, content)
      return { name: existingHandle.name, handle: existingHandle }
    } catch {
      // Fall through to save-as / download
    }
  }

  if (supportsFileSystemAccess() && window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: SAVE_TYPES,
      })
      await saveMarkdownToHandle(handle, content)
      return { name: handle.name, handle }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return null
    }
  }

  downloadText(content, suggestedName, 'text/markdown;charset=utf-8')
  return { name: suggestedName, handle: null }
}

export async function exportMarkdownDownload(content: string, title: string) {
  downloadText(
    content,
    `${slugifyFilename(title)}.md`,
    'text/markdown;charset=utf-8',
  )
}
