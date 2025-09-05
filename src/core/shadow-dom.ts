import { CONTAINER_CONTAINER_ID } from '../constants'

/**
 * inject styles into the shadow DOM
 * @param styleContainer
 */
export async function injectStyles(styleContainer: ShadowRoot) {
  try {
    const cssUrl = chrome.runtime.getURL('content.css')
    const response = await fetch(cssUrl)
    //replace :root with :host for shadow DOM (tailwind uses :root for variables)
    const cssText = (await response.text()).replace(':root', ':host')
    const styleElement = document.createElement('style')
    styleElement.textContent = cssText
    styleContainer.appendChild(styleElement)
  } catch (error) {
    console.error('Failed to inject styles:', error)
    const tailwindLink = document.createElement('link')
    tailwindLink.rel = 'stylesheet'
    tailwindLink.href = chrome.runtime.getURL('content.css')
    styleContainer.appendChild(tailwindLink)
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
