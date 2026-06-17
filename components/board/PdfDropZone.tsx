'use client'

import { useRef, useState, useCallback } from 'react'
import { FileText, Upload, X } from 'lucide-react'

interface Props {
  label: string
  value: string
  onChange: (text: string) => void
  placeholder?: string
}

// Initialise pdfjs once per page — v3 uses a classic JS worker (no ESM complications)
let workerConfigured = false

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')

  if (!workerConfigured) {
    // Point at the static worker we copied into /public. v3 loads it as a
    // classic Web Worker (no "type: module" required), so this always works.
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
    workerConfigured = true
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise

  const pageTexts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // In pdfjs v3 every item is a TextItem with a `str` field
    const line = (content.items as { str: string }[])
      .map((item) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (line) pageTexts.push(line)
  }

  pdf.destroy()
  return pageTexts.join('\n')
}

export function PdfDropZone({ label, value, onChange, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file) return
    setError(null)

    if (file.type === 'application/pdf') {
      setExtracting(true)
      setFileName(file.name)
      try {
        const text = await extractPdfText(file)
        if (!text.trim()) {
          setError('PDF appears to be image-only. Please paste the text manually.')
          setFileName(null)
        } else {
          onChange(text)
        }
      } catch (err) {
        console.error('[PdfDropZone] extraction error:', err)
        setError('Could not read PDF. Please paste the text manually.')
        setFileName(null)
      } finally {
        setExtracting(false)
      }
    } else if (file.type === 'text/plain') {
      setFileName(file.name)
      onChange(await file.text())
    } else {
      setError('Please drop a PDF or .txt file.')
    }
  }, [onChange])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function clearFile() {
    setFileName(null)
    setError(null)
    onChange('')
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {(fileName || value) && (
          <button
            type="button"
            onClick={clearFile}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
      )}

      {!value ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors select-none
            ${dragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={onInputChange}
          />
          {extracting ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              <p className="text-sm text-blue-500 font-medium">Reading PDF…</p>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Drop a PDF or <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF · .txt · text extracted automatically</p>
            </>
          )}
        </div>
      ) : (
        <div>
          {fileName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5 bg-green-50 border border-green-200 rounded px-2 py-1">
              <FileText className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>
          )}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            placeholder={placeholder}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      )}
    </div>
  )
}
