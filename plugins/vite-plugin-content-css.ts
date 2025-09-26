import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { Plugin } from 'vite'
import { writeFileSync } from 'node:fs'

const isDev = process.env.NODE_ENV === 'development'

export default function vitePluginContentCss(): Plugin {
  let compiledCss: string | null = null

  const targetPath = resolve(process.cwd(), 'dist/src/output.css')
  const cssPath = resolve(process.cwd(), 'src/styles/content.css')
  const tailwindConfigPath = resolve(process.cwd(), 'tailwind.config.js')

  const genCss = async () => {
    try {
      const cssContent = await readFile(cssPath, 'utf-8')
      // 即时编译css样式文件
      const result = await postcss([
        tailwindcss(tailwindConfigPath),
        autoprefixer(),
      ]).process(cssContent, {
        from: cssPath,
        to: targetPath,
      })
      compiledCss = result.css.replace(/:root/g, ':host')
    } catch (error) {
      console.error('Failed to compile CSS:', error)
      compiledCss = ''
    } finally {
      writeFileSync(targetPath, compiledCss, 'utf-8')
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
    configureServer() {
      genCss()
    },
    async handleHotUpdate(ctx) {
      // 这里不能发送自定义hmr消息，因为被crxjs过滤掉了
      // 所以自能走通用的hmr生命周期
      // 任何文件变化都重新编译 CSS 以获取最新的类名
      console.log('File changed, recompiling CSS...')

      await genCss()

      return ctx.modules
    },
  }
}
