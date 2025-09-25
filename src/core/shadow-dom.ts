import { CONTAINER_CONTAINER_ID } from '../constants'

let currentStyleElement: HTMLStyleElement | null = null

/**
 * inject styles into the shadow DOM
 * @param styleContainer
 */
export async function injectStyles(styleContainer: ShadowRoot) {
  try {
    const div = document.createElement('div')
    const styleElement = document.createElement('style')

    // 如果已有样式元素，先移除
    if (currentStyleElement) {
      currentStyleElement.remove()
    }

    styleContainer.appendChild(div)
    div.appendChild(styleElement)
    currentStyleElement = styleElement

    const response = await fetch(chrome.runtime.getURL('src/output.css'))
    const css = await response.text()
    styleElement.textContent = css
    console.log('Styles injected')

    // 设置 HMR 监听器（只设置一次）
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', () => {
        console.log('Received CSS update event:')
        // 重新获取并注入样式
        reloadStyles()
      })
    }
  } catch (error) {
    console.error('Failed to inject styles:', error)
  }
}

/**
 * 重新加载样式
 */
async function reloadStyles() {
  try {
    if (!currentStyleElement) return

    const response = await fetch(chrome.runtime.getURL('src/output.css'))
    const css = await response.text()
    currentStyleElement.textContent = css
    console.log('Styles reloaded successfully')
  } catch (error) {
    console.error('Failed to reload styles:', error)
  }
}

/**
 * Create a shadow root for the extension
 * @returns {Object} - The shadow root, react container, and style container
 */
export function createShadowRoot() {
  const container = document.createElement('div')
  container.id = CONTAINER_CONTAINER_ID
  container.setAttribute(
    'style',
    'position: fixed; top: 0; left: 0; z-index: 2147483647;'
  ) // 确保最高优先级
  document.body.appendChild(container)

  // 创建Shadow Root
  const shadowRoot = container.attachShadow({ mode: 'closed' })

  // 创建React根容器
  const reactContainer = document.createElement('div')
  shadowRoot.appendChild(reactContainer)

  return { shadowRoot, reactContainer }
}
