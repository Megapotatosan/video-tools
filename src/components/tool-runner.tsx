"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectBrowserCapabilities } from "@/lib/media/capabilities-detect";
import { planMediaJob, type EnginePlan, type FileProfile } from "@/lib/media/engine-planner";
import type { MediaJob, OutputTuple, ToolSlug } from "@/lib/media/jobs";
import { type EngineResult, type MediaProgress } from "@/lib/media/media-engine";
import type { ToolDefinition } from "@/lib/tools/catalog";
import { EnginePlanPanel } from "./engine-plan-panel";
import { FileDropzone } from "./file-dropzone";
import { ProgressPanel } from "./progress-panel";

type RunnerState =
  | { phase: "idle" }
  | { phase: "ready"; file: File; plan: EnginePlan; job: MediaJob }
  | { phase: "running"; progress: MediaProgress }
  | { phase: "info"; data: Record<string, unknown> }
  | { phase: "done"; result: EngineResult }
  | { phase: "error"; message: string };

const defaultVideoOut: OutputTuple = { container: "mp4", videoCodec: "avc", audioCodec: "aac" };

function buildDefaultJob(slug: ToolSlug): MediaJob {
  switch (slug) {
    case "media-info":     return { kind: "probe" };
    case "convert-video":  return { kind: "transcode", output: defaultVideoOut };
    case "compress-video": return { kind: "transcode", output: defaultVideoOut, bitrate: 1500 };
    case "trim-video":     return { kind: "trim", startSeconds: 0, endSeconds: 30, output: defaultVideoOut };
    case "extract-audio":  return { kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } };
    case "mute-video":     return { kind: "mute", output: defaultVideoOut };
    case "rotate-video":   return { kind: "rotate", output: defaultVideoOut, degrees: 90 };
    case "resize-video":   return { kind: "resize", output: defaultVideoOut, width: 1280, height: 720 };
    case "reverse-video":  return { kind: "reverse", output: defaultVideoOut };
    case "crop-video":     return { kind: "crop", output: defaultVideoOut, x: 0, y: 0, width: 640, height: 360 };
  }
}

export function ToolRunner({ tool }: { tool: ToolDefinition }) {
  const [state, setState] = useState<RunnerState>({ phase: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const downloadRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current);
    };
  }, []);

  const handleFile = useCallback((file: File) => {
    const capabilities = detectBrowserCapabilities();
    const fileProfile: FileProfile = { size: file.size };
    const job = buildDefaultJob(tool.slug);
    const plan = job.kind === "probe"
      ? { engine: "mediabunny" as const, reason: "native-supported" as const, memoryRisk: "low" as const }
      : planMediaJob({ job, file: fileProfile, capabilities });
    setState({ phase: "ready", file, plan, job });
  }, [tool.slug]);

  const handleRun = useCallback(async () => {
    if (state.phase !== "ready") return;
    const { file, job } = state;

    const ac = new AbortController();
    abortRef.current = ac;
    setState({ phase: "running", progress: { phase: "loading", message: "Starting…" } });

    try {
      const { FfmpegWasmEngine } = await import("@/lib/media/ffmpeg-wasm-engine");
      const engine = new FfmpegWasmEngine();

      if (job.kind === "probe") {
        const info = await engine.probe(file);
        setState({ phase: "info", data: info });
      } else {
        const result = await engine.runJob(file, job, {
          signal: ac.signal,
          onProgress: (p) => setState({ phase: "running", progress: p })
        });
        if (downloadRef.current) URL.revokeObjectURL(downloadRef.current);
        downloadRef.current = URL.createObjectURL(result.blob);
        setState({ phase: "done", result });
      }
    } catch (err: unknown) {
      if (ac.signal.aborted) {
        setState({ phase: "idle" });
      } else {
        console.error("[VideoTools] Processing error:", err);
        let msg = "Processing failed.";
        if (typeof err === "string" && err) {
          msg = err;
        } else if (err && typeof err === "object") {
          const obj = err as Record<string, unknown>;
          if (typeof obj.message === "string" && obj.message) {
            msg = obj.message;
          } else if (typeof obj.code === "string" || typeof obj.code === "number") {
            msg = `Error code: ${obj.code}`;
          } else {
            try { msg = JSON.stringify(obj); } catch { /* noop */ }
          }
        }
        setState({ phase: "error", message: msg });
      }
    } finally {
      abortRef.current = null;
    }
  }, [state]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleReset = useCallback(() => {
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current);
      downloadRef.current = null;
    }
    setState({ phase: "idle" });
  }, []);

  return (
    <section className="tool-runner" data-testid="tool-runner">
      <div className="tool-runner-header">
        <h1 className="tool-runner-title">{tool.name}</h1>
        <p className="tool-runner-summary">{tool.summary}</p>
      </div>

      <div className="tool-runner-body">
        {(state.phase === "idle" || state.phase === "ready") && (
          <FileDropzone
            onFile={handleFile}
            compact={state.phase === "ready"}
            label={state.phase === "ready" ? state.file.name : undefined}
          />
        )}

        {state.phase === "ready" && (
          <>
            <EnginePlanPanel plan={state.plan} />
            <div className="runner-actions">
              <button className="btn-primary" onClick={handleRun}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Process
              </button>
            </div>
          </>
        )}

        {state.phase === "running" && (
          <>
            <ProgressPanel progress={state.progress} />
            <div className="runner-actions">
              <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </>
        )}

        {state.phase === "info" && (
          <>
            <div className="info-panel">
              <h2>File Info</h2>
              <dl className="info-grid">
                {Object.entries(state.data).map(([k, v]) => (
                  <div key={k} className="info-row">
                    <dt>{k}</dt>
                    <dd>{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="runner-actions">
              <button className="btn-secondary" onClick={handleReset}>Inspect another file</button>
            </div>
          </>
        )}

        {state.phase === "done" && downloadRef.current && (
          <>
            <div className="done-panel">
              <div className="done-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="done-text">
                <div className="done-label">Done</div>
                <div className="done-filename">{state.result.fileName}</div>
              </div>
              <a className="btn-primary" href={downloadRef.current} download={state.result.fileName}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </a>
            </div>
            <div className="runner-actions">
              <button className="btn-secondary" onClick={handleReset}>Process another file</button>
            </div>
          </>
        )}

        {state.phase === "error" && (
          <>
            <div className="error-panel">
              <div className="error-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <div className="error-message">{state.message}</div>
            </div>
            <div className="runner-actions">
              <button className="btn-secondary" onClick={handleReset}>Try again</button>
            </div>
          </>
        )}

        {state.phase === "idle" && (
          <EnginePlanPanel />
        )}
      </div>
    </section>
  );
}
