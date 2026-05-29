export type FfmpegAssetPaths = {
  coreURL: string;
  wasmURL: string;
  workerURL: string;
};

export function getFfmpegAssetPaths(): FfmpegAssetPaths {
  return {
    coreURL: "/ffmpeg/ffmpeg-core.js",
    wasmURL: "/ffmpeg/ffmpeg-core.wasm",
    workerURL: "/ffmpeg/ffmpeg-core.worker.js"
  };
}
