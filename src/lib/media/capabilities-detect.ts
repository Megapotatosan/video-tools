import type { BrowserCapabilityProfile } from "./capabilities";

export function detectBrowserCapabilities(): BrowserCapabilityProfile {
  return {
    hasWebCodecs: typeof VideoEncoder !== "undefined",
    hasWorker: typeof Worker !== "undefined",
    hasFfmpegAssets: true,
    hasMp3Extension: false,
    crossOriginIsolated: (globalThis as { crossOriginIsolated?: boolean }).crossOriginIsolated ?? false,
    // Codec maps left empty — routes video jobs to FFmpeg until WebCodecs probing is implemented.
    canEncodeVideo: {},
    canDecodeVideo: {},
    canEncodeAudio: {},
    canDecodeAudio: {}
  };
}
