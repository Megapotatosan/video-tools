import type { OutputTuple } from "./jobs";

const tuples: OutputTuple[] = [
  { container: "mp4", videoCodec: "avc", audioCodec: "aac" },
  { container: "mp4", videoCodec: "hevc", audioCodec: "aac" },
  { container: "webm", videoCodec: "vp8", audioCodec: "opus" },
  { container: "webm", videoCodec: "vp9", audioCodec: "opus" },
  { container: "webm", videoCodec: "av1", audioCodec: "opus" },
  { container: "mov", videoCodec: "avc", audioCodec: "aac" },
  { container: "mkv", videoCodec: "avc", audioCodec: "aac" },
  { container: "mkv", videoCodec: "vp9", audioCodec: "opus" },
  { container: "mp3", audioCodec: "mp3" },
  { container: "m4a", audioCodec: "aac" },
  { container: "wav", audioCodec: "pcm-s16" }
];

export function getSupportedOutputTuples(): OutputTuple[] {
  return tuples.map((tuple) => ({ ...tuple }));
}

export function isSupportedOutputTuple(tuple: OutputTuple): boolean {
  return tuples.some((candidate) =>
    candidate.container === tuple.container &&
    candidate.videoCodec === tuple.videoCodec &&
    candidate.audioCodec === tuple.audioCodec
  );
}
