import react from '@vitejs/plugin-react'
import { build, InlineConfig } from 'vite'
import { createFileWatcher } from './src/node/watcher'
const baseOptions = (): InlineConfig => ({
  root: process.cwd(),
  base: '.',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})

const buildOptions: InlineConfig[] = [
  {
    ...baseOptions(),
    build: {
      emptyOutDir: true,
      outDir: 'dist',
      cssMinify: false,
    },
  },
  {
    ...baseOptions(),
    plugins: [react()],
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      cssMinify: false,
      lib: {
        name: 'content',
        entry: 'src/entry/content.tsx',
        formats: ['umd'],
        fileName: _format => `content.js`,
        cssFileName: `content`,
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  },
  {
    ...baseOptions(),
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        name: 'background',
        entry: 'src/entry/background.ts',
        formats: ['es'],
        fileName: _format => `background.js`,
      },
    },
  },
]

const buildAssets = async () => {
  for (const option of buildOptions) {
    await build(option)
  }
}

buildAssets()
createFileWatcher(buildAssets)
