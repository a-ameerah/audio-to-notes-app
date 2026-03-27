"use client"

import { useEffect, useState } from "react"
import { Mic } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface Upload {
  id: string
  filename: string
  file_url: string
  file_size: number
  status: string
  upload_time: string
  duration_seconds?: number
}

function formatDuration(seconds?: number) {
  if (!seconds) return "—"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m} min${m !== 1 ? "s" : ""} ${s} sec${s !== 1 ? "s" : ""}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} Mb`
}

export default function AudioFilesPage() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [transcribing, setTranscribing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/uploads`)
      const data = await res.json()
      if (!data.success) throw new Error("Failed to load files")
      setUploads(data.data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleTranscribe = async () => {
    if (selected.size === 0) return
    setTranscribing(true)
    setFeedback(null)
    let successCount = 0
    for (const id of selected) {
      try {
        const res = await fetch(`${API_BASE}/transcribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio_file_id: id }),
        })
        const data = await res.json()
        if (data.success) successCount++
      } catch { /* individual error — continue */ }
    }
    setFeedback(`${successCount} of ${selected.size} file${selected.size > 1 ? "s" : ""} transcribed`)
    setSelected(new Set())
    setTranscribing(false)
    load()
  }

  return (
    <div className="page-container">
      {/* Top bar */}
      <div className="page-top-bar" style={{ marginBottom: 4 }}>
        <h1 className="page-heading">All Files</h1>
        <button
          id="transcribe-btn"
          className="btn btn-primary"
          onClick={handleTranscribe}
          disabled={selected.size === 0 || transcribing}
          style={{ marginTop: 6 }}
        >
          {transcribing ? "Transcribing…" : "Transcribe"}
        </button>
      </div>

      {feedback && <p style={{ color: "#2e7d32", fontSize: "0.87rem", marginBottom: 8 }}>{feedback}</p>}

      {loading && <p className="table-state">Loading audio files…</p>}
      {error && <p className="table-state table-state--error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="table-divider" />
          <table className="data-table" id="audio-files-table">
            <thead>
              <tr>
                <th className="th th-check" />
                <th className="th th-name">Name</th>
                <th className="th th-date">Date Uploaded</th>
                <th className="th th-size">Size</th>
                <th className="th th-duration">Duration</th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-empty">No audio files uploaded yet.</td>
                </tr>
              )}
              {uploads.map((u) => (
                <tr
                  key={u.id}
                  className="table-row"
                  onClick={() => toggleSelect(u.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="td td-check">
                    <input
                      type="checkbox"
                      className="row-checkbox"
                      checked={selected.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      id={`check-${u.id}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="td td-name">
                    <Mic size={18} className="td-icon" />
                    <span>{u.filename}</span>
                  </td>
                  <td className="td">{formatDate(u.upload_time)}</td>
                  <td className="td">{formatSize(u.file_size)}</td>
                  <td className="td">{formatDuration(u.duration_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
