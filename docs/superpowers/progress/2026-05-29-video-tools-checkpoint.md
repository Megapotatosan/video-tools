# Video Tools Progress Checkpoint

Date: 2026-05-29
Branch: `codex/video-tools`
Worktree: `C:\Users\ming2\OneDrive\文件\video tools\.worktrees\codex\video-tools`

## Completed

- Task 1 scaffolded the Next.js static export app and passed spec/code-quality review.
- Task 2 added the support matrix and tool catalog, hardened catalog immutability, and passed spec/code-quality review.
- Task 3 added capability profiling and a pure engine planner. It passed spec review after fixes, but final code-quality review still has open issues.

## Latest Commits

- `1918bdf` fix: make planner decode checks job aware
- `6154ce4` fix: harden engine planner fallbacks
- `fe9386f` chore: ignore typescript build cache
- `e4ed65f` feat: add media engine planner
- `ad9cbc8` test: harden catalog support matrix
- `e04ef77` feat: add tool catalog and support matrix
- `58cbd7a` chore: fix static export scaffold
- `65fc8b1` chore: scaffold next static app

## Verification So Far

- Task 1 build passed with `npm.cmd run build`.
- Task 2 unit tests passed: support matrix and catalog tests.
- Task 3 current unit subset passed: capabilities, engine planner, catalog, support matrix, 24 tests.
- TypeScript check passed in final Task 3 review: `npx.cmd tsc --noEmit`.

Sandbox note: normal `npm` can be blocked by PowerShell execution policy, and sandboxed Vitest can hit OneDrive access errors. Use `npm.cmd` and escalate when needed.

## Pause Point

Paused after Task 3 final code-quality review. Do not start Task 4 until Task 3 review issues below are fixed and re-reviewed.

## Open Task 3 Review Issues

1. `src/lib/media/engine-planner.ts` treats missing job-relevant codec metadata as decode-supported. For `extract-audio`, missing `file.audioCodec` currently allows MediaBunny. For `transcode` and `trim`, missing `videoCodec` or `audioCodec` can also allow MediaBunny. Fix by distinguishing unknown codec metadata from absent tracks, or conservatively fallback to FFmpeg when required codec metadata is missing.

2. `src/lib/media/engine-planner.ts` validates output tuples only against the global support matrix, not job-specific output validity. Example: `extract-audio` should reject video output tuples such as MP4 AVC/AAC before engine selection.

3. Minor: MP3 extension extraction always reports `low` memory risk. Large MP3 extraction should use the same path-aware MediaBunny memory risk policy as other MediaBunny jobs.

Recommended tests to add before fixes:

- `extract-audio` with missing `audioCodec`.
- `transcode` or `trim` with missing job-relevant codec metadata.
- `extract-audio` receiving a video output tuple.
- large MP3 extension extraction memory risk.

## Next Step On Resume

Resume Task 3 by sending the open issues back to the Task 3 implementer or implementing them locally if subagent credits are unavailable. After fixes:

1. Run `npm.cmd test -- tests/unit/capabilities.test.ts tests/unit/engine-planner.test.ts`.
2. Run `npm.cmd test -- tests/unit/support-matrix.test.ts tests/unit/catalog.test.ts tests/unit/capabilities.test.ts tests/unit/engine-planner.test.ts`.
3. Re-run Task 3 spec compliance review.
4. Re-run Task 3 code quality review.
5. Only then mark Task 3 complete and move to Task 4.
