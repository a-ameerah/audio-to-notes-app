"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { X, Copy, FileText } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface Transcript {
  id: string
  upload_id: string
  transcript_text: string
  duration_seconds?: number
  word_count?: number
  created_at: string
  uploads?: {
    filename: string
    file_size: number
    upload_time: string
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

function formatSize(bytes?: number) {
  if (!bytes) return "—"
  return `${(bytes / (1024 * 1024)).toFixed(0)} Mb`
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/transcripts/${id}`)
        const data = await res.json()
        if (!data.success || !data.data?.[0]) throw new Error("Transcript not found")
        setTranscript(data.data[0])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unexpected error")
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const handleCopy = async () => {
    if (!transcript?.transcript_text) return
    await navigator.clipboard.writeText(transcript.transcript_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = () => window.print()

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <h1 className="page-heading">Notes</h1>
      </div>

      {loading && <p className="table-state">Loading transcript…</p>}
      {error && <p className="table-state table-state--error">{error}</p>}

      {transcript && (
        <div className="note-detail-wrapper">
          <div className="note-detail-card">
            {/* Header */}
            <div className="note-detail-header">
              <div>
                <p className="note-detail-title">
                  {transcript.uploads?.filename ?? `Transcript ${transcript.id.slice(0, 8)}`}
                </p>
                <p className="note-detail-meta">
                  Uploaded on{" "}
                  {transcript.uploads?.upload_time
                    ? formatDate(transcript.uploads.upload_time)
                    : formatDate(transcript.created_at)}{" "}
                  • {formatSize(transcript.uploads?.file_size)}
                  {transcript.word_count ? ` • ${transcript.word_count} words` : ""}
                </p>
              </div>
              <button
                className="note-close-btn"
                id="close-note-btn"
                onClick={() => router.push("/notes")}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="table-divider" style={{ margin: 0 }} />

            {/* Scrollable transcript body */}
            <div className="note-body">
              <div className="note-scroll">
                <pre className="note-text">
                  {transcript.transcript_text || "No transcript text available."}
                </pre>
              </div>
            </div>

            {/* Action buttons */}
            <div className="note-actions">
              <button
                id="export-pdf-btn"
                className="btn btn-outline btn-sm"
                onClick={handleExportPDF}
              >
                <FileText size={14} />
                Export to PDF
              </button>
              <button
                id="copy-text-btn"
                className="btn btn-primary btn-sm"
                onClick={handleCopy}
              >
                <Copy size={14} />
                {copied ? "Copied!" : "Copy Text"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
