import { describe, expect, it } from "vitest";
import { getFfmpegAssetPaths } from "@/lib/media/ffmpeg-wasm-engine";

const CDN = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";

describe("ffmpeg wasm engine", () => {
  it("loads FFmpeg assets from pinned CDN", () => {
    const paths = getFfmpegAssetPaths();
    expect(paths.coreURL).toBe(`${CDN}/ffmpeg-core.js`);
    expect(paths.wasmURL).toBe(`${CDN}/ffmpeg-core.wasm`);
  });

  it("asset URLs are pinned to a specific version", () => {
    const { coreURL } = getFfmpegAssetPaths();
    expect(coreURL).toMatch(/@ffmpeg\/core@\d+\.\d+\.\d+/);
  });
});
