import type { BrowserCapabilityProfile } from "./capabilities";
import type { MediaError } from "./errors";
import type { AudioCodec, ContainerFormat, MediaJob, OutputTuple, VideoCodec } from "./jobs";
import { isSupportedOutputTuple } from "./support-matrix";

export type FileProfile = {
  size: number;
  container?: ContainerFormat;
  videoCodec?: VideoCodec;
  audioCodec?: AudioCodec;
};

export type EnginePlan = {
  engine: "mediabunny" | "ffmpeg" | "none";
  reason: "native-supported" | "extension-supported" | "ffmpeg-fallback" | "unsupported";
  requiresExtension?: "@mediabunny/mp3-encoder";
  memoryRisk: "low" | "medium" | "high";
  error?: MediaError;
};

export function planMediaJob(input: {
  job: MediaJob;
  file: FileProfile;
  capabilities: BrowserCapabilityProfile;
}): EnginePlan {
  const { job, file, capabilities } = input;
  const output = "output" in job ? job.output : undefined;

  if (output && !isSupportedOutputTuple(output)) {
    return unsupported("UnsupportedCodec", "The selected container and codec combination is not supported.");
  }

  if (output && !isValidOutputForJob(job, output)) {
    return unsupported("UnsupportedCodec", "The selected output is not valid for this job type.");
  }

  if (!capabilities.hasWorker) {
    return unsupported("MissingBrowserAPI", "This browser does not support the worker features required for local media processing.");
  }

  if (job.kind === "probe") {
    return { engine: "mediabunny", reason: "native-supported", memoryRisk: "low" };
  }

  // These operations use FFmpeg filter chains not exposed by the MediaBunny job API.
  if (job.kind === "mute" || job.kind === "rotate" || job.kind === "resize" ||
      job.kind === "reverse" || job.kind === "crop") {
    return ffmpegPlan(file, capabilities);
  }

  if (job.kind === "extract-audio" && job.output.audioCodec === "mp3") {
    if (capabilities.hasMp3Extension && capabilities.hasWebCodecs && canDecodeInputForJob(job, file, capabilities)) {
      return {
        engine: "mediabunny",
        reason: "extension-supported",
        requiresExtension: "@mediabunny/mp3-encoder",
        memoryRisk: file.size > 1_000_000_000 ? "medium" : "low"
      };
    }
    return ffmpegPlan(file, capabilities);
  }

  if (canEncodeOutput(job, capabilities) && canDecodeInputForJob(job, file, capabilities) && capabilities.hasWebCodecs) {
    return { engine: "mediabunny", reason: "native-supported", memoryRisk: file.size > 1_000_000_000 ? "medium" : "low" };
  }

  return ffmpegPlan(file, capabilities);
}

function canEncodeOutput(job: Exclude<MediaJob, { kind: "probe" }>, capabilities: BrowserCapabilityProfile): boolean {
  const output = job.output;
  const videoOk = output.videoCodec ? capabilities.canEncodeVideo[output.videoCodec] === true : true;
  const audioOk = output.audioCodec ? capabilities.canEncodeAudio[output.audioCodec] === true : true;
  return videoOk && audioOk;
}

function canDecodeInputForJob(
  job: Exclude<MediaJob, { kind: "probe" }>,
  file: FileProfile,
  capabilities: BrowserCapabilityProfile
): boolean {
  if (job.kind === "extract-audio") {
    return file.audioCodec ? capabilities.canDecodeAudio[file.audioCodec] === true : false;
  }

  const videoOk = file.videoCodec ? capabilities.canDecodeVideo[file.videoCodec] === true : false;
  const audioOk = file.audioCodec ? capabilities.canDecodeAudio[file.audioCodec] === true : false;
  return videoOk && audioOk;
}

function isValidOutputForJob(job: MediaJob, output: OutputTuple): boolean {
  if (job.kind === "extract-audio") {
    return output.videoCodec === undefined;
  }
  if (job.kind === "mute" || job.kind === "rotate" || job.kind === "resize" ||
      job.kind === "reverse" || job.kind === "crop") {
    return output.videoCodec !== undefined;
  }
  return true;
}

function ffmpegPlan(file: FileProfile, capabilities: BrowserCapabilityProfile): EnginePlan {
  if (!capabilities.hasFfmpegAssets) {
    return unsupported("AssetLoadFailed", "FFmpeg assets are unavailable for local media processing.");
  }

  return {
    engine: "ffmpeg",
    reason: "ffmpeg-fallback",
    memoryRisk: file.size > 500_000_000 ? "high" : "medium"
  };
}

function unsupported(code: MediaError["code"], message: string): EnginePlan {
  return {
    engine: "none",
    reason: "unsupported",
    memoryRisk: "low",
    error: { code, message, recoverable: true }
  };
}
