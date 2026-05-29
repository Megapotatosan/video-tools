import { describe, expect, it } from "vitest";
import { getFfmpegAssetPaths } from "@/lib/media/ffmpeg-wasm-engine";

describe("ffmpeg wasm engine", () => {
  it("uses same-origin asset paths", () => {
    expect(getFfmpegAssetPaths()).toEqual({
      coreURL: "/ffmpeg/ffmpeg-core.js",
      wasmURL: "/ffmpeg/ffmpeg-core.wasm",
      workerURL: "/ffmpeg/ffmpeg-core.worker.js"
    });
  });
});
