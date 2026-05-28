# video-tools

Open-source browser-local video tools, designed for static hosting on Vercel or Cloudflare Pages.

This project is an original implementation informed by the public feature direction of tools.video. It does not reuse proprietary source code, UI, or copy. Paid/Subway-related tools are out of scope.

## Status

This repository is in active development.

Current branch: `codex/video-tools`

Completed so far:

- Next.js static-export scaffold.
- Tool catalog and support matrix.
- Pure capability profile and engine planner tests.

Not complete yet:

- The five tool pages are not fully implemented.
- MediaBunny and FFmpeg.wasm engine adapters are not wired to real media jobs yet.
- Deployment headers and third-party notices are planned but not added yet.
- Task 3 has open code-review issues documented in `docs/superpowers/progress/2026-05-29-video-tools-checkpoint.md`.

## Goals

The first working release targets five local tools:

- Media Info
- Convert Video
- Compress Video
- Trim Video
- Extract Audio

Files should stay in the browser. The app should not require a media-processing backend.

## Architecture

The app uses:

- Next.js with `output: "export"`
- TypeScript
- Vitest for unit tests
- MediaBunny as the preferred browser-native media path
- FFmpeg.wasm as a compatibility fallback

Core design choices:

- `enginePlanner` is a pure function over file profile, requested job, and browser capability profile.
- The support matrix is shared by planner tests and catalog data to avoid UI/runtime drift.
- Browser capability detection is separate from planning.
- FFmpeg assets should be self-hosted once the fallback engine is implemented.

## Development

Install dependencies:

```bash
npm.cmd install
```

Build the static app:

```bash
npm.cmd run build
```

Run unit tests:

```bash
npm.cmd test
```

Run the current focused unit set:

```bash
npm.cmd test -- tests/unit/support-matrix.test.ts tests/unit/catalog.test.ts tests/unit/capabilities.test.ts tests/unit/engine-planner.test.ts
```

Preview the static export after building:

```bash
npm.cmd run start
```

On Windows/PowerShell, use `npm.cmd` if `npm.ps1` is blocked by execution policy.

## Repository Notes

Implementation work is happening on:

```text
codex/video-tools
```

Progress checkpoints live under:

```text
docs/superpowers/progress/
```

Design and implementation planning docs live under:

```text
docs/superpowers/specs/
docs/superpowers/plans/
```

## License

`package.json` currently declares MIT. A full `LICENSE` file and `THIRD_PARTY_NOTICES.md` are planned before release.

Important dependency notes for the release docs:

- MediaBunny is MPL-2.0.
- `@mediabunny/mp3-encoder` includes a LAME MP3 encoder build; LAME is LGPL and needs attribution.
- FFmpeg core builds may be LGPL or GPL depending on the selected build and codecs.
