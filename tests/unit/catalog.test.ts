import { describe, expect, it } from "vitest";
import { getSupportedOutputTuples } from "@/lib/media/support-matrix";
import { toolCatalog } from "@/lib/tools/catalog";
import type { OutputTuple } from "@/lib/media/jobs";

describe("tool catalog", () => {
  it("contains all ten tools in order", () => {
    expect(toolCatalog.map((tool) => tool.slug)).toEqual([
      "media-info",
      "convert-video",
      "compress-video",
      "trim-video",
      "extract-audio",
      "mute-video",
      "rotate-video",
      "resize-video",
      "reverse-video",
      "crop-video"
    ]);
  });

  it("partitions advertised outputs by tool capability", () => {
    const matrix = getSupportedOutputTuples();
    const videoOutputs = matrix.filter((output) => output.videoCodec);
    const audioOutputs = matrix.filter((output) => !output.videoCodec);

    expect(toolCatalog.find((tool) => tool.slug === "media-info")?.outputs).toEqual([]);
    expect(toolCatalog.find((tool) => tool.slug === "convert-video")?.outputs).toEqual(videoOutputs);
    expect(toolCatalog.find((tool) => tool.slug === "compress-video")?.outputs).toEqual(videoOutputs);
    expect(toolCatalog.find((tool) => tool.slug === "trim-video")?.outputs).toEqual(videoOutputs);
    expect(toolCatalog.find((tool) => tool.slug === "extract-audio")?.outputs).toEqual(audioOutputs);
    expect(toolCatalog.find((tool) => tool.slug === "mute-video")?.outputs).toEqual(videoOutputs);
    expect(toolCatalog.find((tool) => tool.slug === "rotate-video")?.outputs).toEqual(videoOutputs);
    expect(toolCatalog.find((tool) => tool.slug === "resize-video")?.outputs).toEqual(videoOutputs);
    expect(toolCatalog.find((tool) => tool.slug === "reverse-video")?.outputs).toEqual(videoOutputs);
    expect(toolCatalog.find((tool) => tool.slug === "crop-video")?.outputs).toEqual(videoOutputs);
  });

  it("prevents consumers from mutating catalog outputs", () => {
    expect(Object.isFrozen(toolCatalog)).toBe(true);

    for (const tool of toolCatalog) {
      expect(Object.isFrozen(tool)).toBe(true);
      expect(Object.isFrozen(tool.outputs)).toBe(true);

      for (const output of tool.outputs) {
        expect(Object.isFrozen(output)).toBe(true);
      }
    }

    const convertVideo = toolCatalog.find((tool) => tool.slug === "convert-video");
    const mutableOutputs = convertVideo?.outputs as unknown as OutputTuple[];

    expect(() => {
      mutableOutputs.push({ container: "webm", videoCodec: "avc", audioCodec: "opus" });
    }).toThrow(TypeError);
  });
});
