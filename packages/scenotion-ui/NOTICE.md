# Motion Canvas UI Fork

This package is a targeted fork of Motion Canvas UI.

- Upstream: @motion-canvas/ui
- Upstream version: 3.17.2
- Upstream license: MIT
- Source: https://github.com/motion-canvas/motion-canvas
- Copyright (c) 2022 motion-canvas

This package keeps the upstream MIT notice in LICENSE. Scenotion modifications are
also MIT. The recording/storage layer lives in the main Scenotion app, not here.

## Modifications

- Renamed to @scenotion/ui and built as a local package.
- Added a narration voice lane to the timeline:
  - reads the local narration manifest for the current project/locale;
  - renders active takes as clips positioned by line start, offset and trim;
  - seeks the player when a clip is clicked;
  - records the line at the playhead via the local narration API.
- Increased the default timeline height to fit the lane.
- Build declarations are emitted with upstream type diagnostics silenced; the
  Scenotion editor typecheck is the gate for our own code.

## Maintenance

Keep this fork small. Record every local change in commit history and update this
file when the upstream base or modifications change. Rebase deliberately on Motion
Canvas upgrades; do not let the fork drift silently.
