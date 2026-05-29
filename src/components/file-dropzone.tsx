"use client";

export function FileDropzone({ compact = false }: { compact?: boolean }) {
  return (
    <label className={compact ? "dropzone compact" : "dropzone"}>
      <input type="file" accept="video/*,audio/*" />
      <strong>Drop a video or audio file</strong>
      <span>Files stay on your device.</span>
    </label>
  );
}
