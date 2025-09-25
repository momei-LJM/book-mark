import { createContext } from 'react'
import { UseBookmarksReturn } from '@/hooks/useBookmarks'

export const StoreContext = createContext<UseBookmarksReturn>({
  bookmarks: [],
  filter: () => {},
  isLoading: true,
  statistic: {
    totalBookmarks: 0,
    totalFolders: 0,
  },
  searchQuery: '',
  originalBookmarks: [],
  onAddGroup: () => {},
  onRemoveGroup: () => {},
  isExpanded: false,
  togglePanel: () => {},
  handleClose: () => {},
})
