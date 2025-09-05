import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { InlineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tailwindcssPlugin from '@tailwindcss/postcss'
import { build } from 'vite'

const baseOptions = (): InlineConfig => ({
  root: process.cwd(),
  base: '.',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcssPlugin],
    },
  },
})

const buildOptions: InlineConfig[] = [
  {
    ...baseOptions(),
    build: {
      emptyOutDir: true,
      outDir: 'dist',
    },
  },
  {
    ...baseOptions(),
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        name: 'content',
        entry: 'src/content.tsx',
        formats: ['umd'],
        fileName: format => `content.js`,
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
        fileName: format => `background.js`,
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
