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
  visitCount?: number // 访问次数
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
  sortBookmarks: (nodes: BookmarkNode[]) => BookmarkNode[] // 排序书签方法
  incrementVisitCount: (id: string) => void // 增加访问次数
  getVisitCount: (id: string) => number // 获取访问次数
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

  // 本地存储键名
  const VISIT_COUNT_KEY = 'bookmark_visit_counts'

  // 获取访问次数数据
  const getVisitCounts = useCallback(() => {
    try {
      const stored = localStorage.getItem(VISIT_COUNT_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }, [])

  // 保存访问次数数据
  const saveVisitCounts = useCallback((counts: Record<string, number>) => {
    try {
      localStorage.setItem(VISIT_COUNT_KEY, JSON.stringify(counts))
    } catch (error) {
      Logger.error('Failed to save visit counts:', error)
    }
  }, [])

  // 获取单个书签的访问次数
  const getVisitCount = useCallback(
    (id: string): number => {
      const counts = getVisitCounts()
      return counts[id] || 0
    },
    [getVisitCounts]
  )

  // 增加访问次数
  const incrementVisitCount = useCallback(
    (id: string) => {
      const counts = getVisitCounts()
      counts[id] = (counts[id] || 0) + 1
      saveVisitCounts(counts)

      // 更新内存中的书签数据
      const updateVisitCount = (nodes: BookmarkNode[]): BookmarkNode[] => {
        return nodes.map(node => {
          if (node.id === id) {
            return { ...node, visitCount: counts[id] }
          }
          if (node.children) {
            return { ...node, children: updateVisitCount(node.children) }
          }
          return node
        })
      }

      setBookmarks(prev => updateVisitCount(prev))
    },
    [getVisitCounts, saveVisitCounts]
  )

  // 对书签数据进行排序，文件夹优先前置
  const sortBookmarks = useCallback((nodes: BookmarkNode[]): BookmarkNode[] => {
    return [...nodes]
      .map(node => ({
        ...node,
        children: node.children ? sortBookmarks(node.children) : undefined,
      }))
      .sort((a, b) => {
        // 文件夹（没有 url）排在前面
        const aIsFolder = !a.url
        const bIsFolder = !b.url

        if (aIsFolder && !bIsFolder) return -1
        if (!aIsFolder && bIsFolder) return 1

        // 同类型的情况下，按访问次数排序（书签），或按字母顺序排序（文件夹）
        if (!aIsFolder && !bIsFolder) {
          // 都是书签，按访问次数降序排序
          const aCount = a.visitCount || 0
          const bCount = b.visitCount || 0
          if (aCount !== bCount) return bCount - aCount
        }

        // 按标题字母顺序排序
        return (a.title || '').localeCompare(b.title || '')
      })
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

  const initBookmarks = useCallback(async () => {
    const response = (await requestBookmarkTree()) as {
      bookmarks: BookmarkNode[]
    }
    const group = response.bookmarks[0].children?.find(
      (i: BookmarkNode) => i.folderType === 'bookmarks-bar'
    )
    const bookmarks = group?.children || []

    Logger.info('Bookmarks fetched successfully', bookmarks, group)

    if (response && response.bookmarks) {
      // 加载访问次数数据
      const visitCounts = getVisitCounts()

      // 为书签添加访问次数
      const addVisitCounts = (nodes: BookmarkNode[]): BookmarkNode[] => {
        return nodes.map(node => {
          const visitCount = visitCounts[node.id] || 0
          const updatedNode = { ...node, visitCount }
          if (updatedNode.children) {
            updatedNode.children = addVisitCounts(updatedNode.children)
          }
          return updatedNode
        })
      }

      const bookmarksWithVisits = addVisitCounts([group] as BookmarkNode[])
      // 对书签数据进行排序，文件夹优先前置（递归排序所有层级）
      const sortedBookmarks = sortBookmarks(bookmarksWithVisits)
      setBookmarks(sortedBookmarks)
      setGroups([
        { ...(sortedBookmarks[0] || ({} as BookmarkNode)), main: true },
      ])
      setFlatMarks(
        createdFlatList<BookmarkNode>(response.bookmarks, node => {
          return !!node.url
        })
      )
    }
    setIsLoading(false)
  }, [getVisitCounts, sortBookmarks])

  useEffect(() => {
    initBookmarks()
  }, [initBookmarks])

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
  }, [filteredBookmarks, searchQuery, bookmarks])
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
    sortBookmarks,
    incrementVisitCount,
    getVisitCount,
    isExpanded: isVisible,
    togglePanel,
    handleClose,
  }
}
