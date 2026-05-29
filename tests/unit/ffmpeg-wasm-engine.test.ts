import { describe, expect, it } from "vitest";
import { getFfmpegAssetPaths } from "@/lib/media/ffmpeg-wasm-engine";

const CDN = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd";

describe("ffmpeg wasm engine", () => {
  it("loads FFmpeg assets from pinned CDN", () => {
    const paths = getFfmpegAssetPaths();
    expect(paths.coreURL).toBe(`${CDN}/ffmpeg-core.js`);
    expect(paths.wasmURL).toBe(`${CDN}/ffmpeg-core.wasm`);
    expect(paths.workerURL).toBe(`${CDN}/ffmpeg-core.worker.js`);
  });

  it("asset URLs are pinned to a specific version", () => {
    const { coreURL } = getFfmpegAssetPaths();
    expect(coreURL).toMatch(/@ffmpeg\/core@\d+\.\d+\.\d+/);
  });
});
