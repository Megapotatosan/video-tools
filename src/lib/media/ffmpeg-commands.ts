import type { AudioCodec, ContainerFormat, MediaJob, OutputTuple, VideoCodec } from "./jobs";

const videoCodecArgs: Record<VideoCodec, string[]> = {
  avc:  ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "23", "-pix_fmt", "yuv420p"],
  hevc: ["-c:v", "libx265", "-preset", "ultrafast", "-crf", "28"],
  vp8:  ["-c:v", "libvpx", "-b:v", "1M"],
  vp9:  ["-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0"],
  av1:  ["-c:v", "libaom-av1", "-crf", "30", "-b:v", "0", "-cpu-used", "8"]
};

const audioCodecArgs: Record<AudioCodec, string[]> = {
  aac:       ["-c:a", "aac", "-b:a", "128k"],
  opus:      ["-c:a", "libopus", "-b:a", "128k"],
  mp3:       ["-c:a", "libmp3lame", "-b:a", "192k"],
  flac:      ["-c:a", "flac"],
  "pcm-s16": ["-c:a", "pcm_s16le"]
};

const containerExtMap: Record<ContainerFormat, string> = {
  mp4: "mp4", webm: "webm", mov: "mov", mkv: "mkv",
  mp3: "mp3", m4a:  "m4a", wav: "wav"
};

const containerMimeMap: Record<ContainerFormat, string> = {
  mp4:  "video/mp4",
  webm: "video/webm",
  mov:  "video/quicktime",
  mkv:  "video/x-matroska",
  mp3:  "audio/mpeg",
  m4a:  "audio/mp4",
  wav:  "audio/wav"
};

export function getContainerExt(format: ContainerFormat): string {
  return containerExtMap[format];
}

export function getContainerMime(format: ContainerFormat): string {
  return containerMimeMap[format];
}

function vArgs(codec: VideoCodec, bitrateKbps?: number): string[] {
  const base = videoCodecArgs[codec];
  return bitrateKbps ? [...base, "-b:v", `${bitrateKbps}k`] : base;
}

function aArgs(codec: AudioCodec): string[] {
  return audioCodecArgs[codec];
}

function outputCodecArgs(output: OutputTuple, bitrateKbps?: number): string[] {
  return [
    ...(output.videoCodec ? vArgs(output.videoCodec, bitrateKbps) : []),
    ...(output.audioCodec ? aArgs(output.audioCodec) : [])
  ];
}

export type FfmpegCommand = {
  args: string[];
  outputName: string;
  mimeType: string;
};

export function buildFfmpegArgs(
  job: Exclude<MediaJob, { kind: "probe" }>,
): FfmpegCommand {
  const ext = getContainerExt(job.output.container);
  const outputName = `output.${ext}`;
  const mimeType = getContainerMime(job.output.container);

  switch (job.kind) {
    case "transcode":
      return {
        args: [
          ...outputCodecArgs(job.output, job.bitrate),
          ...(job.width && job.height ? ["-vf", `scale=${job.width}:${job.height}`] : [])
        ],
        outputName, mimeType
      };

    case "trim":
      return {
        args: [
          "-ss", String(job.startSeconds),
          "-to", String(job.endSeconds),
          ...outputCodecArgs(job.output)
        ],
        outputName, mimeType
      };

    case "extract-audio":
      return {
        args: ["-vn", ...outputCodecArgs(job.output, job.bitrate)],
        outputName, mimeType
      };

    case "mute":
      return {
        args: ["-an", ...(job.output.videoCodec ? vArgs(job.output.videoCodec) : [])],
        outputName, mimeType
      };

    case "rotate": {
      const rotVf = job.degrees === 180 ? "vflip,hflip"
                  : job.degrees === 90  ? "transpose=1"
                  : "transpose=2";
      const extraVf = [
        ...(job.flipH ? ["hflip"] : []),
        ...(job.flipV ? ["vflip"] : [])
      ];
      const vf = [rotVf, ...extraVf].join(",");
      return {
        args: ["-vf", vf, ...outputCodecArgs(job.output)],
        outputName, mimeType
      };
    }

    case "resize":
      return {
        args: ["-vf", `scale=${job.width}:${job.height}`, ...outputCodecArgs(job.output)],
        outputName, mimeType
      };

    case "reverse":
      return {
        args: ["-vf", "reverse", "-af", "areverse", ...outputCodecArgs(job.output)],
        outputName, mimeType
      };

    case "crop":
      return {
        args: ["-vf", `crop=${job.width}:${job.height}:${job.x}:${job.y}`, ...outputCodecArgs(job.output)],
        outputName, mimeType
      };
  }
}

export function buildOutputFileName(
  inputName: string,
  job: Exclude<MediaJob, { kind: "probe" }>
): string {
  const base = inputName.replace(/\.[^.]+$/, "");
  const ext = getContainerExt(job.output.container);
  const suffixMap: Record<Exclude<MediaJob, { kind: "probe" }>["kind"], string> = {
    transcode:     "converted",
    trim:          "trimmed",
    "extract-audio": "audio",
    mute:          "muted",
    rotate:        "rotated",
    resize:        "resized",
    reverse:       "reversed",
    crop:          "cropped"
  };
  return `${base}-${suffixMap[job.kind]}.${ext}`;
}
