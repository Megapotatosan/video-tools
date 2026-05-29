import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("deployment config", () => {
  it("sets cross-origin isolation in vercel.json and Cloudflare _headers", () => {
    const vercel = readFileSync("vercel.json", "utf8");
    const headers = readFileSync("public/_headers", "utf8");

    expect(vercel).toContain("Cross-Origin-Opener-Policy");
    expect(vercel).toContain("Cross-Origin-Embedder-Policy");
    expect(headers).toContain("Cross-Origin-Opener-Policy: same-origin");
    expect(headers).toContain("Cross-Origin-Embedder-Policy: require-corp");
  });
});
