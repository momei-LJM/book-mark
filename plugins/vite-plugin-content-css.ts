import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import postcss, { Root, Comment, Rule } from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const isDev = process.env.NODE_ENV === 'development'

// PostCSS 插件：移除注释并转换 Shadow DOM 选择器
function shadowDomTransform() {
  return {
    postcssPlugin: 'shadow-dom-transform',
    Once(root: Root) {
      // 移除所有注释
      root.walkComments((comment: Comment) => {
        comment.remove()
      })

      // 转换选择器
      root.walkRules((rule: Rule) => {
        rule.selector = rule.selector
          .replace(/:root/g, ':host')
          .replace(/(?:^|,)\s*\*\s*(?=\{|,|$)/g, (match: string) => {
            // 只替换作为独立选择器的 *
            return match.replace('*', ':host')
          })
      })
    },
  }
}
shadowDomTransform.postcss = true

export default function vitePluginContentCss() {
  const virtualModuleId = 'virtual:content-css'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  let compiledCss: string | null = null

  const genCss = async () => {
    try {
      const cssPath = resolve(process.cwd(), 'src/styles/content.css')
      const cssOutputPath = resolve(process.cwd(), 'demo2.css')
      const tailwindConfigPath = resolve(process.cwd(), 'tailwind.config.js')
      const cssContent = await readFile(cssPath, 'utf-8')

      // 使用PostCSS编译CSS，传递正确的配置文件
      const result = await postcss([
        tailwindcss(tailwindConfigPath), // 传递配置文件路径
        autoprefixer(), // 添加我们的转换插件
      ]).process(cssContent, {
        from: cssPath,
        to: cssOutputPath,
      })

      compiledCss = result.css.replace(/:root/g, ':host')
      writeFile(cssOutputPath, compiledCss)
      console.log(
        'CSS compiled successfully for production, length:',
        compiledCss.length
      )

      console.log('First 200 chars:', compiledCss.substring(0, 200))
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
        //         if (isDev) {
        //           // 在开发环境中导入CSS，让Vite处理PostCSS
        //           return `import contentCss from '@/styles/content.css?inline';
        // export default contentCss;`
        //         } else {
        //           // 在生产环境中返回编译后的CSS

        //       }
        return `
          const compiledCss = ${JSON.stringify(compiledCss || '')};
          export default compiledCss;`
      }
    },
  }
}
