import { useCallback, useEffect, useMemo, useState } from 'react'
import { requestBookmarkTree } from '@/core/message'
import { createdFlatList, Logger } from '../lib/utils'
export interface BookmarkNode {
  id: string
  title: string
  url?: string
  children?: BookmarkNode[]
  dateAdded?: number
  parentId?: string
  folderType?: string
}
export interface UseBookmarksReturn {
  bookmarks: BookmarkNode[]
  filter: (query: string) => void
  isLoading: boolean
  statistic: {
    totalBookmarks: number
    totalFolders: number
  }
  searchQuery: string
  originalBookmarks: BookmarkNode[]
  onAddGroup: (id: string, parentId?: string) => void
  onRemoveGroup: (id: string) => void
  isExpanded: boolean
  togglePanel: () => void
  handleClose: () => void
}

interface TGroup extends BookmarkNode {
  main?: boolean
}

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([])
  const [flatMarks, setFlatMarks] = useState<BookmarkNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [groups, setGroups] = useState<TGroup[]>([])

  const [isVisible, setIsVisible] = useState(false)
  const togglePanel = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  // 当前面板id链
  const chainIds = useMemo(() => groups.map(g => g.id), [groups])

  const addGroup = (id: string, parentId?: string) => {
    const finded = findBookMarkById(id)

    if (!finded) return

    if (parentId === undefined) {
      setGroups([...groups, finded])
      return
    }

    // 如果父节点在链上，截断到父节点并添加当前节点
    const parentIndex = chainIds.indexOf(parentId)
    if (parentIndex > -1) {
      setGroups([...groups.slice(0, parentIndex + 1), finded])
      return
    }
  }

  const removeGroup = (id: string) => {
    if (!groups.find(g => g.id === id)) return
    setGroups(prev => prev.filter(c => c.id !== id))
  }

  const initBookmarks = async () => {
    const response = (await requestBookmarkTree()) as {
      bookmarks: BookmarkNode[]
    }
    const group = response.bookmarks[0].children?.find(
      (i: BookmarkNode) => i.folderType === 'bookmarks-bar'
    )
    const bookmarks = group?.children || []

    Logger.info('Bookmarks fetched successfully', bookmarks, group)
    if (response && response.bookmarks) {
      setBookmarks([group] as BookmarkNode[])
      setGroups([{ ...(group || ({} as BookmarkNode)), main: true }])
      setFlatMarks(
        createdFlatList<BookmarkNode>(response.bookmarks, node => {
          return !!node.url
        })
      )
    }
    setIsLoading(false)
  }

  useEffect(() => {
    initBookmarks()
  }, [])

  // 统计信息
  const stats = useMemo(() => {
    let totalBookmarks = 0
    let totalFolders = 0

    const countItems = (nodes: BookmarkNode[]) => {
      nodes.forEach(node => {
        if (node.url) {
          totalBookmarks++
        } else if (
          node.title &&
          node.title !== 'Bookmarks bar' &&
          node.title !== 'Other bookmarks'
        ) {
          totalFolders++
        }
        if (node.children) {
          countItems(node.children)
        }
      })
    }

    countItems(bookmarks)
    return { totalBookmarks, totalFolders }
  }, [bookmarks])

  // 递归查找
  const findBookMarkById = useCallback(
    (id: string, tree: BookmarkNode[] = bookmarks): BookmarkNode | null => {
      for (const node of tree) {
        if (node.id === id) {
          return node
        }
        if (node.children) {
          const found = findBookMarkById(id, node.children)
          if (found) {
            return found
          }
        }
      }
      return null
    },
    [bookmarks]
  )

  // 过滤书签
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks

    // 从 flatMarks 中过滤匹配的书签
    const matchedBookmarks = flatMarks.filter(
      bookmark =>
        bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return matchedBookmarks
  }, [flatMarks, searchQuery, bookmarks])

  useEffect(() => {
    if (searchQuery.trim()) {
      setGroups([
        {
          children: filteredBookmarks,
          id: 'main',
          title: 'Main',
          main: true,
        },
      ])
      Logger.log('Filtered Bookmarks:', filteredBookmarks)
    } else {
      Logger.log('feed', bookmarks)

      setGroups([{ ...bookmarks[0], main: true }])
    }
  }, [filteredBookmarks, searchQuery])
  return {
    originalBookmarks: bookmarks,
    bookmarks: filteredBookmarks,
    filter: setSearchQuery,
    isLoading,
    statistic: stats,
    searchQuery,
    findBookMarkById,
    addGroup,
    groups,
    removeGroup,
    onAddGroup: addGroup,
    onRemoveGroup: removeGroup,

    isExpanded: isVisible,
    togglePanel,
    handleClose,
  }
}
