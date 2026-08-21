import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorSelection } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { AppShell } from '@/components/layout/AppShell'
import type { ViewMode } from '@/components/layout/ViewModeSwitcher'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import {
  MarkdownPreview,
  type MarkdownPreviewHandle,
} from '@/components/preview/MarkdownPreview'
import { OutlineSidebar } from '@/components/outline/OutlineSidebar'
import { PrintDocument } from '@/components/export/PrintDocument'
import type { ExportFormat } from '@/components/export/FileMenu'
import { useDocument } from '@/hooks/useDocument'
import { type ActiveFormats } from '@/lib/activeFormats'
import {
  activeOutlineId,
  extractOutline,
  type OutlineHeading,
} from '@/lib/markdown'
import {
  exportMarkdownDownload,
  openMarkdownFile,
  saveMarkdownAs,
} from '@/lib/files/filesystem'
import { exportHtmlDocument } from '@/lib/export/html'
import { exportDocxDocument } from '@/lib/export/docx'
import { exportPdfViaPrint } from '@/lib/export/print'

const VIEW_MODE_KEY = 'markdown-workspace:view-mode'
const OUTLINE_KEY = 'markdown-workspace:outline-open'

const EMPTY_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  strike: false,
  inlineCode: false,
  link: false,
  bulletList: false,
  orderedList: false,
  checklist: false,
  quote: false,
  heading: 0,
}

function loadViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    if (stored === 'edit' || stored === 'split' || stored === 'preview') return stored
  } catch {
    /* ignore */
  }
  return 'split'
}

function loadOutlineOpen(): boolean {
  try {
    return localStorage.getItem(OUTLINE_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const {
    source,
    title,
    fileName,
    dirty,
    stats,
    updateSource,
    loadDocument,
    setFileName,
    markClean,
  } = useDocument()

  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [editorView, setEditorView] = useState<EditorView | null>(null)
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(EMPTY_FORMATS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [exportBusy, setExportBusy] = useState(false)
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null)
  const previewRef = useRef<MarkdownPreviewHandle>(null)

  const headings = useMemo(() => extractOutline(source), [source])

  useEffect(() => {
    setViewMode(loadViewMode())
    setOutlineOpen(loadOutlineOpen())
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode)
    } catch {
      /* ignore */
    }
  }, [viewMode])

  useEffect(() => {
    try {
      localStorage.setItem(OUTLINE_KEY, outlineOpen ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [outlineOpen])

  useEffect(() => {
    if (!editorView) return
    const caret = editorView.state.selection.main.head
    setActiveId(activeOutlineId(headings, caret))
  }, [headings, editorView, source])

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const handleViewReady = useCallback((view: EditorView | null) => {
    setEditorView(view)
  }, [])

  const handleActiveFormatsChange = useCallback(
    (formats: ActiveFormats) => {
      setActiveFormats(formats)
      if (!editorView) return
      const caret = editorView.state.selection.main.head
      setActiveId(activeOutlineId(extractOutline(editorView.state.doc.toString()), caret))
    },
    [editorView],
  )

  const handleSelectHeading = useCallback(
    (heading: OutlineHeading) => {
      setActiveId(heading.id)

      if (editorView && (viewMode === 'edit' || viewMode === 'split')) {
        const pos = Math.min(heading.from, editorView.state.doc.length)
        editorView.dispatch({
          selection: EditorSelection.cursor(pos),
          effects: EditorView.scrollIntoView(pos, { y: 'start', yMargin: 48 }),
        })
        editorView.focus()

        window.requestAnimationFrame(() => {
          const scroller = editorView.scrollDOM
          const coords = editorView.coordsAtPos(pos)
          if (!coords) return
          const rect = scroller.getBoundingClientRect()
          scroller.scrollTop += coords.top - rect.top - 48
        })
      }

      if (viewMode === 'preview' || viewMode === 'split') {
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            previewRef.current?.scrollToHeading(heading.id)
          }, 30)
        })
      }
    },
    [editorView, viewMode],
  )

  const handleOpen = useCallback(async () => {
    if (dirty && !window.confirm('You have unsaved changes. Open another file anyway?')) {
      return
    }
    const opened = await openMarkdownFile()
    if (!opened) return
    loadDocument(opened.content, opened.name)
    setFileHandle(opened.handle)
  }, [dirty, loadDocument])

  const handleSave = useCallback(async () => {
    setExportBusy(true)
    try {
      const result = await saveMarkdownAs(source, title, fileHandle)
      if (!result) return
      setFileName(result.name)
      setFileHandle(result.handle)
      markClean()
    } finally {
      setExportBusy(false)
    }
  }, [source, title, fileHandle, setFileName, markClean])

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setExportBusy(true)
      try {
        if (format === 'md') {
          await exportMarkdownDownload(source, title)
          return
        }
        if (format === 'html') {
          await exportHtmlDocument(source, title)
          return
        }
        if (format === 'docx') {
          await exportDocxDocument(source, title)
          return
        }
        exportPdfViaPrint(title)
      } finally {
        setExportBusy(false)
      }
    },
    [source, title],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return
      if (event.key.toLowerCase() === 's') {
        event.preventDefault()
        void handleSave()
      }
      if (event.key.toLowerCase() === 'o') {
        event.preventDefault()
        void handleOpen()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave, handleOpen])

  return (
    <AppShell
      title={title}
      dirty={dirty}
      fileName={fileName}
      words={stats.words}
      chars={stats.chars}
      lines={stats.lines}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      outlineOpen={outlineOpen}
      onToggleOutline={() => setOutlineOpen((open) => !open)}
      outlineCount={headings.length}
      exportBusy={exportBusy}
      onOpen={() => void handleOpen()}
      onSave={() => void handleSave()}
      onExport={(format) => void handleExport(format)}
      editorView={editorView}
      activeFormats={activeFormats}
      outline={
        <OutlineSidebar
          headings={headings}
          activeId={activeId}
          onSelect={handleSelectHeading}
        />
      }
      editor={
        <MarkdownEditor
          value={source}
          onChange={updateSource}
          onViewReady={handleViewReady}
          onActiveFormatsChange={handleActiveFormatsChange}
        />
      }
      preview={
        <MarkdownPreview
          ref={previewRef}
          source={source}
          onChangeSource={updateSource}
        />
      }
      printDocument={<PrintDocument source={source} title={title} />}
    />
  )
}
