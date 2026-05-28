# Video Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `video-tools` open-source browser-local video toolkit with a Hybrid homepage, five first-version tool routes, MediaBunny-first planning, FFmpeg.wasm fallback, static deployment configs, and milestone commits.

**Architecture:** The app is a Next.js static-export client app. Media processing is isolated behind pure planning, typed job models, a shared support matrix, and worker-backed engine adapters. The UI derives advertised support from the same matrix the planner uses.

**Tech Stack:** Next.js, React, TypeScript, Vitest, Playwright, MediaBunny, `@mediabunny/mp3-encoder`, FFmpeg.wasm, Web Workers, Vercel, Cloudflare Pages.

---

## File Structure

- Create `package.json`: scripts, dependencies, devDependencies.
- Create `next.config.ts`: `output: 'export'`, static route support.
- Create `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `postcss.config.mjs`.
- Create `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/tools/[slug]/page.tsx`, `src/app/globals.css`.
- Create `src/components/app-shell.tsx`, `src/components/file-dropzone.tsx`, `src/components/tool-card.tsx`, `src/components/tool-runner.tsx`, `src/components/progress-panel.tsx`, `src/components/engine-plan-panel.tsx`.
- Create `src/lib/tools/catalog.ts`, `src/lib/tools/schemas.ts`.
- Create `src/lib/media/jobs.ts`, `src/lib/media/errors.ts`, `src/lib/media/support-matrix.ts`, `src/lib/media/capabilities.ts`, `src/lib/media/engine-planner.ts`, `src/lib/media/media-engine.ts`, `src/lib/media/probe.ts`, `src/lib/media/mediabunny-engine.ts`, `src/lib/media/ffmpeg-wasm-engine.ts`.
- Create `src/workers/media-worker.ts`, `src/workers/ffmpeg-worker.ts`.
- Create `tests/unit/support-matrix.test.ts`, `tests/unit/engine-planner.test.ts`, `tests/unit/catalog.test.ts`, `tests/unit/capabilities.test.ts`.
- Create `tests/e2e/homepage.spec.ts`, `tests/e2e/tool-routes.spec.ts`.
- Create `public/_headers`, `vercel.json`, `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`.

## Task 1: Scaffold Next.js Static App

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `npm run build`

- [ ] **Step 1: Create package manifest**

Write `package.json`:

```json
{
  "name": "video-tools",
  "version": "0.1.0",
  "private": false,
  "license": "MIT",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "@ffmpeg/ffmpeg": "^0.12.15",
    "@ffmpeg/util": "^0.12.2",
    "@mediabunny/mp3-encoder": "^1.21.1",
    "lucide-react": "^0.468.0",
    "mediabunny": "^1.44.2",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and `npm` exits with code `0`.

- [ ] **Step 3: Add static export config**

Write `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
```

- [ ] **Step 4: Add TypeScript config**

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022", "webworker"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Add minimal app shell**

Write `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Tools",
  description: "Open-source browser-local video tools powered by MediaBunny and FFmpeg.wasm."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Write `src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="page-shell">
      <h1>Video Tools</h1>
      <p>Browser-local open-source media tools. Files stay on your device.</p>
    </main>
  );
}
```

Write `src/app/globals.css`:

```css
:root {
  color-scheme: light;
  --bg: #f6f7f9;
  --ink: #15171d;
  --muted: #596273;
  --line: #d9dee7;
  --panel: #ffffff;
  --accent: #0f766e;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page-shell {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0;
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`

Expected: build succeeds and produces `out/`.

- [ ] **Step 7: Commit scaffold**

Run:

```bash
git add package.json package-lock.json next.config.ts tsconfig.json src/app
git commit -m "chore: scaffold next static app"
```

## Task 2: Define Tool Catalog And Support Matrix With Tests

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/media/jobs.ts`
- Create: `src/lib/media/errors.ts`
- Create: `src/lib/media/support-matrix.ts`
- Create: `src/lib/tools/catalog.ts`
- Test: `tests/unit/support-matrix.test.ts`
- Test: `tests/unit/catalog.test.ts`

- [ ] **Step 1: Configure Vitest**

Write `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

- [ ] **Step 2: Write failing support matrix tests**

Write `tests/unit/support-matrix.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getSupportedOutputTuples, isSupportedOutputTuple } from "@/lib/media/support-matrix";

describe("support matrix", () => {
  it("allows implemented MP4 H.264 AAC output", () => {
    expect(isSupportedOutputTuple({ container: "mp4", videoCodec: "avc", audioCodec: "aac" })).toBe(true);
  });

  it("rejects invalid H.264 in WebM output before engine execution", () => {
    expect(isSupportedOutputTuple({ container: "webm", videoCodec: "avc", audioCodec: "opus" })).toBe(false);
  });

  it("exposes the same tuples used by the UI catalog", () => {
    expect(getSupportedOutputTuples()).toContainEqual({
      container: "webm",
      videoCodec: "vp9",
      audioCodec: "opus"
    });
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run: `npm test -- tests/unit/support-matrix.test.ts`

Expected: FAIL because `src/lib/media/support-matrix.ts` does not exist.

- [ ] **Step 4: Implement job and error types**

Write `src/lib/media/jobs.ts`:

```ts
export type ContainerFormat = "mp4" | "webm" | "mov" | "mkv" | "mp3" | "m4a" | "wav";
export type VideoCodec = "avc" | "hevc" | "vp8" | "vp9" | "av1";
export type AudioCodec = "aac" | "opus" | "mp3" | "flac" | "pcm-s16";
export type ToolSlug = "media-info" | "convert-video" | "compress-video" | "trim-video" | "extract-audio";

export type OutputTuple = {
  container: ContainerFormat;
  videoCodec?: VideoCodec;
  audioCodec?: AudioCodec;
};

export type MediaJob =
  | { kind: "probe" }
  | { kind: "transcode"; output: OutputTuple; bitrate?: number; width?: number; height?: number }
  | { kind: "trim"; startSeconds: number; endSeconds: number; output: OutputTuple }
  | { kind: "extract-audio"; output: OutputTuple; bitrate?: number };
```

Write `src/lib/media/errors.ts`:

```ts
export type MediaErrorCode =
  | "UnsupportedContainer"
  | "UnsupportedCodec"
  | "MissingBrowserAPI"
  | "MissingExtension"
  | "FileTooLarge"
  | "DecodeFailed"
  | "EncodeFailed"
  | "OutOfMemory"
  | "AssetLoadFailed"
  | "Aborted";

export type MediaError = {
  code: MediaErrorCode;
  message: string;
  recoverable: boolean;
};
```

- [ ] **Step 5: Implement support matrix**

Write `src/lib/media/support-matrix.ts`:

```ts
import type { OutputTuple } from "./jobs";

const tuples: OutputTuple[] = [
  { container: "mp4", videoCodec: "avc", audioCodec: "aac" },
  { container: "mp4", videoCodec: "hevc", audioCodec: "aac" },
  { container: "webm", videoCodec: "vp8", audioCodec: "opus" },
  { container: "webm", videoCodec: "vp9", audioCodec: "opus" },
  { container: "webm", videoCodec: "av1", audioCodec: "opus" },
  { container: "mov", videoCodec: "avc", audioCodec: "aac" },
  { container: "mkv", videoCodec: "avc", audioCodec: "aac" },
  { container: "mkv", videoCodec: "vp9", audioCodec: "opus" },
  { container: "mp3", audioCodec: "mp3" },
  { container: "m4a", audioCodec: "aac" },
  { container: "wav", audioCodec: "pcm-s16" }
];

export function getSupportedOutputTuples(): OutputTuple[] {
  return tuples.map((tuple) => ({ ...tuple }));
}

export function isSupportedOutputTuple(tuple: OutputTuple): boolean {
  return tuples.some((candidate) =>
    candidate.container === tuple.container &&
    candidate.videoCodec === tuple.videoCodec &&
    candidate.audioCodec === tuple.audioCodec
  );
}
```

- [ ] **Step 6: Write failing catalog consistency tests**

Write `tests/unit/catalog.test.ts`:

```ts
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
```

- [ ] **Step 7: Run catalog test to verify failure**

Run: `npm test -- tests/unit/catalog.test.ts`

Expected: FAIL because `src/lib/tools/catalog.ts` does not exist.

- [ ] **Step 8: Implement catalog**

Write `src/lib/tools/catalog.ts`:

```ts
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
```

- [ ] **Step 9: Run tests to verify pass**

Run: `npm test -- tests/unit/support-matrix.test.ts tests/unit/catalog.test.ts`

Expected: PASS.

- [ ] **Step 10: Commit matrix and catalog**

Run:

```bash
git add vitest.config.ts src/lib/media/jobs.ts src/lib/media/errors.ts src/lib/media/support-matrix.ts src/lib/tools/catalog.ts tests/unit/support-matrix.test.ts tests/unit/catalog.test.ts
git commit -m "feat: add tool catalog and support matrix"
```

## Task 3: Implement Capability Profile And Pure Engine Planner

**Files:**
- Create: `src/lib/media/capabilities.ts`
- Create: `src/lib/media/engine-planner.ts`
- Test: `tests/unit/capabilities.test.ts`
- Test: `tests/unit/engine-planner.test.ts`

- [ ] **Step 1: Write failing capability tests**

Write `tests/unit/capabilities.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canUseThreadedFfmpeg } from "@/lib/media/capabilities";

describe("capabilities", () => {
  it("uses crossOriginIsolated as the threaded FFmpeg signal", () => {
    expect(canUseThreadedFfmpeg({ crossOriginIsolated: true })).toBe(true);
    expect(canUseThreadedFfmpeg({ crossOriginIsolated: false, hasSharedArrayBuffer: true })).toBe(false);
  });
});
```

- [ ] **Step 2: Run capability test to verify failure**

Run: `npm test -- tests/unit/capabilities.test.ts`

Expected: FAIL because `src/lib/media/capabilities.ts` does not exist.

- [ ] **Step 3: Implement capability types**

Write `src/lib/media/capabilities.ts`:

```ts
import type { AudioCodec, VideoCodec } from "./jobs";

export type CodecCapability = Record<string, boolean>;

export type BrowserCapabilityProfile = {
  hasWebCodecs: boolean;
  hasWorker: boolean;
  hasFfmpegAssets: boolean;
  hasMp3Extension: boolean;
  crossOriginIsolated: boolean;
  canEncodeVideo: Partial<Record<VideoCodec, boolean>>;
  canDecodeVideo: Partial<Record<VideoCodec, boolean>>;
  canEncodeAudio: Partial<Record<AudioCodec, boolean>>;
  canDecodeAudio: Partial<Record<AudioCodec, boolean>>;
};

export function canUseThreadedFfmpeg(profile: Pick<BrowserCapabilityProfile, "crossOriginIsolated"> & { hasSharedArrayBuffer?: boolean }): boolean {
  return profile.crossOriginIsolated === true;
}
```

- [ ] **Step 4: Write failing planner tests**

Write `tests/unit/engine-planner.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { planMediaJob } from "@/lib/media/engine-planner";
import type { BrowserCapabilityProfile } from "@/lib/media/capabilities";

const baseProfile: BrowserCapabilityProfile = {
  hasWebCodecs: true,
  hasWorker: true,
  hasFfmpegAssets: true,
  hasMp3Extension: true,
  crossOriginIsolated: true,
  canEncodeVideo: { avc: true, vp9: true },
  canDecodeVideo: { avc: true, vp9: true },
  canEncodeAudio: { aac: true, opus: true, mp3: false },
  canDecodeAudio: { aac: true, opus: true, mp3: true }
};

describe("engine planner", () => {
  it("chooses MediaBunny for supported MP4 transcode", () => {
    const plan = planMediaJob({
      job: { kind: "transcode", output: { container: "mp4", videoCodec: "avc", audioCodec: "aac" } },
      file: { size: 10_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: baseProfile
    });

    expect(plan.engine).toBe("mediabunny");
    expect(plan.reason).toBe("native-supported");
  });

  it("rejects invalid output tuples before engine execution", () => {
    const plan = planMediaJob({
      job: { kind: "transcode", output: { container: "webm", videoCodec: "avc", audioCodec: "opus" } },
      file: { size: 10_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: baseProfile
    });

    expect(plan.engine).toBe("none");
    expect(plan.error?.code).toBe("UnsupportedCodec");
  });

  it("routes MP3 extraction to MediaBunny when mp3 extension is present", () => {
    const plan = planMediaJob({
      job: { kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } },
      file: { size: 8_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: baseProfile
    });

    expect(plan.engine).toBe("mediabunny");
    expect(plan.requiresExtension).toBe("@mediabunny/mp3-encoder");
  });

  it("routes MP3 extraction to FFmpeg when mp3 extension is absent", () => {
    const plan = planMediaJob({
      job: { kind: "extract-audio", output: { container: "mp3", audioCodec: "mp3" } },
      file: { size: 8_000_000, container: "mp4", videoCodec: "avc", audioCodec: "aac" },
      capabilities: { ...baseProfile, hasMp3Extension: false }
    });

    expect(plan.engine).toBe("ffmpeg");
  });
});
```

- [ ] **Step 5: Run planner test to verify failure**

Run: `npm test -- tests/unit/engine-planner.test.ts`

Expected: FAIL because `src/lib/media/engine-planner.ts` does not exist.

- [ ] **Step 6: Implement pure planner**

Write `src/lib/media/engine-planner.ts`:

```ts
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
      return { engine: "mediabunny", reason: "extension-supported", requiresExtension: "@mediabunny/mp3-encoder", memoryRisk: "low" };
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
```

- [ ] **Step 7: Run tests to verify pass**

Run: `npm test -- tests/unit/capabilities.test.ts tests/unit/engine-planner.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit planner**

Run:

```bash
git add src/lib/media/capabilities.ts src/lib/media/engine-planner.ts tests/unit/capabilities.test.ts tests/unit/engine-planner.test.ts
git commit -m "feat: add media engine planner"
```

## Task 4: Build Hybrid Homepage And Static Tool Routes

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/tools/[slug]/page.tsx`
- Create: `src/components/tool-card.tsx`
- Create: `src/components/file-dropzone.tsx`
- Create: `playwright.config.ts`
- Test: `tests/e2e/homepage.spec.ts`
- Test: `tests/e2e/tool-routes.spec.ts`

- [ ] **Step 1: Add Playwright config**

Write `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } }
  ]
});
```

- [ ] **Step 2: Write failing homepage e2e**

Write `tests/e2e/homepage.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("homepage shows hybrid catalog and quick drop zone", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Video Tools" })).toBeVisible();
  await expect(page.getByText("Media Info")).toBeVisible();
  await expect(page.getByText("Drop a video or audio file")).toBeVisible();
  await expect(page.getByText("Files stay on your device")).toBeVisible();
});
```

- [ ] **Step 3: Write failing tool routes e2e**

Write `tests/e2e/tool-routes.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const slugs = ["media-info", "convert-video", "compress-video", "trim-video", "extract-audio"];

for (const slug of slugs) {
  test(`renders ${slug}`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    await expect(page.getByTestId("tool-runner")).toBeVisible();
    await expect(page.getByText("Engine plan")).toBeVisible();
  });
}
```

- [ ] **Step 4: Run e2e to verify failure**

Run: `npm run e2e -- tests/e2e/homepage.spec.ts tests/e2e/tool-routes.spec.ts`

Expected: FAIL because the homepage and tool route UI are not implemented.

- [ ] **Step 5: Implement tool card and drop zone**

Write `src/components/tool-card.tsx`:

```tsx
import Link from "next/link";
import type { ToolDefinition } from "@/lib/tools/catalog";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link className="tool-card" href={`/tools/${tool.slug}`}>
      <span>{tool.name}</span>
      <p>{tool.summary}</p>
    </Link>
  );
}
```

Write `src/components/file-dropzone.tsx`:

```tsx
"use client";

export function FileDropzone({ compact = false }: { compact?: boolean }) {
  return (
    <label className={compact ? "dropzone compact" : "dropzone"}>
      <input type="file" accept="video/*,audio/*" />
      <strong>Drop a video or audio file</strong>
      <span>Files stay on your device.</span>
    </label>
  );
}
```

- [ ] **Step 6: Implement Hybrid homepage**

Replace `src/app/page.tsx`:

```tsx
import { FileDropzone } from "@/components/file-dropzone";
import { ToolCard } from "@/components/tool-card";
import { toolCatalog } from "@/lib/tools/catalog";

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="home-header">
        <h1>Video Tools</h1>
        <p>Open-source browser-local video tools powered by MediaBunny and FFmpeg.wasm.</p>
      </header>
      <section className="hybrid-grid">
        <div className="catalog-grid">
          {toolCatalog.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
        <aside className="quick-panel">
          <FileDropzone />
          <div className="trust-band">Files stay on your device. No upload server is used.</div>
          <div className="engine-status">MediaBunny first. FFmpeg fallback when needed.</div>
        </aside>
      </section>
    </main>
  );
}
```

Append CSS to `src/app/globals.css`:

```css
.home-header {
  margin-bottom: 24px;
}

.home-header h1 {
  margin: 0 0 8px;
  font-size: 36px;
}

.home-header p {
  margin: 0;
  color: var(--muted);
}

.hybrid-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 20px;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.tool-card,
.quick-panel,
.dropzone,
.tool-runner {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
}

.tool-card {
  display: block;
  min-height: 132px;
  padding: 16px;
  color: inherit;
  text-decoration: none;
}

.tool-card span {
  font-weight: 700;
}

.tool-card p,
.dropzone span {
  color: var(--muted);
}

.quick-panel {
  padding: 16px;
}

.dropzone {
  display: grid;
  gap: 8px;
  min-height: 180px;
  place-items: center;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

.dropzone input {
  display: none;
}

.trust-band,
.engine-status {
  margin-top: 12px;
  color: var(--muted);
  font-size: 14px;
}

.tool-runner {
  padding: 16px;
}

@media (max-width: 820px) {
  .hybrid-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 7: Implement static tool route**

Write `src/app/tools/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { FileDropzone } from "@/components/file-dropzone";
import { getToolBySlug, toolCatalog } from "@/lib/tools/catalog";
import type { ToolSlug } from "@/lib/media/jobs";

export function generateStaticParams() {
  return toolCatalog.map((tool) => ({ slug: tool.slug }));
}

export default function ToolPage({ params }: { params: { slug: ToolSlug } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  return (
    <main className="page-shell">
      <section className="tool-runner" data-testid="tool-runner">
        <h1>{tool.name}</h1>
        <p>{tool.summary}</p>
        <FileDropzone compact />
        <section aria-label="Engine plan">
          <h2>Engine plan</h2>
          <p>Drop a file to calculate the MediaBunny or FFmpeg path.</p>
        </section>
      </section>
    </main>
  );
}
```

- [ ] **Step 8: Run e2e to verify pass**

Run: `npm run e2e -- tests/e2e/homepage.spec.ts tests/e2e/tool-routes.spec.ts`

Expected: PASS in Chromium desktop and mobile projects.

- [ ] **Step 9: Commit UI shell**

Run:

```bash
git add src/app src/components tests/e2e playwright.config.ts
git commit -m "feat: add hybrid UI and tool routes"
```

## Task 5: Add Media Engine Interface, Workers, And Cancellation Contract

**Files:**
- Create: `src/lib/media/media-engine.ts`
- Create: `src/workers/media-worker.ts`
- Create: `src/workers/ffmpeg-worker.ts`
- Test: `tests/unit/media-engine.test.ts`

- [ ] **Step 1: Write failing cancellation contract test**

Write `tests/unit/media-engine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createAbortError, isAbortError } from "@/lib/media/media-engine";

describe("media engine contract", () => {
  it("maps cancellation to Aborted", () => {
    const error = createAbortError();
    expect(isAbortError(error)).toBe(true);
    expect(error.code).toBe("Aborted");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- tests/unit/media-engine.test.ts`

Expected: FAIL because `src/lib/media/media-engine.ts` does not exist.

- [ ] **Step 3: Implement engine interface**

Write `src/lib/media/media-engine.ts`:

```ts
import type { MediaError } from "./errors";
import type { MediaJob } from "./jobs";

export type MediaProgress = {
  phase: "loading" | "probing" | "processing" | "finalizing";
  percent?: number;
  message: string;
};

export type EngineRunOptions = {
  signal: AbortSignal;
  onProgress?: (progress: MediaProgress) => void;
};

export type EngineResult = {
  blob: Blob;
  fileName: string;
  mimeType: string;
};

export interface MediaEngine {
  probe(file: File, options: EngineRunOptions): Promise<Record<string, unknown>>;
  transcode(file: File, job: Extract<MediaJob, { kind: "transcode" }>, options: EngineRunOptions): Promise<EngineResult>;
  trim(file: File, job: Extract<MediaJob, { kind: "trim" }>, options: EngineRunOptions): Promise<EngineResult>;
  extractAudio(file: File, job: Extract<MediaJob, { kind: "extract-audio" }>, options: EngineRunOptions): Promise<EngineResult>;
}

export function createAbortError(): MediaError {
  return { code: "Aborted", message: "The media job was cancelled.", recoverable: true };
}

export function isAbortError(error: unknown): error is MediaError {
  return typeof error === "object" && error !== null && "code" in error && error.code === "Aborted";
}
```

- [ ] **Step 4: Add worker skeletons**

Write `src/workers/media-worker.ts`:

```ts
export type MediaWorkerRequest = {
  id: string;
  action: "probe" | "transcode" | "trim" | "extract-audio" | "cancel";
};

self.addEventListener("message", (event: MessageEvent<MediaWorkerRequest>) => {
  if (event.data.action === "cancel") {
    self.postMessage({ id: event.data.id, type: "cancelled" });
  }
});
```

Write `src/workers/ffmpeg-worker.ts`:

```ts
export type FfmpegWorkerRequest = {
  id: string;
  action: "load" | "run" | "cancel";
};

self.addEventListener("message", (event: MessageEvent<FfmpegWorkerRequest>) => {
  if (event.data.action === "cancel") {
    self.postMessage({ id: event.data.id, type: "cancelled" });
  }
});
```

- [ ] **Step 5: Run tests**

Run: `npm test -- tests/unit/media-engine.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit engine contract**

Run:

```bash
git add src/lib/media/media-engine.ts src/workers tests/unit/media-engine.test.ts
git commit -m "feat: add media engine worker contract"
```

## Task 6: Implement MediaBunny Engine First Paths

**Files:**
- Create: `src/lib/media/mediabunny-engine.ts`
- Modify: `src/lib/media/capabilities.ts`
- Test: `tests/unit/mediabunny-engine.test.ts`

- [ ] **Step 1: Write failing MediaBunny registration test**

Write `tests/unit/mediabunny-engine.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createMediabunnyEngine } from "@/lib/media/mediabunny-engine";

describe("mediabunny engine", () => {
  it("registers mp3 extension only when mp3 output is requested", async () => {
    const registerMp3Encoder = vi.fn();
    const engine = createMediabunnyEngine({ registerMp3Encoder });
    await engine.prepareForOutput({ container: "mp3", audioCodec: "mp3" });
    expect(registerMp3Encoder).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- tests/unit/mediabunny-engine.test.ts`

Expected: FAIL because `src/lib/media/mediabunny-engine.ts` does not exist.

- [ ] **Step 3: Implement testable MediaBunny adapter boundary**

Write `src/lib/media/mediabunny-engine.ts`:

```ts
import type { OutputTuple } from "./jobs";

type MediabunnyDeps = {
  registerMp3Encoder: () => void;
};

export function createMediabunnyEngine(deps: MediabunnyDeps) {
  let mp3Registered = false;

  return {
    async prepareForOutput(output: OutputTuple) {
      if (output.audioCodec === "mp3" && !mp3Registered) {
        deps.registerMp3Encoder();
        mp3Registered = true;
      }
    }
  };
}
```

- [ ] **Step 4: Add real implementation note in code**

Extend `src/lib/media/mediabunny-engine.ts` with imports only after the test passes:

```ts
export async function createDefaultMediabunnyEngine() {
  const [{ registerMp3Encoder }] = await Promise.all([
    import("@mediabunny/mp3-encoder")
  ]);
  return createMediabunnyEngine({ registerMp3Encoder });
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- tests/unit/mediabunny-engine.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit MediaBunny adapter**

Run:

```bash
git add src/lib/media/mediabunny-engine.ts tests/unit/mediabunny-engine.test.ts
git commit -m "feat: add mediabunny engine adapter"
```

## Task 7: Implement FFmpeg Fallback Asset And Worker Planning

**Files:**
- Create: `src/lib/media/ffmpeg-wasm-engine.ts`
- Modify: `src/lib/media/capabilities.ts`
- Test: `tests/unit/ffmpeg-wasm-engine.test.ts`

- [ ] **Step 1: Write failing FFmpeg asset test**

Write `tests/unit/ffmpeg-wasm-engine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getFfmpegAssetPaths } from "@/lib/media/ffmpeg-wasm-engine";

describe("ffmpeg wasm engine", () => {
  it("uses same-origin asset paths", () => {
    expect(getFfmpegAssetPaths()).toEqual({
      coreURL: "/ffmpeg/ffmpeg-core.js",
      wasmURL: "/ffmpeg/ffmpeg-core.wasm",
      workerURL: "/ffmpeg/ffmpeg-core.worker.js"
    });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- tests/unit/ffmpeg-wasm-engine.test.ts`

Expected: FAIL because `src/lib/media/ffmpeg-wasm-engine.ts` does not exist.

- [ ] **Step 3: Implement FFmpeg asset path helper**

Write `src/lib/media/ffmpeg-wasm-engine.ts`:

```ts
export type FfmpegAssetPaths = {
  coreURL: string;
  wasmURL: string;
  workerURL: string;
};

export function getFfmpegAssetPaths(): FfmpegAssetPaths {
  return {
    coreURL: "/ffmpeg/ffmpeg-core.js",
    wasmURL: "/ffmpeg/ffmpeg-core.wasm",
    workerURL: "/ffmpeg/ffmpeg-core.worker.js"
  };
}
```

- [ ] **Step 4: Add public asset directory marker**

Create `public/ffmpeg/.gitkeep` as an empty file. The README task will document copying FFmpeg core assets into this folder.

- [ ] **Step 5: Run test**

Run: `npm test -- tests/unit/ffmpeg-wasm-engine.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit FFmpeg fallback foundation**

Run:

```bash
git add src/lib/media/ffmpeg-wasm-engine.ts public/ffmpeg/.gitkeep tests/unit/ffmpeg-wasm-engine.test.ts
git commit -m "feat: add ffmpeg fallback asset planning"
```

## Task 8: Wire Tool Runner UI To Planner

**Files:**
- Create: `src/components/tool-runner.tsx`
- Create: `src/components/engine-plan-panel.tsx`
- Create: `src/components/progress-panel.tsx`
- Modify: `src/app/tools/[slug]/page.tsx`
- Test: `tests/e2e/tool-routes.spec.ts`

- [ ] **Step 1: Extend e2e test for planner UI**

Modify `tests/e2e/tool-routes.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const slugs = ["media-info", "convert-video", "compress-video", "trim-video", "extract-audio"];

for (const slug of slugs) {
  test(`renders ${slug}`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    await expect(page.getByTestId("tool-runner")).toBeVisible();
    await expect(page.getByText("Engine plan")).toBeVisible();
    await expect(page.getByText("Drop a file to calculate the local processing path.")).toBeVisible();
  });
}
```

- [ ] **Step 2: Run e2e to verify failure**

Run: `npm run e2e -- tests/e2e/tool-routes.spec.ts`

Expected: FAIL because current copy does not match the planned runner component.

- [ ] **Step 3: Implement panels**

Write `src/components/engine-plan-panel.tsx`:

```tsx
export function EnginePlanPanel() {
  return (
    <section className="engine-plan-panel" aria-label="Engine plan">
      <h2>Engine plan</h2>
      <p>Drop a file to calculate the local processing path.</p>
    </section>
  );
}
```

Write `src/components/progress-panel.tsx`:

```tsx
export function ProgressPanel() {
  return (
    <section className="progress-panel" aria-label="Progress">
      <h2>Progress</h2>
      <p>No job running.</p>
    </section>
  );
}
```

Write `src/components/tool-runner.tsx`:

```tsx
import { EnginePlanPanel } from "./engine-plan-panel";
import { FileDropzone } from "./file-dropzone";
import { ProgressPanel } from "./progress-panel";
import type { ToolDefinition } from "@/lib/tools/catalog";

export function ToolRunner({ tool }: { tool: ToolDefinition }) {
  return (
    <section className="tool-runner" data-testid="tool-runner">
      <h1>{tool.name}</h1>
      <p>{tool.summary}</p>
      <FileDropzone compact />
      <EnginePlanPanel />
      <ProgressPanel />
    </section>
  );
}
```

- [ ] **Step 4: Use ToolRunner in route**

Modify `src/app/tools/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { ToolRunner } from "@/components/tool-runner";
import { getToolBySlug, toolCatalog } from "@/lib/tools/catalog";
import type { ToolSlug } from "@/lib/media/jobs";

export function generateStaticParams() {
  return toolCatalog.map((tool) => ({ slug: tool.slug }));
}

export default function ToolPage({ params }: { params: { slug: ToolSlug } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();
  return (
    <main className="page-shell">
      <ToolRunner tool={tool} />
    </main>
  );
}
```

- [ ] **Step 5: Run e2e to verify pass**

Run: `npm run e2e -- tests/e2e/tool-routes.spec.ts`

Expected: PASS.

- [ ] **Step 6: Commit runner UI**

Run:

```bash
git add src/components src/app/tools/[slug]/page.tsx tests/e2e/tool-routes.spec.ts
git commit -m "feat: wire tool runner planner UI"
```

## Task 9: Add Deployment Configs And Third-Party Notices

**Files:**
- Create: `vercel.json`
- Create: `public/_headers`
- Create: `README.md`
- Create: `LICENSE`
- Create: `THIRD_PARTY_NOTICES.md`
- Test: `tests/unit/deploy-config.test.ts`

- [ ] **Step 1: Write failing deploy config test**

Write `tests/unit/deploy-config.test.ts`:

```ts
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
```

- [ ] **Step 2: Run deploy config test to verify failure**

Run: `npm test -- tests/unit/deploy-config.test.ts`

Expected: FAIL because `vercel.json` and `public/_headers` do not exist.

- [ ] **Step 3: Add Vercel headers**

Write `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

- [ ] **Step 4: Add Cloudflare Pages headers**

Write `public/_headers`:

```text
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

- [ ] **Step 5: Add README and notices**

Write `README.md`:

```md
# video-tools

Open-source browser-local video tools powered by MediaBunny and FFmpeg.wasm.

## Privacy

Files are processed in the browser. This project does not upload media to a processing backend.

## Deploy

Use Vercel or Cloudflare Pages so COOP/COEP headers can be set. With `output: 'export'`, Next.js `headers()` in `next.config.ts` is not used for static output; use `vercel.json` or `public/_headers`.

FFmpeg core assets should be served from `/ffmpeg/` on the same origin.

## Third-party components

See `THIRD_PARTY_NOTICES.md`.
```

Write `THIRD_PARTY_NOTICES.md`:

```md
# Third-Party Notices

## MediaBunny

MediaBunny is licensed under MPL-2.0.

## @mediabunny/mp3-encoder and LAME

`@mediabunny/mp3-encoder` uses an MPL-2.0 wrapper and includes a WASM build of the LAME MP3 encoder. LAME is LGPL-licensed. Credit: LAME MP3 Encoder, https://lame.sourceforge.io/

## FFmpeg / FFmpeg.wasm

The JavaScript wrapper for FFmpeg.wasm may be MIT-licensed, while FFmpeg core builds carry FFmpeg and linked-library licenses. This project should use an LGPL-compatible FFmpeg core build unless a GPL build is explicitly selected and documented.
```

Write `LICENSE`:

```text
MIT License

Copyright (c) 2026 JackyH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 6: Run deploy config test**

Run: `npm test -- tests/unit/deploy-config.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit deployment docs**

Run:

```bash
git add vercel.json public/_headers README.md LICENSE THIRD_PARTY_NOTICES.md tests/unit/deploy-config.test.ts
git commit -m "docs: add deployment and license notices"
```

## Task 10: Create Public GitHub Repo And Push Milestones

**Files:**
- Modify: git remote config only

- [ ] **Step 1: Check available GitHub creation path**

Run: `Get-Command gh -ErrorAction SilentlyContinue`

Expected: If `gh` exists, use the CLI path. If it does not exist, use the authenticated GitHub browser/API path with user confirmation before creating the public repository.

- [ ] **Step 2A: Create repo with GitHub CLI when available**

Run:

```bash
gh repo create video-tools --public --source . --remote origin --push
```

Expected: GitHub creates `video-tools`, adds `origin`, and pushes `master` or `main`.

- [ ] **Step 2B: Create repo without GitHub CLI when unavailable**

Use GitHub's authenticated UI or available GitHub API tooling to create a public repository named `video-tools` under the account `JackyH`. Before clicking the create button or sending the API request, confirm the external action with the user because it creates a public resource.

After creation, run:

```bash
git remote add origin https://github.com/JackyH/video-tools.git
git push -u origin master
```

Expected: `origin` is set and all milestone commits are pushed.

- [ ] **Step 3: Verify remote**

Run:

```bash
git remote -v
git status --short
```

Expected: `origin` points to the public GitHub repo and status is clean.
