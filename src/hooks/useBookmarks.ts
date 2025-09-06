import { useEffect, useMemo, useState } from 'react'
import { requestBookmarkTree } from '@/core/message'
import { Logger } from '../lib/utils'
export interface BookmarkNode {
  id: string
  title: string
  url?: string
  children?: BookmarkNode[]
  dateAdded?: number
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
}
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const initBookmarks = async () => {
    const response = await requestBookmarkTree()
    Logger.info('Bookmarks fetched successfully', response.bookmarks)
    if (response && response.bookmarks) {
      setBookmarks(response.bookmarks as BookmarkNode[])
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

  // 过滤书签
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks

    const filterNodes = (nodes: BookmarkNode[]): BookmarkNode[] => {
      return nodes
        .map(node => {
          const matchesSearch =
            node.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.url?.toLowerCase().includes(searchQuery.toLowerCase())

          const filteredChildren = node.children
            ? filterNodes(node.children)
            : []

          if (matchesSearch || filteredChildren.length > 0) {
            return {
              ...node,
              children:
                filteredChildren.length > 0 ? filteredChildren : node.children,
            }
          }
          return null
        })
        .filter(Boolean) as BookmarkNode[]
    }

    return filterNodes(bookmarks)
  }, [bookmarks, searchQuery])

  return {
    originalBookmarks: bookmarks,
    bookmarks: filteredBookmarks,
    filter: setSearchQuery,
    isLoading,
    statistic: stats,
    searchQuery,
  }
}
