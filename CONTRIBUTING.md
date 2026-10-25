# Contributing

Scenotion is a Motion Canvas component layer. Keep the base typed, small and replaceable.

## Check

~~~bash
npm install
npm run check
npm run build
npm run serve
~~~

There is no test runner yet. Run both checks and describe manual verification in the pull request.

## Rules

- Do not patch `node_modules` or vendor a modified Motion Canvas.
- Keep one logical change per pull request.
- Update `README.md` and `README.zh-CN.md` when public behavior, scripts or the project list changes.
- Update `docs/transitions.md` when a preset or annotation timing changes.
- New visual capabilities need a project demo in `src/projects/`.
- Do not add hard-coded user-facing strings where a prop can carry the text.
- Assets must be redistributable; record new third-party material in `THIRD_PARTY_NOTICES.md`.
- Do not commit secrets, voice credentials, private footage or licensed fonts.

## License

Contributions are MIT. See `LICENSE`.
