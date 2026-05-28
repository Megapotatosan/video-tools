import type { BrowserCapabilityProfile } from "./capabilities";
import type { MediaError } from "./errors";
import type { AudioCodec, ContainerFormat, MediaJob, VideoCodec } from "./jobs";
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

  if (!capabilities.hasWorker) {
    return unsupported("MissingBrowserAPI", "This browser does not support the worker features required for local media processing.");
  }

  if (job.kind === "probe") {
    return { engine: "mediabunny", reason: "native-supported", memoryRisk: "low" };
  }

  if (job.kind === "extract-audio" && job.output.audioCodec === "mp3") {
    if (capabilities.hasMp3Extension) {
      return {
        engine: "mediabunny",
        reason: "extension-supported",
        requiresExtension: "@mediabunny/mp3-encoder",
        memoryRisk: "low"
      };
    }
    return ffmpegPlan(file);
  }

  if (canEncodeOutput(job, capabilities) && capabilities.hasWebCodecs) {
    return { engine: "mediabunny", reason: "native-supported", memoryRisk: file.size > 1_000_000_000 ? "medium" : "low" };
  }

  return ffmpegPlan(file);
}

function canEncodeOutput(job: Exclude<MediaJob, { kind: "probe" }>, capabilities: BrowserCapabilityProfile): boolean {
  const output = job.output;
  const videoOk = output.videoCodec ? capabilities.canEncodeVideo[output.videoCodec] === true : true;
  const audioOk = output.audioCodec ? capabilities.canEncodeAudio[output.audioCodec] === true : true;
  return videoOk && audioOk;
}

function ffmpegPlan(file: FileProfile): EnginePlan {
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
