import { describe, expect, it } from "vitest";
import { getSupportedOutputTuples, isSupportedOutputTuple } from "@/lib/media/support-matrix";

describe("support matrix", () => {
  it("allows implemented MP4 H.264 AAC output", () => {
    expect(isSupportedOutputTuple({ container: "mp4", videoCodec: "avc", audioCodec: "aac" })).toBe(true);
  });

  it("rejects invalid H.264 in WebM output before engine execution", () => {
    expect(isSupportedOutputTuple({ container: "webm", videoCodec: "avc", audioCodec: "opus" })).toBe(false);
  });

  it("exposes the same tuples used by the UI catalog", () => {
    expect(getSupportedOutputTuples()).toContainEqual({
      container: "webm",
      videoCodec: "vp9",
      audioCodec: "opus"
    });
  });

  it("accepts every advertised output tuple", () => {
    for (const tuple of getSupportedOutputTuples()) {
      expect(isSupportedOutputTuple(tuple)).toBe(true);
    }
  });

  it("does not expose duplicate output tuples", () => {
    const keys = getSupportedOutputTuples().map((tuple) =>
      `${tuple.container}:${tuple.videoCodec ?? ""}:${tuple.audioCodec ?? ""}`
    );

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps audio-only containers free of video codecs", () => {
    const audioOnlyContainers = new Set(["mp3", "m4a", "wav"]);

    for (const tuple of getSupportedOutputTuples()) {
      if (audioOnlyContainers.has(tuple.container)) {
        expect(tuple.videoCodec).toBeUndefined();
      }
    }
  });
});
