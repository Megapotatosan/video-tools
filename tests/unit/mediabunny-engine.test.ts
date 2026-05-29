import { describe, expect, it, vi } from "vitest";
import { createMediabunnyEngine } from "@/lib/media/mediabunny-engine";

describe("mediabunny engine", () => {
  it("registers mp3 extension only when mp3 output is requested", async () => {
    const registerMp3Encoder = vi.fn();
    const engine = createMediabunnyEngine({ registerMp3Encoder });
    await engine.prepareForOutput({ container: "mp3", audioCodec: "mp3" });
    expect(registerMp3Encoder).toHaveBeenCalledTimes(1);
  });

  it("does not register mp3 extension for non-mp3 output", async () => {
    const registerMp3Encoder = vi.fn();
    const engine = createMediabunnyEngine({ registerMp3Encoder });
    await engine.prepareForOutput({ container: "mp4", videoCodec: "avc", audioCodec: "aac" });
    expect(registerMp3Encoder).not.toHaveBeenCalled();
  });

  it("registers mp3 extension only once across multiple calls", async () => {
    const registerMp3Encoder = vi.fn();
    const engine = createMediabunnyEngine({ registerMp3Encoder });
    await engine.prepareForOutput({ container: "mp3", audioCodec: "mp3" });
    await engine.prepareForOutput({ container: "mp3", audioCodec: "mp3" });
    expect(registerMp3Encoder).toHaveBeenCalledTimes(1);
  });
});
