import { describe, expect, it } from "vitest";
import { getSupportedOutputTuples } from "@/lib/media/support-matrix";
import { toolCatalog } from "@/lib/tools/catalog";

describe("tool catalog", () => {
  it("contains the five launch tools", () => {
    expect(toolCatalog.map((tool) => tool.slug)).toEqual([
      "media-info",
      "convert-video",
      "compress-video",
      "trim-video",
      "extract-audio"
    ]);
  });

  it("derives advertised outputs from the support matrix", () => {
    const matrix = getSupportedOutputTuples();
    for (const tool of toolCatalog) {
      for (const output of tool.outputs) {
        expect(matrix).toContainEqual(output);
      }
    }
  });
});
