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

  return (
    <div
      className={["dropzone", compact ? "compact" : "", dragging ? "dragging" : ""].filter(Boolean).join(" ")}
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
      <strong>{label ?? "Drop a video or audio file"}</strong>
      <span>Files stay on your device.</span>
    </div>
  );
}
