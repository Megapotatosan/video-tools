import { describe, expect, it } from "vitest";
import { canUseThreadedFfmpeg } from "@/lib/media/capabilities";

describe("capabilities", () => {
  it("uses crossOriginIsolated as the threaded FFmpeg signal", () => {
    expect(canUseThreadedFfmpeg({ crossOriginIsolated: true })).toBe(true);
    expect(canUseThreadedFfmpeg({ crossOriginIsolated: false, hasSharedArrayBuffer: true })).toBe(false);
  });
});
