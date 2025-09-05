import React, { useState, useEffect, useMemo } from 'react'
import { Search, Folder, Link, Star, Settings } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface BookmarkNode {
  id: string
  title: string
  url?: string
  children?: BookmarkNode[]
  dateAdded?: number
}

const Popup: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 发送消息到background获取书签
    chrome.runtime.sendMessage({ action: 'get-bookmarks' }, response => {
      if (response && response.bookmarks) {
        setBookmarks(response.bookmarks as BookmarkNode[])
      }
      setIsLoading(false)
    })
  }, [])

  const getFaviconUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}`
    } catch {
      return ''
    }
  }

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

  const renderBookmarks = (
    nodes: BookmarkNode[],
    level = 0
  ): React.JSX.Element[] => {
    return nodes
      .flatMap(node => {
        // 跳过根级别的默认文件夹
        if (
          level === 0 &&
          (!node.title ||
            node.title === 'Bookmarks bar' ||
            node.title === 'Other bookmarks')
        ) {
          return node.children ? renderBookmarks(node.children, level) : []
        }

        const element = (
          <div key={node.id} className={`${level > 0 ? 'ml-4' : ''} mb-2`}>
            {node.url ? (
              <div className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group'>
                <img
                  src={getFaviconUrl(node.url)}
                  alt=''
                  className='w-4 h-4 flex-shrink-0'
                  onError={e => {
                    e.currentTarget.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxMEgxMEwxMyAxM1YxMEgxNVYxM0gxMFYxMEgxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+'
                  }}
                />
                <div className='flex-1 min-w-0'>
                  <button
                    onClick={() => {
                      if (node.url) {
                        chrome.tabs.create({ url: node.url })
                      }
                    }}
                    className='text-sm font-medium text-gray-900 hover:text-blue-600 truncate block text-left w-full'
                    title={node.title || node.url}
                  >
                    {node.title || node.url}
                  </button>
                  <p className='text-xs text-gray-500 truncate'>{node.url}</p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={() => navigator.clipboard.writeText(node.url!)}
                >
                  <Link className='w-3 h-3' />
                </Button>
              </div>
            ) : (
              <div className='flex items-center gap-2 p-2'>
                <Folder className='w-4 h-4 text-gray-400' />
                <span className='text-sm font-medium text-gray-700'>
                  {node.title || '未命名文件夹'}
                </span>
                {node.children && node.children.length > 0 && (
                  <Badge variant='secondary' className='text-xs'>
                    {node.children.filter(child => child.url).length}
                  </Badge>
                )}
              </div>
            )}
            {node.children &&
              node.children.length > 0 &&
              renderBookmarks(node.children, level + 1)}
          </div>
        )

        return [element]
      })
      .flat()
  }

  if (isLoading) {
    return (
      <Card className='w-96'>
        <CardContent className='flex items-center justify-center p-8'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
            <p className='text-sm text-gray-500'>加载书签中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-96 max-h-[600px] flex flex-col'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Star className='w-5 h-5 text-yellow-500' />
              书签管理器
            </CardTitle>
            <CardDescription className='flex items-center gap-4 mt-1'>
              <span className='flex items-center gap-1'>
                <Link className='w-3 h-3' />
                {stats.totalBookmarks} 个书签
              </span>
              <span className='flex items-center gap-1'>
                <Folder className='w-3 h-3' />
                {stats.totalFolders} 个文件夹
              </span>
            </CardDescription>
          </div>
          <Button variant='ghost' size='sm'>
            <Settings className='w-4 h-4' />
          </Button>
        </div>
      </CardHeader>

      <div className='px-6 pb-3'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='搜索书签...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <Separator />

      <CardContent className='flex-1 p-0'>
        <ScrollArea className='h-96'>
          <div className='p-4'>
            {filteredBookmarks.length > 0 ? (
              renderBookmarks(filteredBookmarks)
            ) : searchQuery ? (
              <div className='text-center py-8'>
                <Search className='w-8 h-8 text-gray-300 mx-auto mb-2' />
                <p className='text-sm text-gray-500'>未找到匹配的书签</p>
              </div>
            ) : (
              <div className='text-center py-8'>
                <Folder className='w-8 h-8 text-gray-300 mx-auto mb-2' />
                <p className='text-sm text-gray-500'>暂无书签</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default Popup
