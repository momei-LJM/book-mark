import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { defineConfig } from 'vite'
import manifest from './manfifest.config'
import vitePluginContentCss from './plugins/vite-plugin-content-css'
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [react(), crx({ manifest }), vitePluginContentCss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  define: {
    __DEV__: isDev,
  },
})
