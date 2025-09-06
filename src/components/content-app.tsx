import { StoreContext } from '@/core/context'
import hotkeys from 'hotkeys-js'
import { useCallback, useEffect, useState } from 'react'
import { useBookmarks } from '../hooks/useBookmarks'
import { BookmarkPanel } from './bookmark-panel'
import { DraggableCapsule } from './draggable-capsule'

export const ContentApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const {
    bookmarks,
    searchQuery,
    isLoading,
    filter,
    statistic,
    originalBookmarks,
  } = useBookmarks()

  const togglePanel = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  useEffect(() => {
    // 监听快捷键 - 使用Ctrl+Alt+B避免与浏览器冲突
    hotkeys('ctrl+alt+c, command+option+c', event => {
      event.preventDefault()
      togglePanel()
      console.log('Bookmark panel toggled hotkey')
    })

    // 监听来自background的命令
    chrome.runtime.onMessage.addListener(message => {
      if (message.action === 'toggle-bookmark-panel') {
        togglePanel()
      }
    })

    return () => {
      hotkeys.unbind('ctrl+alt+c, command+option+c')
    }
  }, [togglePanel])

  return (
    <StoreContext.Provider
      value={{
        bookmarks,
        filter,
        statistic,
        searchQuery,
        originalBookmarks,
        isLoading,
      }}
    >
      <DraggableCapsule onClick={togglePanel} isExpanded={isVisible}>
        <BookmarkPanel onClose={handleClose} />
      </DraggableCapsule>
    </StoreContext.Provider>
  )
}
