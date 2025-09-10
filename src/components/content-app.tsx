import { StoreContext } from '@/core/context'
import hotkeys from 'hotkeys-js'
import { useCallback, useEffect, useState } from 'react'
import { useBookmarks } from '../hooks/useBookmarks'
import { BookmarkPanel } from './bookmark-panel'
import { DraggableCapsule } from './draggable-capsule'
import { HOT_KEYS } from '../constants'

export const ContentApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const store = useBookmarks()
  console.log(11111, store)

  const togglePanel = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  useEffect(() => {
    hotkeys(HOT_KEYS, event => {
      event.preventDefault()
      togglePanel()
    })
    return () => {
      hotkeys.unbind(HOT_KEYS)
    }
  }, [togglePanel])

  return (
    <StoreContext.Provider value={store}>
      <DraggableCapsule onClick={togglePanel} isExpanded={isVisible}>
        {store.groups.map(g => (
          <BookmarkPanel
            key={g.id}
            onClose={handleClose}
            bookmarks={g.children || []}
            main={g.main}
          />
        ))}
      </DraggableCapsule>
    </StoreContext.Provider>
  )
}
