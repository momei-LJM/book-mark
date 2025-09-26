import hotkeys from 'hotkeys-js'
import { useEffect } from 'react'

// 配置 hotkeys-js 以更好地处理系统快捷键
hotkeys.filter = event => {
  const target = event.target as HTMLElement
  const tagName = target.tagName
  // 允许在输入框中使用快捷键，但阻止系统快捷键的默认行为
  return !(
    tagName === 'INPUT' ||
    tagName === 'SELECT' ||
    tagName === 'TEXTAREA'
  )
}

export const useHotkeys = (
  keys: string,
  callback: (event: KeyboardEvent) => void
) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // 强制阻止默认行为和事件冒泡
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      // 确保事件不会继续传播
      callback(event)
      return false
    }

    hotkeys(keys, handler)

    return () => hotkeys.unbind(keys, handler)
  }, [keys, callback])
}
