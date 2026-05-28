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
});
