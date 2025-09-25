import { StoreContext } from '@/core/context'
import { useBookmarks } from '../hooks/useBookmarks'
import { BookmarkPanel } from './bookmark-panel'
import { DraggableCapsule } from './draggable-capsule'
import { HOT_KEYS } from '../constants'
import { useHotkeys } from '../hooks/useHotkeys'

export const ContentApp: React.FC = () => {
  const store = useBookmarks()
  useHotkeys(HOT_KEYS, store.togglePanel)

  return (
    <StoreContext value={store}>
      <DraggableCapsule isExpanded={store.isExpanded}>
        {store.groups.map(g => (
          <BookmarkPanel
            key={g.main ? 'main' : g.id}
            onClose={store.handleClose}
            bookmarks={g.children || []}
            main={g.main}
          />
        ))}
      </DraggableCapsule>
    </StoreContext>
  )
}
