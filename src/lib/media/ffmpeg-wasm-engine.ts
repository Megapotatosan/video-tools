import type { EngineResult, EngineRunOptions, MediaProgress } from "./media-engine";
import { createAbortError } from "./media-engine";
import { buildFfmpegArgs, buildOutputFileName } from "./ffmpeg-commands";
import type { MediaJob } from "./jobs";

export type FfmpegAssetPaths = {
  coreURL: string;
  wasmURL: string;
  workerURL: string;
};

export function getFfmpegAssetPaths(): FfmpegAssetPaths {
  return {
    coreURL: "/ffmpeg/ffmpeg-core.js",
    wasmURL: "/ffmpeg/ffmpeg-core.wasm",
    workerURL: "/ffmpeg/ffmpeg-core.worker.js"
  };
}

export class FfmpegWasmEngine {
  // FFmpeg instance is retained across jobs on the same engine instance.
  private ffmpeg: import("@ffmpeg/ffmpeg").FFmpeg | null = null;

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

    const inputExt = file.name.split(".").pop() ?? "bin";
    const inputName = `input.${inputExt}`;
    const { args, outputName, mimeType } = buildFfmpegArgs(job);

    onProgress?.({ phase: "loading", message: "Reading file…" });
    const { fetchFile } = await import("@ffmpeg/util");
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    if (signal.aborted) throw createAbortError();

    onProgress?.({ phase: "processing", message: "Processing…" });
    const exitCode = await ffmpeg.exec(["-i", inputName, ...args, outputName]);

    if (signal.aborted) throw createAbortError();
    if (exitCode !== 0) {
      throw { code: "EncodeFailed", message: `FFmpeg exited with code ${exitCode}.`, recoverable: true };
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
