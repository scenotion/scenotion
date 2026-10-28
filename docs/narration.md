# Narration

Status: M2.1 line-based recording MVP. Last updated: 2026-10-28.

## Scope

This slice covers recording a narration line, keeping multiple takes, choosing the
active take, and editing basic take metadata. It does not yet synchronize recording
with video playback, mix music/SFX, or export captions.

## Data

Script text is tracked:

    content/narration/<project>.json

Recordings and take metadata are local and ignored:

    voiceover/<project>/<locale>/manifest.json
    voiceover/<project>/<locale>/<take>.webm|wav

The browser sends audio to the local Vite server; nothing is uploaded.

## Project script

    {
      "version": 1,
      "project": "code-workflow",
      "lines": [
        {
          "id": "opening",
          "scene": "CodeWorkflow",
          "start": 0.2,
          "end": 2.2,
          "text": {
            "en-US": "English script",
            "zh-CN": "中文脚本"
          }
        }
      ]
    }

Line ids are stable across locales. The editor derives the project id from the
project name with slugify; "Code Workflow" becomes code-workflow.

## Editor

The Narration sidebar is the recording control surface:

- choose a line;
- record into the local voiceover directory;
- play takes and set the active take;
- edit offset, trim in/out, gain, fade in/out;
- inspect a decoded waveform.

The forked timeline also renders a voice lane for the current video locale. The
active take of each line appears as a clip positioned from line start + offset +
trim. Clicking a clip seeks the player to its start. The lane refreshes when the
sidebar notifies it or after a short poll.

The REC button records the line at the playhead, or the first line without a take,
and saves it directly to the lane. This is a scratch recording at the current
playhead; synchronized playback, countdown and punch-in/out are still M2 work.

The language selector changes the displayed script and the take locale.

## Server endpoints

All endpoints are under /__scenotion/narration and are local-only.

    GET    /manifest?project=&locale=
    GET    /audio?project=&locale=&line=&take=
    POST   /take?project=&locale=&line=&duration=
    PATCH  /take
    DELETE /take?project=&locale=&line=&take=

Audio uploads are limited to 64 MB. Project, locale, line and take ids are
validated before any file access. Audio is served only when the take is present
in the manifest.

## Next

- record while the video preview plays, with countdown and latency calibration;
- snap/nudge against scene and beat markers;
- generate and export captions;
- mix voice, music and SFX for rendering.
