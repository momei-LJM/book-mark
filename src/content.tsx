import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import hotkeys from 'hotkeys-js'
import Popup from './components/Popup'
import './content.css'

const ContentApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    console.log(1111111)

    // 监听快捷键 - 使用Ctrl+Alt+B避免与浏览器冲突
    hotkeys('ctrl+alt+c, command+option+c', event => {
      event.preventDefault()
      setIsVisible(!isVisible)
      console.log('Bookmark panel toggled via hotkey')
    })

    // 监听来自background的命令
    chrome.runtime.onMessage.addListener(message => {
      if (message.action === 'toggle-bookmark-panel') {
        setIsVisible(!isVisible)
      }
    })

    return () => {
      hotkeys.unbind('ctrl+alt+b, command+option+b')
    }
  }, [isVisible])

  if (!isVisible) return null
  return (
    <div className='fixed top-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-hidden'>
      <div className='drag-handle bg-gray-100 px-4 py-2 cursor-move flex items-center justify-between'>
        <span className='font-semibold'>Bookmark Manager</span>
        <button
          onClick={() => setIsVisible(false)}
          className='text-gray-500 hover:text-gray-700'
        >
          ✕
        </button>
      </div>
      <div className='p-4 overflow-auto max-h-80'>
        <Popup />
      </div>
    </div>
  )
}

// 创建Shadow DOM容器
const createShadowRoot = () => {
  const container = document.createElement('div')
  container.id = 'bookmark-extension-root'
  container.setAttribute(
    'style',
    'position: fixed; top: 0; left: 0; z-index: 2147483647;'
  ) // 确保最高优先级
  document.body.appendChild(container)

  // 创建Shadow Root
  const shadowRoot = container.attachShadow({ mode: 'closed' })

  // 创建样式容器
  const styleContainer = document.createElement('div')
  shadowRoot.appendChild(styleContainer)

  // 创建React根容器
  const reactContainer = document.createElement('div')
  shadowRoot.appendChild(reactContainer)

  return { shadowRoot, reactContainer, styleContainer }
}

// 注入Tailwind和组件样式到Shadow DOM
const injectStyles = async (styleContainer: HTMLElement) => {
  try {
    // 获取CSS内容并直接注入
    const cssUrl = chrome.runtime.getURL('content.css')
    const response = await fetch(cssUrl)
    const cssText = await response.text()

    // 创建style元素并注入CSS
    const styleElement = document.createElement('style')
    styleElement.textContent = cssText
    styleContainer.appendChild(styleElement)
  } catch (error) {
    console.error('Failed to inject styles:', error)
    // 备用方案：使用link标签
    const tailwindLink = document.createElement('link')
    tailwindLink.rel = 'stylesheet'
    tailwindLink.href = chrome.runtime.getURL('content.css')
    styleContainer.appendChild(tailwindLink)
  }
}

// 初始化扩展
const initExtension = async () => {
  const { reactContainer, styleContainer } = createShadowRoot()

  // 注入样式
  await injectStyles(styleContainer)

  // 创建React根并渲染应用
  const root = createRoot(reactContainer)
  root.render(<ContentApp />)
}

// 启动扩展
initExtension()
