import type { MediaError } from "./errors";
import type { MediaJob } from "./jobs";

export type MediaProgress = {
  phase: "loading" | "probing" | "processing" | "finalizing";
  percent?: number;
  message: string;
};

export type EngineRunOptions = {
  signal: AbortSignal;
  onProgress?: (progress: MediaProgress) => void;
};

export type EngineResult = {
  blob: Blob;
  fileName: string;
  mimeType: string;
};

export interface MediaEngine {
  probe(file: File, options: EngineRunOptions): Promise<Record<string, unknown>>;
  transcode(file: File, job: Extract<MediaJob, { kind: "transcode" }>, options: EngineRunOptions): Promise<EngineResult>;
  trim(file: File, job: Extract<MediaJob, { kind: "trim" }>, options: EngineRunOptions): Promise<EngineResult>;
  extractAudio(file: File, job: Extract<MediaJob, { kind: "extract-audio" }>, options: EngineRunOptions): Promise<EngineResult>;
}

export function createAbortError(): MediaError {
  return { code: "Aborted", message: "The media job was cancelled.", recoverable: true };
}

export function isAbortError(error: unknown): error is MediaError {
  return typeof error === "object" && error !== null && "code" in error && error.code === "Aborted";
}
