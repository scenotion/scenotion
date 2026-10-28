# UI Fork

Status: targeted UI fork, base Motion Canvas 3.17.2. Last updated: 2026-10-28.

## Why

Motion Canvas' timeline is an animation timeline, not an NLE media timeline. It has no
audio/caption track model, and editor plugins cannot add tracks to the bottom timeline.
A narration track therefore requires owning the UI layer.

Scenotion now keeps a targeted fork:

    packages/scenotion-ui

It is based on @motion-canvas/ui 3.17.2 (MIT, Copyright (c) 2022 motion-canvas).
The upstream LICENSE and NOTICE.md are kept in the package.

## What is forked

- Editor shell and timeline components.
- UI localization remains in the editor wrapper (Preact vnode layer).
- The 2D/scene-graph editor plugin is aliased to the fork so Preact contexts match.

The fork is built with Vite into packages/scenotion-ui/dist. dist is ignored by Git;
run npm run build:ui to regenerate it. npm run serve and npm run build do this
automatically.

## First modification

Timeline now shows a narration lane:

- reads /__scenotion/narration/manifest for the current project and video locale;
- renders the active take of each script line as a clip;
- positions clips from line.start + take.offset + trim;
- clicking a clip seeks the player to its start;
- refreshes by event or a short poll.

A REC button on the lane records the line at the playhead (or the first line without a
take) and uploads it through the same local API. Playback-synced countdown and punch-in/out
are the next step; the sidebar remains the detailed take/property editor.

## Maintenance

- Record upstream base version and modifications in NOTICE.md and commit history.
- Keep the fork small; prefer editor components and custom nodes when no UI change is
  required.
- Rebase deliberately on Motion Canvas upgrades. Do not let the fork drift silently.
- Do not copy non-open assets. The fork contains only MIT source and vector icons.
