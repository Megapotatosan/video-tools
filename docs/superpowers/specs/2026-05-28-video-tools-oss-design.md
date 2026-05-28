# Video Tools OSS Design

Date: 2026-05-28
Repo name: `video-tools`

## Goal

Build an original open-source browser-local video toolkit that can be hosted on Vercel or Cloudflare Pages. The project is informed by public information from `tools.video`, but it must not copy proprietary source code, UI, or product text. The repo will implement free local media tools only; Subway-related paid tools are out of scope.

The first version should be useful, deployable, and easy to extend. It should not attempt to recreate every listed tool at once.

## Public Source Notes

`tools.video` publicly presents itself as a collection of free browser-based media tools where files stay local to the user's browser, and it states that the tooling is powered by MediaBunny and FFmpeg.wasm.

MediaBunny's documentation describes a TypeScript library for reading, writing, and converting media in the browser, using browser-native APIs such as WebCodecs where available. Its Conversion API covers conversion, resizing, audio resampling, track dropping, and trimming. Its documented format and codec support makes it a good primary engine for browser-native and memory-efficient paths, with FFmpeg.wasm retained for broader compatibility.

References:

- https://tools.video/
- https://mediabunny.dev/guide/introduction
- https://mediabunny.dev/guide/supported-formats-and-codecs
- https://mediabunny.dev/api/Conversion
- https://mediabunny.dev/guide/extensions/mp3-encoder
- https://developer.mozilla.org/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy
- https://developers.cloudflare.com/pages/configuration/headers/
- https://vercel.com/docs/projects/project-configuration
- https://www.ffmpeg.org/legal.html

## Product Scope

The first release will include these working tools:

1. Media Info
2. Convert Video
3. Compress Video
4. Trim Video
5. Extract Audio

Tool-specific scope:

- Convert Video and Compress Video are separate UX tools that both build `transcode` jobs. Convert emphasizes output container/codec choices. Compress emphasizes bitrate target, optional downscale, and estimated size.
- Compress v1 uses MediaBunny for bitrate-target and downscale workflows where the browser can encode the requested codec. It does not promise CRF, two-pass, or quality-target compression in the MediaBunny path; those are FFmpeg compatibility-path features.
- Extract Audio supports MP3 as a first-class output. MP3 on the MediaBunny path requires the `@mediabunny/mp3-encoder` extension. If that extension is unavailable or unsuitable for the current browser/job, MP3 routes to FFmpeg.wasm. AAC/M4A and Opus/WebM can use native MediaBunny/WebCodecs paths where supported.

Every tool uses a shared workflow:

1. Pick or drop a local media file.
2. Probe the file and show metadata.
3. Select an engine path automatically, with visible status.
4. Configure tool-specific settings.
5. Run the job with progress feedback.
6. Preview or download the output.
7. Show actionable errors and fallback choices when a browser or codec is unsupported.

## UI Design

Use the approved Hybrid layout from `docs/brainstorm-ui-layout-options.html`.

The homepage contains:

- A dense tool catalog for discovery.
- A quick drop zone for users who already have a file.
- A privacy/status band explaining browser-local processing.
- Engine capability status for MediaBunny, WebCodecs, SharedArrayBuffer, and FFmpeg.wasm fallback readiness.

Each tool page contains:

- Header with tool name, short purpose, and supported output formats.
- File drop zone.
- Media metadata panel.
- Tool settings form.
- Engine plan panel showing MediaBunny fast path or FFmpeg compatibility path.
- Progress panel.
- Output preview/download area.

The UI should feel like a practical utility app, not a marketing landing page. Use compact information hierarchy, restrained colors, stable tool controls, and clear status states.

## Architecture

Use Next.js with TypeScript and `output: 'export'` where practical. Media work happens client-side only. Dynamic tool routes must use `generateStaticParams` so the known tool pages pre-render for static deployment.

Core modules:

```text
src/app
  page.tsx
  tools/[slug]/page.tsx
src/components
  app-shell
  file-dropzone
  tool-runner
  progress-panel
src/lib/media
  capabilities.ts
  engine-planner.ts
  media-engine.ts
  mediabunny-engine.ts
  ffmpeg-wasm-engine.ts
  support-matrix.ts
  probe.ts
  jobs.ts
src/workers
  media-worker.ts
  ffmpeg-worker.ts
src/lib/tools
  catalog.ts
  schemas.ts
src/lib/deploy
  headers.ts
tests
  unit
  e2e
```

### Media Engine Boundary

Define a `MediaEngine` interface that hides engine-specific details from UI components.

Expected capabilities:

- `probe(file)`
- `transcode(job, options)`
- `trim(job, options)`
- `extractAudio(job, options)`
- progress events
- structured errors
- support checks

`Convert Video` and `Compress Video` are tool presets that construct different `transcode` job parameters. They should not become separate engine-level methods.

Every long-running engine operation accepts an `AbortSignal`. Cancellation must map to a structured `Aborted` error. FFmpeg cancellation may terminate and recreate the worker; MediaBunny cancellation should use its cancellation support where available.

Run heavy media work in Web Workers. UI components must not call FFmpeg.wasm or long MediaBunny conversions directly on the main thread.

### Engine Planning

`enginePlanner` chooses the best engine for each job.

Priority:

1. MediaBunny fast path when the requested operation, input container, output container, codec, and browser APIs are supported.
2. FFmpeg.wasm compatibility path when MediaBunny or WebCodecs cannot handle the job.
3. Block with a clear unsupported message when neither path is practical.

The planner must be testable without running the heavy media engines. It should accept a normalized file profile, requested job, and browser capability profile, then return a plain engine plan.

Capability detection is asynchronous and must happen before calling the pure planner. The resolved capability profile should include per-codec encode/decode support, not only broad API flags such as `VideoEncoder` or `AudioEncoder`. Use MediaBunny codec utilities such as `canEncode`, `canEncodeVideo`, `canEncodeAudio`, and track-level decode checks where applicable.

The same support matrix must feed both `enginePlanner` and the UI catalog. Tool pages should derive displayed input/output support from implemented engine paths so the catalog cannot advertise formats that the planner rejects.

Structured planner and runtime errors:

- `UnsupportedContainer`
- `UnsupportedCodec`
- `MissingBrowserAPI`
- `MissingExtension`
- `FileTooLarge`
- `DecodeFailed`
- `EncodeFailed`
- `OutOfMemory`
- `AssetLoadFailed`
- `Aborted`

### Privacy Model

Files must not be uploaded. The app should not include a media-processing backend. Server code may serve static assets, headers, and framework output only.

Use browser `File`, `Blob`, and object URLs for input/output. Any persistent storage must be opt-in and local.

## Deployment

Include concrete Vercel and Cloudflare Pages setup.

Deployment config must document or provide headers for cross-origin isolation:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

Vercel must use `vercel.json` `headers`. Cloudflare Pages must use a `_headers` file in `public/` or the final output directory. Arbitrary static hosts that cannot set response headers are not a first-release target.

These headers are needed for browser features such as SharedArrayBuffer, which can affect FFmpeg.wasm threaded builds and performance. Single-threaded FFmpeg.wasm should remain a graceful fallback when cross-origin isolation is unavailable.

With `COEP: require-corp`, cross-origin subresources can fail unless they explicitly permit embedding through CORS/CORP. Self-host FFmpeg core assets and worker assets from this app's origin instead of loading them from a CDN by default. Fonts, scripts, WASM, and worker files must be audited under cross-origin isolation.

## GitHub And Release Workflow

Create a public GitHub repository named `video-tools`.

Important milestones must be committed separately:

- design spec
- project scaffold
- media engine interface and planner
- MediaBunny engine implementation
- FFmpeg.wasm fallback implementation
- each completed tool
- deployment config
- README/license/release polish

When a remote is available, push milestone commits to GitHub. The initial license should be open-source; MIT is the default unless the owner chooses another license.

License notes:

- MediaBunny and `@mediabunny/mp3-encoder` are MPL-2.0 dependencies. Do not modify and redistribute their source without preserving MPL-2.0 obligations.
- The JavaScript wrapper package for FFmpeg.wasm may be MIT, but FFmpeg core builds carry FFmpeg and linked-library licenses. Prefer an LGPL-compatible FFmpeg core build unless a GPL build is explicitly chosen, and document the FFmpeg component license in the README.

## Testing Strategy

Implementation should follow TDD for behavior-bearing code.

Unit tests:

- tool catalog and schemas
- engine planner decisions
- support/capability normalization
- support matrix to UI catalog consistency
- job planning
- error mapping
- cancellation behavior at the engine boundary

Browser tests:

- homepage renders catalog and quick drop zone
- tool route renders by slug
- file drop enters metadata/probe state
- engine plan is displayed
- settings validation blocks invalid jobs
- output flow reaches downloadable result for small fixtures
- routes generated for all known tool slugs

Use tiny fixtures. Headless browser codec support can vary, so MediaBunny/WebCodecs tests should assert planner/UI behavior against mocked capability profiles where possible. Full output e2e tests should include at least one deterministic FFmpeg path.

Manual verification:

- run local dev server
- verify desktop and mobile layouts
- test at least one small video fixture per implemented tool
- verify Vercel/Cloudflare config files exist

## Risks And Constraints

Large media files can exceed browser memory limits, especially in FFmpeg.wasm. File-size guidance must be path-aware: MediaBunny streaming paths can tolerate larger files than FFmpeg.wasm heap-based paths. The UI should warn when the chosen plan is likely to exceed memory, and fail cleanly.

MediaBunny and WebCodecs support varies by browser and codec. The planner must explain fallback reasons instead of hiding them.

FFmpeg.wasm assets are large. Loading should be lazy and only happen when a job needs the fallback engine. Assets should be self-hosted to avoid COEP/CORP failures.

The project should avoid over-promising support. Tool pages should show supported formats based on real implemented paths.

## Acceptance Criteria

The first implementation is complete when:

- `video-tools` runs locally.
- The homepage uses the Hybrid layout.
- The five first-version tools exist as routes.
- Media Info works through MediaBunny where supported.
- Convert, Compress, Trim, and Extract Audio have working first paths and clear fallback/error states.
- Extract Audio can produce MP3 through `@mediabunny/mp3-encoder` or FFmpeg.wasm fallback, and the UI makes the chosen path explicit.
- Compress v1 documents bitrate-target/downscale MediaBunny support and FFmpeg-only advanced compression modes.
- Engine planner tests pass.
- Capability probing is async, per-codec, and feeds a pure planner.
- Media processing runs in workers and supports cancellation.
- Browser smoke tests pass.
- Vercel and Cloudflare deployment instructions/configs are present, including self-hosted FFmpeg assets and cross-origin isolation headers.
- The code is committed in meaningful milestones and ready to push to the public `video-tools` GitHub repo.
