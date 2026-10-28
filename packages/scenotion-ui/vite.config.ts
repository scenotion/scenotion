import preact from '@preact/preset-vite';
import * as fs from 'fs';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@motion-canvas/ui': '/src/main.tsx',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@motion-canvas/2d/editor': '@motion-canvas/2d/src/editor',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      formats: ['es'],
      fileName: 'main',
    },
    rollupOptions: {
      external: [/^@motion-canvas\/core/, /^@?preact/],
    },
  },
  plugins: [
    preact(),
    dts({
      // The upstream UI source is not cleanly type-checked outside the
      // Motion Canvas monorepo (React shims, Preact prop variance). Keep
      // declaration output, but do not fail the Scenotion fork build on it.
      logLevel: 'silent',
      rollupTypes: false,
    }),
    {
      name: 'copy-files',
      async buildStart() {
        this.emitFile({
          type: 'asset',
          fileName: 'editor.html',
          source: await fs.promises.readFile('./editor.html'),
        });
      },
    },
  ],
});
