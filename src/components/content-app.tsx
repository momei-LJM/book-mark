import { StoreContext } from '@/core/context'
import { useCallback, useState } from 'react'
import { useBookmarks } from '../hooks/useBookmarks'
import { BookmarkPanel } from './bookmark-panel'
import { DraggableCapsule } from './draggable-capsule'
import { HOT_KEYS } from '../constants'
import { useHotkeys } from '../hooks/useHotkeys'

export const ContentApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const store = useBookmarks()

  const togglePanel = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  useHotkeys(HOT_KEYS, togglePanel)

  return (
    <StoreContext value={store}>
      <DraggableCapsule onClick={togglePanel} isExpanded={isVisible}>
        {store.groups.map(g => (
          <BookmarkPanel
            key={g.main ? 'main' : g.id}
            onClose={handleClose}
            bookmarks={g.children || []}
            main={g.main}
          />
        ))}
      </DraggableCapsule>
    </StoreContext>
  )
}
