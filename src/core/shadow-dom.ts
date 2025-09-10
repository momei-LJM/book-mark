import { CONTAINER_CONTAINER_ID } from '../constants'
// 导入编译后的样式
import contentStyles from 'virtual:content-css'

/**
 * inject styles into the shadow DOM
 * @param styleContainer
 */
export async function injectStyles(styleContainer: ShadowRoot) {
  try {
    const div = document.createElement('div')
    const styleElement = document.createElement('style')
    console.log('Injecting styles in production mode')
    styleContainer.appendChild(div)
    div.appendChild(styleElement)
    styleElement.textContent = contentStyles
  } catch (error) {
    console.error('Failed to inject styles:', error)
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
  const shadowRoot = container.attachShadow({ mode: 'open' })

  // 创建React根容器
  const reactContainer = document.createElement('div')
  shadowRoot.appendChild(reactContainer)

  return { shadowRoot, reactContainer }
}
