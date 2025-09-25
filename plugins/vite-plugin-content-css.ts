import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const isDev = process.env.NODE_ENV === 'development'

export default function vitePluginContentCss() {
  const virtualModuleId = 'virtual:content-css'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const cssPath = resolve(process.cwd(), 'src/styles/content.css')
  const tailwindConfigPath = resolve(process.cwd(), 'tailwind.config.js')

  let compiledCss: string | null = null

  const genCss = async () => {
    try {
      const cssContent = await readFile(cssPath, 'utf-8')
      // 即时编译css样式文件
      const result = await postcss([
        tailwindcss(tailwindConfigPath),
        autoprefixer(),
      ]).process(cssContent, {
        from: cssPath,
        to: null,
      })
      compiledCss = result.css.replace(/:root/g, ':host')
    } catch (error) {
      console.error('Failed to compile CSS:', error)
      compiledCss = ''
    }
  }
  return {
    name: 'vite-plugin-content-css',

    async buildStart() {
      // 在构建开始时编译CSS（仅在非开发环境）
      if (!isDev) {
        genCss()
      }
    },

    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id: string) {
      if (id === resolvedVirtualModuleId) {
        await genCss()
        return `
          const compiledCss = ${JSON.stringify(compiledCss || '')};
          export default compiledCss;`
      }
    },
  }
}
