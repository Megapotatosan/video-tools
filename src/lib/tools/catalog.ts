import { getSupportedOutputTuples } from "@/lib/media/support-matrix";
import type { OutputTuple, ToolSlug } from "@/lib/media/jobs";

export type ToolDefinition = {
  readonly slug: ToolSlug;
  readonly name: string;
  readonly summary: string;
  readonly outputs: readonly OutputTuple[];
};

const outputs = getSupportedOutputTuples();
const videoOutputs = outputs.filter((output) => output.videoCodec);
const audioOutputs = outputs.filter((output) => !output.videoCodec);

function freezeOutputs(outputs: readonly OutputTuple[]): readonly OutputTuple[] {
  return Object.freeze(outputs.map((output) => Object.freeze({ ...output })));
}

function defineTool(tool: ToolDefinition): ToolDefinition {
  return Object.freeze(tool);
}

export const toolCatalog: readonly ToolDefinition[] = Object.freeze([
  defineTool({
    slug: "media-info",
    name: "Media Info",
    summary: "Inspect container, tracks, duration, codecs, resolution, and bitrate.",
    outputs: Object.freeze([])
  }),
  defineTool({
    slug: "convert-video",
    name: "Convert Video",
    summary: "Convert supported local videos to MP4, WebM, MOV, or MKV.",
    outputs: freezeOutputs(videoOutputs)
  }),
  defineTool({
    slug: "compress-video",
    name: "Compress Video",
    summary: "Reduce bitrate or downscale video with MediaBunny where supported, with FFmpeg fallback.",
    outputs: freezeOutputs(videoOutputs)
  }),
  defineTool({
    slug: "trim-video",
    name: "Trim Video",
    summary: "Cut a local video to a selected time range.",
    outputs: freezeOutputs(videoOutputs)
  }),
  defineTool({
    slug: "extract-audio",
    name: "Extract Audio",
    summary: "Extract audio to MP3, M4A, or WAV without uploading the file.",
    outputs: freezeOutputs(audioOutputs)
  })
]);

export function getToolBySlug(slug: ToolSlug): ToolDefinition | undefined {
  return toolCatalog.find((tool) => tool.slug === slug);
}
