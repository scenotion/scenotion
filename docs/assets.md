# Assets and Fonts

Rule: the repository stores text and source, not media assets.

This project is a local video editor. It does not ship a font set, a media library
or a 3D asset pack. Assets are supplied by the project using Scenotion, either from
a cloud URL, an npm package, or a local directory that is ignored by Git.

## Fonts

Fonts are project assets, not a Scenotion feature.

- Scenotion does not provide, bundle, cache or license fonts by default.
- A project can use a cloud font (CSS or URL), an npm font package, or a local font file.
- Local font files belong in an ignored directory. Do not commit them.
- Scenotion only waits for the fonts declared by the project before preview/render.
- If a required font cannot load, the render should fail visibly rather than silently
  fall back to a different typeface.
- Font licensing is the project author's responsibility. If a font is distributed,
  record its name, version, source and license in this file or a LICENSES directory.

There is no font manager, font cache service or font license CI in scope.

## Ignored directories

The following are local and ignored:

    voiceover/
    assets/private/
    assets/local/
    output/
    reviews/*.mp4
    reviews/*.m4v
    public/generated/
    public/fonts/
    .cache/

The existing tracked review file is left in place for now. Future review renders
are ignored; this is not a deletion.

## Voiceover

Voice recordings are private by default.

- Saved under voiceover/ on the local machine.
- Never committed, even if the author owns the recording.
- Never uploaded by Scenotion; no telemetry.
- Sharing a project with audio requires an explicit export bundle chosen by the author.

## Other media

- Images, video, music and 3D models may be cloud-hosted or local; local copies are ignored.
- Only open licenses are acceptable for shared projects: MIT, Apache, BSD, ISC, OFL,
  CC0, or CC-BY with attribution. No proprietary, NC/ND, unclear or personal assets.
- Test fixtures should be generated at runtime (for example, a sine WAV) rather than committed.
- The 720p validation project uses code-generated visuals and synthetic audio.

## License notes

Motion Canvas is MIT. Revideo is also MIT and retains the Motion Canvas copyright
notice, which confirms that a Motion Canvas-based derivative can be distributed under
MIT with the original notice preserved. Scenotion prefers a non-invasive editor wrapper;
if the UI is forked later, keep the MIT notice, mark modified files and update notices.

No Revideo code or assets are copied into Scenotion.
