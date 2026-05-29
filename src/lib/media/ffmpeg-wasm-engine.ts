import type { EngineResult, EngineRunOptions, MediaProgress } from "./media-engine";
import { createAbortError } from "./media-engine";
import { buildFfmpegArgs, buildOutputFileName } from "./ffmpeg-commands";
import type { MediaJob } from "./jobs";

export type FfmpegAssetPaths = {
  coreURL: string;
  wasmURL: string;
};

const CDN = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd";

export function getFfmpegAssetPaths(): FfmpegAssetPaths {
  return {
    coreURL: `${CDN}/ffmpeg-core.js`,
    wasmURL: `${CDN}/ffmpeg-core.wasm`
  };
}

function diagnoseFailure(log: string): string {
  if (log.includes("hardware accelerated AV1") || log.includes("[av1 @") && log.includes("not implemented")) {
    return "Cannot decode this video — it uses the AV1 codec which requires hardware support not available in the browser. Re-encode to H.264 and try again.";
  }
  if (log.includes("hevc") && (log.includes("not found") || log.includes("not implemented"))) {
    return "Cannot decode this H.265/HEVC video in the browser. Re-encode to H.264 and try again.";
  }
  if (log.includes("Decoder") && log.includes("not found")) {
    return "Unsupported input codec — the video uses a codec not available in this FFmpeg build. Try converting to H.264 first.";
  }
  if (log.includes("Invalid data found")) {
    return "The file appears to be corrupted or uses an unsupported format.";
  }
  if (log.includes("moov atom not found")) {
    return "The video file is incomplete or corrupted (missing moov atom).";
  }
  return "FFmpeg exited with an error. See browser console for full details.";
}

export class FfmpegWasmEngine {
  private ffmpeg: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
  private runLog: string[] = [];

  async probe(file: File): Promise<Record<string, unknown>> {
    return {
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
      lastModified: new Date(file.lastModified).toISOString()
    };
  }

  async runJob(
    file: File,
    job: Exclude<MediaJob, { kind: "probe" }>,
    options: EngineRunOptions
  ): Promise<EngineResult> {
    const { signal, onProgress } = options;

    const ffmpeg = await this.ensureLoaded(signal, onProgress);
    if (signal.aborted) throw createAbortError();

    const inputExt = (file.name.split(".").pop() ?? "bin").toLowerCase();
    const inputName = `input.${inputExt}`;
    const { args, outputName, mimeType } = buildFfmpegArgs(job);

    onProgress?.({ phase: "loading", message: "Reading file…" });
    const { fetchFile } = await import("@ffmpeg/util");
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    if (signal.aborted) throw createAbortError();

    this.runLog = [];
    const cmd = ["-y", "-i", inputName, ...args, outputName];
    console.log("[FFmpeg] exec:", cmd.join(" "));
    onProgress?.({ phase: "processing", message: "Processing…" });
    const exitCode = await ffmpeg.exec(cmd);

    if (signal.aborted) throw createAbortError();
    if (exitCode !== 0) {
      const message = diagnoseFailure(this.runLog.join("\n"));
      throw { code: "EncodeFailed", message, recoverable: true };
    }

    onProgress?.({ phase: "finalizing", message: "Finalizing…" });
    const data = await ffmpeg.readFile(outputName) as Uint8Array;
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});

    // Copy into a plain ArrayBuffer to satisfy Blob constructor's type constraint
    // (FFmpeg may return a view over SharedArrayBuffer which TypeScript rejects as BlobPart).
    const rawBytes = data instanceof Uint8Array ? data : new Uint8Array(0);
    const ab = new ArrayBuffer(rawBytes.byteLength);
    new Uint8Array(ab).set(rawBytes);
    return {
      blob: new Blob([ab], { type: mimeType }),
      fileName: buildOutputFileName(file.name, job),
      mimeType
    };
  }

  private async ensureLoaded(
    signal: AbortSignal,
    onProgress?: (p: MediaProgress) => void
  ): Promise<import("@ffmpeg/ffmpeg").FFmpeg> {
    if (this.ffmpeg) return this.ffmpeg;

    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    const ffmpeg = new FFmpeg();

    signal.addEventListener("abort", () => { ffmpeg.terminate(); }, { once: true });

    ffmpeg.on("log", ({ message }: { message: string }) => {
      console.log("[FFmpeg]", message);
      this.runLog.push(message);
    });

    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      onProgress?.({
        phase: "processing",
        percent: Math.round(progress * 100),
        message: "Processing…"
      });
    });

    onProgress?.({ phase: "loading", message: "Loading FFmpeg…" });
    const paths = getFfmpegAssetPaths();
    await ffmpeg.load({
      coreURL: await toBlobURL(paths.coreURL, "text/javascript"),
      wasmURL: await toBlobURL(paths.wasmURL, "application/wasm")
    });

    this.ffmpeg = ffmpeg;
    return ffmpeg;
  }
}
