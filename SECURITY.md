# Security

Scenotion is a local, browser-based renderer. It has no server or user accounts.

## Report

Use the repository's private security advisory channel. Do not open a public issue. Include the affected version, a minimal reproduction and the impact.

## Scope

- Secrets: API keys and voice credentials must not enter the repository or client bundle.
- Assets: treat SVG, images, video, audio, GLB and GLSL as untrusted data.
- Scripts: validate paths passed to render/export scripts and keep them inside the workspace.
- Dependencies: review license and security changes before adding packages.

The current `0.1.x` line receives fixes.
