import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { build: true },
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  treeshake: true,
  unbundle: true,
});
