import { Plugin } from 'vite'
import postcss, { Root, Rule, AtRule, Declaration } from 'postcss'
import fs from 'fs'
import path from 'path'

interface ShadowDomCssPluginOptions {
  include?: RegExp
  exclude?: RegExp
}

export function shadowDomCssPlugin(
  options: ShadowDomCssPluginOptions = {}
): Plugin {
  const { include = /content\.css$/, exclude } = options

  return {
    name: 'shadow-dom-css-plugin',
    apply: 'build',
    writeBundle(outputOptions, bundle) {
      // 在文件写入后处理CSS文件
      const outputDir = outputOptions.dir || 'dist'

      Object.keys(bundle).forEach(fileName => {
        if (fileName.match(include) && (!exclude || !fileName.match(exclude))) {
          const filePath = path.join(outputDir, fileName)

          if (fs.existsSync(filePath)) {
            console.log(`Processing ${fileName} for Shadow DOM compatibility`)

            try {
              const cssContent = fs.readFileSync(filePath, 'utf-8')

              // 使用PostCSS解析CSS
              const result = postcss([shadowDomCompatibilityPlugin()]).process(
                cssContent,
                { from: filePath }
              )

              fs.writeFileSync(filePath, result.css)
              console.log(
                `✓ Processed ${fileName} for Shadow DOM compatibility`
              )
            } catch (error) {
              console.error(`Error processing ${fileName}:`, error)
            }
          }
        }
      })
    },
  }
}

function shadowDomCompatibilityPlugin() {
  return {
    postcssPlugin: 'shadow-dom-compatibility',
    Once(root: Root) {
      const customPropertiesMap = new Map<string, string>()

      // 第一步：收集@property规则中定义的CSS变量及其初始值
      root.walkAtRules('property', (rule: AtRule) => {
        const propertyName = rule.params
        let initialValue = ''

        rule.walkDecls('initial-value', (decl: Declaration) => {
          initialValue = decl.value
        })

        // 即使没有初始值也要收集这个属性
        customPropertiesMap.set(propertyName, initialValue)
      })

      // 额外添加一些没有在@property中定义但在CSS中使用的变量
      const additionalProperties = [
        '--tw-shadow-color',
        '--tw-inset-shadow-color',
        '--tw-ring-color',
        '--tw-inset-ring-color',
      ]

      additionalProperties.forEach(prop => {
        if (!customPropertiesMap.has(prop)) {
          customPropertiesMap.set(prop, '')
        }
      }) // 第二步：为:host添加所有CSS自定义属性的初始值
      let hostRule: Rule | null = null

      root.walkRules(':host', (rule: Rule) => {
        hostRule = rule
      })

      if (!hostRule) {
        // 如果没有:host规则，创建一个
        hostRule = postcss.rule({ selector: ':host' })
        root.append(hostRule)
      }

      // 添加CSS变量到:host规则
      customPropertiesMap.forEach((initialValue, propertyName) => {
        // 移除引号
        const cleanPropertyName = propertyName.replace(/['"]/g, '')
        const cleanInitialValue = getConcreteValue(
          cleanPropertyName,
          initialValue
        )

        hostRule!.append(
          postcss.decl({
            prop: cleanPropertyName,
            value: cleanInitialValue,
          })
        )
      })

      // 第三步：移除@property规则（Shadow DOM中可能不支持）
      root.walkAtRules('property', (rule: AtRule) => {
        rule.remove()
      })

      // 第四步：处理@layer规则，将其内容提取出来
      root.walkAtRules('layer', (rule: AtRule) => {
        if (rule.nodes) {
          rule.nodes.forEach(node => {
            root.insertAfter(rule, node)
          })
        }
        rule.remove()
      })
    },
  }
}

// 为特定的CSS变量提供合理的默认值
function getConcreteValue(propertyName: string, initialValue: string): string {
  // 如果已经有具体值，直接返回
  if (initialValue && initialValue !== '0' && initialValue !== 'initial') {
    return initialValue
  }

  // 为常见的Tailwind CSS变量提供合理的默认值
  const defaultValues: Record<string, string> = {
    '--tw-shadow-color': 'rgba(0, 0, 0, 0.1)',
    '--tw-shadow': '0 0 #0000',
    '--tw-shadow-alpha': '100%',
    '--tw-inset-shadow': '0 0 #0000',
    '--tw-inset-shadow-color': 'rgba(0, 0, 0, 0.05)',
    '--tw-inset-shadow-alpha': '100%',
    '--tw-ring-color': 'rgba(59, 130, 246, 0.5)',
    '--tw-ring-shadow': '0 0 #0000',
    '--tw-inset-ring-color': 'rgba(59, 130, 246, 0.5)',
    '--tw-inset-ring-shadow': '0 0 #0000',
    '--tw-ring-inset': '',
    '--tw-ring-offset-width': '0px',
    '--tw-ring-offset-color': '#fff',
    '--tw-ring-offset-shadow': '0 0 #0000',
    '--tw-border-style': 'solid',
    '--tw-translate-x': '0',
    '--tw-translate-y': '0',
    '--tw-translate-z': '0',
    '--tw-rotate-x': '0',
    '--tw-rotate-y': '0',
    '--tw-rotate-z': '0',
    '--tw-skew-x': '0',
    '--tw-skew-y': '0',
    '--tw-space-y-reverse': '0',
    '--tw-outline-style': 'solid',
  }

  return defaultValues[propertyName] || initialValue || '0'
}

shadowDomCompatibilityPlugin.postcss = true
