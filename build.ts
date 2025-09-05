import tailwindcssPlugin from '@tailwindcss/postcss'
import react from '@vitejs/plugin-react'
import { build, InlineConfig } from 'vite'

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

buildAssets()
