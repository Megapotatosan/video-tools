import { describe, expect, it } from "vitest";
import { planMediaJob } from "@/lib/media/engine-planner";
import type { BrowserCapabilityProfile } from "@/lib/media/capabilities";

const baseProfile: BrowserCapabilityProfile = {
  hasWebCodecs: true,
  hasWorker: true,
  hasFfmpegAssets: true,
  hasMp3Extension: true,
  crossOriginIsolated: true,
  canEncodeVideo: { avc: true, vp9: true },
  canDecodeVideo: { avc: true, vp9: true },
  canEncodeAudio: { aac: true, opus: true, mp3: false },
  canDecodeAudio: { aac: true, opus: true, mp3: true }
};

describe("engine planner", () => {
  it("chooses MediaBunny for supported MP4 transcode", () => {
    const plan = planMediaJob({
      job: { kind: "transcode", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } },
      file: { size: 10_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: baseProfile
    });

    expect(plan.engine).toBe("mediabunny");
    expect(plan.reason).toBe("native-supported");
  });

  it("rejects invalid output tuples before engine execution", () => {
    const plan = planMediaJob({
      job: { kind: "transcode", output: { container: "webm", videoCodec: "avc", audioCodec: "opus" } },
      file: { size: 10_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: baseProfile
    });

    expect(plan.engine).toBe("none");
    expect(plan.error?.code).toBe("UnsupportedCodec");
  });

  it("routes MP3 extraction to MediaBunny when mp3 extension is present", () => {
    const plan = planMediaJob({
      job: { kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } },
      file: { size: 8_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: baseProfile
    });

    expect(plan.engine).toBe("mediabunny");
    expect(plan.requiresExtension).toBe("@mediabunny/mp3-encoder");
  });

  it("routes MP3 extraction to FFmpeg when mp3 extension is absent", () => {
    const plan = planMediaJob({
      job: { kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } },
      file: { size: 8_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: { ...baseProfile, hasMp3Extension: false }
    });

    expect(plan.engine).toBe("ffmpeg");
  });

  it("falls back to FFmpeg when MediaBunny cannot decode the input", () => {
    const plan = planMediaJob({
      job: { kind: "transcode", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } },
      file: { size: 10_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: { ...baseProfile, canDecodeVideo: { ...baseProfile.canDecodeVideo, avc: false } }
    });

    expect(plan.engine).toBe("ffmpeg");
    expect(plan.reason).toBe("ffmpeg-fallback");
  });

  it("returns AssetLoadFailed when input decode is unsupported and FFmpeg assets are missing", () => {
    const plan = planMediaJob({
      job: { kind: "transcode", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } },
      file: { size: 10_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: {
        ...baseProfile,
        hasFfmpegAssets: false,
        canDecodeVideo: { ...baseProfile.canDecodeVideo, avc: false }
      }
    });

    expect(plan.engine).toBe("none");
    expect(plan.reason).toBe("unsupported");
    expect(plan.error?.code).toBe("AssetLoadFailed");
  });

  it("routes MP3 extraction to FFmpeg when the extension cannot decode the input", () => {
    const plan = planMediaJob({
      job: { kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } },
      file: { size: 8_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: { ...baseProfile, canDecodeAudio: { ...baseProfile.canDecodeAudio, aac: false } }
    });

    expect(plan.engine).toBe("ffmpeg");
    expect(plan.requiresExtension).toBeUndefined();
  });

  it("reports medium memory risk for large MediaBunny native jobs", () => {
    const plan = planMediaJob({
      job: { kind: "transcode", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } },
      file: { size: 1_500_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: baseProfile
    });

    expect(plan.engine).toBe("mediabunny");
    expect(plan.memoryRisk).toBe("medium");
  });

  it("reports high memory risk for large FFmpeg fallback jobs", () => {
    const plan = planMediaJob({
      job: { kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } },
      file: { size: 800_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: { ...baseProfile, hasMp3Extension: false }
    });

    expect(plan.engine).toBe("ffmpeg");
    expect(plan.memoryRisk).toBe("high");
  });
});
