"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  compact?: boolean;
  label?: string;
  onFile?: (file: File) => void;
};

export function FileDropzone({ compact = false, label, onFile }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile?.(file);
  }, [onFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  }, [handleFiles]);

  if (compact) {
    return (
      <div className="dropzone compact">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)", flexShrink: 0 }}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span className="dropzone-file-name">{label ?? "File selected"}</span>
      </div>
    );
  }

  return (
    <div
      className={["dropzone", dragging ? "dragging" : ""].filter(Boolean).join(" ")}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      aria-label="Drop a file or click to browse"
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <svg className="dropzone-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span className="dropzone-label">Drop a file or click to browse</span>
      <span className="dropzone-hint">Video or audio · Stays on your device</span>
    </div>
  );
}
