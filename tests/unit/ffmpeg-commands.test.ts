import { describe, expect, it } from "vitest";
import { buildFfmpegArgs, buildOutputFileName, getContainerExt, getContainerMime } from "@/lib/media/ffmpeg-commands";

describe("ffmpeg commands", () => {
  it("builds transcode args for mp4 avc/aac", () => {
    const cmd = buildFfmpegArgs({ kind: "transcode", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } });
    expect(cmd.outputName).toBe("output.mp4");
    expect(cmd.mimeType).toBe("video/mp4");
    expect(cmd.args).toContain("libx264");
    expect(cmd.args).toContain("aac");
  });

  it("includes scale filter when width and height are set on transcode", () => {
    const cmd = buildFfmpegArgs({ kind: "transcode", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" }, width: 1280, height: 720 });
    expect(cmd.args).toContain("scale=1280:720");
  });

  it("builds trim args with ss and to flags", () => {
    const cmd = buildFfmpegArgs({ kind: "trim", startSeconds: 5, endSeconds: 20, output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } });
    const ssIdx = cmd.args.indexOf("-ss");
    expect(ssIdx).toBeGreaterThan(-1);
    expect(cmd.args[ssIdx + 1]).toBe("5");
    expect(cmd.args[cmd.args.indexOf("-to") + 1]).toBe("20");
  });

  it("builds extract-audio args with -vn", () => {
    const cmd = buildFfmpegArgs({ kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } });
    expect(cmd.args[0]).toBe("-vn");
    expect(cmd.outputName).toBe("output.mp3");
    expect(cmd.mimeType).toBe("audio/mpeg");
  });

  it("builds mute args with -an", () => {
    const cmd = buildFfmpegArgs({ kind: "mute", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } });
    expect(cmd.args[0]).toBe("-an");
    expect(cmd.args).toContain("libx264");
  });

  it("builds rotate 90 args with transpose=1", () => {
    const cmd = buildFfmpegArgs({ kind: "rotate", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" }, degrees: 90 });
    expect(cmd.args).toContain("transpose=1");
  });

  it("builds rotate 180 args with vflip,hflip", () => {
    const cmd = buildFfmpegArgs({ kind: "rotate", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" }, degrees: 180 });
    const vfIdx = cmd.args.indexOf("-vf");
    expect(cmd.args[vfIdx + 1]).toBe("vflip,hflip");
  });

  it("builds resize args with scale filter", () => {
    const cmd = buildFfmpegArgs({ kind: "resize", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" }, width: 640, height: 480 });
    expect(cmd.args).toContain("scale=640:480");
  });

  it("builds reverse args with reverse and areverse filters", () => {
    const cmd = buildFfmpegArgs({ kind: "reverse", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } });
    expect(cmd.args).toContain("reverse");
    expect(cmd.args).toContain("areverse");
  });

  it("builds crop args with crop filter", () => {
    const cmd = buildFfmpegArgs({ kind: "crop", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" }, x: 10, y: 20, width: 640, height: 360 });
    expect(cmd.args).toContain("crop=640:360:10:20");
  });

  it("buildOutputFileName appends the right suffix and extension", () => {
    expect(buildOutputFileName("video.mp4", { kind: "transcode", output: { container: "webm", videoCodec: "vp9", audioCodec: "opus" } })).toBe("video-converted.webm");
    expect(buildOutputFileName("clip.mov", { kind: "trim", startSeconds: 0, endSeconds: 5, output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } })).toBe("clip-trimmed.mp4");
    expect(buildOutputFileName("video.mp4", { kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } })).toBe("video-audio.mp3");
    expect(buildOutputFileName("video.mp4", { kind: "mute", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } })).toBe("video-muted.mp4");
    expect(buildOutputFileName("video.mp4", { kind: "reverse", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } })).toBe("video-reversed.mp4");
  });

  it("getContainerExt and getContainerMime return correct values", () => {
    expect(getContainerExt("mp4")).toBe("mp4");
    expect(getContainerExt("mp3")).toBe("mp3");
    expect(getContainerMime("mp4")).toBe("video/mp4");
    expect(getContainerMime("mp3")).toBe("audio/mpeg");
    expect(getContainerMime("wav")).toBe("audio/wav");
  });
});
