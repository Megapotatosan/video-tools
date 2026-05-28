# Video Tools OSS Design

Date: 2026-05-28
Repo name: `video-tools`

## Goal

Build an original open-source browser-local video toolkit that can be hosted on Vercel or Cloudflare Pages. The project is informed by public information from `tools.video`, but it must not copy proprietary source code, UI, or product text. The repo will implement free local media tools only; Subway-related paid tools are out of scope.

The first version should be useful, deployable, and easy to extend. It should not attempt to recreate every listed tool at once.

## Public Source Notes

`tools.video` publicly presents itself as a collection of free browser-based media tools where files stay local to the user's browser, and it states that the tooling is powered by MediaBunny and FFmpeg.wasm.

MediaBunny's documentation describes a TypeScript library for reading, writing, and converting media in the browser, using browser-native APIs such as WebCodecs where available. Its documented format and codec support makes it a good primary engine for fast browser-native paths, with FFmpeg.wasm retained for broader compatibility.

References:

- https://tools.video/
- https://mediabunny.dev/guide/introduction
- https://mediabunny.dev/guide/supported-formats-and-codecs

## Product Scope

The first release will include these working tools:

1. Media Info
2. Convert Video
3. Compress Video
4. Trim Video
5. Extract Audio

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

Use Next.js with TypeScript. Media work happens client-side only. The app should be deployable as a static or mostly static site where possible.

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
  engine-planner.ts
  media-engine.ts
  mediabunny-engine.ts
  ffmpeg-wasm-engine.ts
  probe.ts
  jobs.ts
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
- `convert(job)`
- `compress(job)`
- `trim(job)`
- `extractAudio(job)`
- progress events
- structured errors
- support checks

### Engine Planning

`enginePlanner` chooses the best engine for each job.

Priority:

1. MediaBunny fast path when the requested operation, input container, output container, codec, and browser APIs are supported.
2. FFmpeg.wasm compatibility path when MediaBunny or WebCodecs cannot handle the job.
3. Block with a clear unsupported message when neither path is practical.

The planner must be testable without running the heavy media engines. It should accept a normalized file profile, requested job, and browser capability profile, then return a plain engine plan.

### Privacy Model

Files must not be uploaded. The app should not include a media-processing backend. Server code may serve static assets, headers, and framework output only.

Use browser `File`, `Blob`, and object URLs for input/output. Any persistent storage must be opt-in and local.

## Deployment

Include Vercel and Cloudflare Pages setup.

Deployment config must document or provide headers for cross-origin isolation:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These headers are needed for browser features such as SharedArrayBuffer, which can affect FFmpeg.wasm threaded builds and performance. The app should still degrade gracefully where those features are unavailable.

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

## Testing Strategy

Implementation should follow TDD for behavior-bearing code.

Unit tests:

- tool catalog and schemas
- engine planner decisions
- support/capability normalization
- job planning
- error mapping

Browser tests:

- homepage renders catalog and quick drop zone
- tool route renders by slug
- file drop enters metadata/probe state
- engine plan is displayed
- settings validation blocks invalid jobs
- output flow reaches downloadable result for small fixtures

Manual verification:

- run local dev server
- verify desktop and mobile layouts
- test at least one small video fixture per implemented tool
- verify Vercel/Cloudflare config files exist

## Risks And Constraints

Large media files can exceed browser memory limits, especially in FFmpeg.wasm. The first version should show file-size guidance and fail cleanly.

MediaBunny and WebCodecs support varies by browser and codec. The planner must explain fallback reasons instead of hiding them.

FFmpeg.wasm assets are large. Loading should be lazy and only happen when a job needs the fallback engine.

The project should avoid over-promising support. Tool pages should show supported formats based on real implemented paths.

## Acceptance Criteria

The first implementation is complete when:

- `video-tools` runs locally.
- The homepage uses the Hybrid layout.
- The five first-version tools exist as routes.
- Media Info works through MediaBunny where supported.
- Convert, Compress, Trim, and Extract Audio have working first paths and clear fallback/error states.
- Engine planner tests pass.
- Browser smoke tests pass.
- Vercel and Cloudflare deployment instructions/configs are present.
- The code is committed in meaningful milestones and ready to push to the public `video-tools` GitHub repo.
