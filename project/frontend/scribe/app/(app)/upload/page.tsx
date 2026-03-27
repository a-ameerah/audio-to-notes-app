"use client"

import { useCallback, useState } from "react"
import { UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const ACCEPTED_TYPES = [".mp3", ".mp4", ".wav", ".mov", ".ogg", ".mpeg", ".wma"]

export default function UploadPage() {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (f: File) => {
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "")
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(`Unsupported file type. Accepted: Mp3, Mp4, Wav, Mov, Ogg, Mpeg, WMA`)
      return
    }
    setError(null)
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0]
    if (chosen) handleFile(chosen)
  }

  const handleCancel = () => {
    setFile(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`${API_BASE}/upload-audio`, { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? "Upload failed")
      router.push("/audio-files")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-page-center">
      {/* Welcome heading exactly as in Figma */}
      <h1 className="upload-welcome-heading">
        Welcome to Scribe.
      </h1>

      <div className="upload-card">
        <div className="upload-card-inner">
          <h2 className="upload-title">Upload an audio file</h2>
          <p className="upload-subtitle">Choose an audio file to be uploaded</p>

          {/* Dropzone */}
          <div
            className={`dropzone${dragging ? " dropzone--active" : ""}${file ? " dropzone--has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && document.getElementById("file-input")?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={onInputChange}
            />
            {file ? (
              <div className="dropzone-file-selected">
                <UploadCloud size={44} className="dropzone-icon dropzone-icon--ready" />
                <p className="dropzone-file-name">{file.name}</p>
                <p className="dropzone-file-meta">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <UploadCloud size={47} className="dropzone-icon" />
                <p className="dropzone-hint">Click or drag and drop to upload your file</p>
                <p className="dropzone-types">Mp3, Mp4, Wav, Mov, Ogg, Mpeg, WMA.</p>
              </>
            )}
          </div>

          {error && <p className="upload-error">{error}</p>}

          <div className="upload-actions">
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={uploading}
              id="cancel-upload-btn"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!file || uploading}
              id="save-audio-btn"
            >
              {uploading ? "Uploading…" : "Save audio file"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
