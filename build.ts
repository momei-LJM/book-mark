import react from '@vitejs/plugin-react'
import { build, InlineConfig } from 'vite'
import chokidar from 'chokidar'
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
        entry: 'src/content.tsx',
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
        entry: 'src/background.ts',
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

chokidar.watch('./src').on('all', (event, path) => {
  console.log(event, path)
  buildAssets()
})
