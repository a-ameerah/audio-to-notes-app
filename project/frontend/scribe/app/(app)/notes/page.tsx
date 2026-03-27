"use client"

import { useEffect, useState } from "react"
import { Mic } from "lucide-react"
import Link from "next/link"

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

export default function NotesPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/transcripts`)
        const data = await res.json()
        if (!data.success) throw new Error("Failed to load transcripts")
        setTranscripts(data.data ?? [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unexpected error")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <h1 className="page-heading">Notes</h1>
      </div>

      {loading && <p className="table-state">Loading transcripts…</p>}
      {error && <p className="table-state table-state--error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="table-divider" />
          <table className="data-table" id="notes-table">
            <thead>
              <tr>
                <th className="th th-name">Name</th>
                <th className="th th-date">Date Uploaded</th>
                <th className="th th-size">Size</th>
                <th className="th th-action" />
              </tr>
            </thead>
            <tbody>
              {transcripts.length === 0 && (
                <tr>
                  <td colSpan={4} className="table-empty">
                    No transcripts yet. Upload and transcribe an audio file first.
                  </td>
                </tr>
              )}
              {transcripts.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="td td-name">
                    <Mic size={18} className="td-icon" />
                    <span>{t.uploads?.filename ?? t.id.slice(0, 20) + "…"}</span>
                  </td>
                  <td className="td">
                    {t.uploads?.upload_time ? formatDate(t.uploads.upload_time) : formatDate(t.created_at)}
                  </td>
                  <td className="td">{formatSize(t.uploads?.file_size)}</td>
                  <td className="td td-action">
                    <Link
                      href={`/notes/${t.id}`}
                      className="btn btn-outline btn-sm"
                      id={`view-note-${t.id}`}
                    >
                      View Notes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
