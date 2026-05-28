import { getSupportedOutputTuples } from "@/lib/media/support-matrix";
import type { OutputTuple, ToolSlug } from "@/lib/media/jobs";

export type ToolDefinition = {
  slug: ToolSlug;
  name: string;
  summary: string;
  outputs: OutputTuple[];
};

const outputs = getSupportedOutputTuples();

export const toolCatalog: ToolDefinition[] = [
  {
    slug: "media-info",
    name: "Media Info",
    summary: "Inspect container, tracks, duration, codecs, resolution, and bitrate.",
    outputs: []
  },
  {
    slug: "convert-video",
    name: "Convert Video",
    summary: "Convert supported local videos to MP4, WebM, MOV, or MKV.",
    outputs: outputs.filter((output) => output.videoCodec)
  },
  {
    slug: "compress-video",
    name: "Compress Video",
    summary: "Reduce bitrate or downscale video with MediaBunny where supported, with FFmpeg fallback.",
    outputs: outputs.filter((output) => output.videoCodec)
  },
  {
    slug: "trim-video",
    name: "Trim Video",
    summary: "Cut a local video to a selected time range.",
    outputs: outputs.filter((output) => output.videoCodec)
  },
  {
    slug: "extract-audio",
    name: "Extract Audio",
    summary: "Extract audio to MP3, M4A, or WAV without uploading the file.",
    outputs: outputs.filter((output) => !output.videoCodec)
  }
];

export function getToolBySlug(slug: ToolSlug): ToolDefinition | undefined {
  return toolCatalog.find((tool) => tool.slug === slug);
}
