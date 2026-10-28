# Contributing

Scenotion is a Motion Canvas component layer. Keep the base typed, small and replaceable.

## Check

~~~bash
npm install
npm run check
npm run test:types
npm test
npm run build
npm run serve
~~~

Run the checks and describe manual verification in the pull request.

## Rules

- Do not patch `node_modules`. The supported extension point is the local `editor/` package.
- If a Motion Canvas fork becomes necessary, keep the MIT notice, mark modified files and update `THIRD_PARTY_NOTICES.md`.
- Keep one logical change per pull request.
- Update `README.md` and `README.zh-CN.md` when public behavior, scripts or the project list changes.
- Update `docs/transitions.md` when a preset or annotation timing changes.
- New visual capabilities need a project demo in `src/projects/`.
- Scene text goes through `src/i18n`; editor chrome goes through `editor/i18n.ts`. No hard-coded user-facing strings.
- Keep binary and private assets out of Git. Use the ignored local asset directories.
- Assets must be redistributable; record new third-party material in `THIRD_PARTY_NOTICES.md`.
- Do not commit secrets, voice credentials, private footage or licensed fonts.

## License

Contributions are MIT. See `LICENSE`.
