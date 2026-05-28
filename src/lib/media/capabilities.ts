import type { AudioCodec, VideoCodec } from "./jobs";

export type CodecCapability = Record<string, boolean>;

export type BrowserCapabilityProfile = {
  hasWebCodecs: boolean;
  hasWorker: boolean;
  hasFfmpegAssets: boolean;
  hasMp3Extension: boolean;
  crossOriginIsolated: boolean;
  canEncodeVideo: Partial<Record<VideoCodec, boolean>>;
  canDecodeVideo: Partial<Record<VideoCodec, boolean>>;
  canEncodeAudio: Partial<Record<AudioCodec, boolean>>;
  canDecodeAudio: Partial<Record<AudioCodec, boolean>>;
};

export function canUseThreadedFfmpeg(
  profile: Pick<BrowserCapabilityProfile, "crossOriginIsolated"> & { hasSharedArrayBuffer?: boolean }
): boolean {
  return profile.crossOriginIsolated === true;
}
