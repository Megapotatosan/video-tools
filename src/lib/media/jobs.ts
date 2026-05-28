export type ContainerFormat = "mp4" | "webm" | "mov" | "mkv" | "mp3" | "m4a" | "wav";
export type VideoCodec = "avc" | "hevc" | "vp8" | "vp9" | "av1";
export type AudioCodec = "aac" | "opus" | "mp3" | "flac" | "pcm-s16";
export type ToolSlug = "media-info" | "convert-video" | "compress-video" | "trim-video" | "extract-audio";

export type OutputTuple = {
  readonly container: ContainerFormat;
  readonly videoCodec?: VideoCodec;
  readonly audioCodec?: AudioCodec;
};

export type MediaJob =
  | { kind: "probe" }
  | { kind: "transcode"; output: OutputTuple; bitrate?: number; width?: number; height?: number }
  | { kind: "trim"; startSeconds: number; endSeconds: number; output: OutputTuple }
  | { kind: "extract-audio"; output: OutputTuple; bitrate?: number };
