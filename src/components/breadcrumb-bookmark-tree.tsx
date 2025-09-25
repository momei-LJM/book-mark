import { ChevronRight, Folder, Link, Home } from 'lucide-react'
import { BookmarkNode } from '@/hooks/useBookmarks'
import { Button } from '@/components/ui/button'
import { getFaviconUrl } from '@/core/favicon'
import { Badge } from './ui/badge'
import { useState } from 'react'
import { MESSAGE_ACTIONS } from '../constants'

interface BreadcrumbBookmarkTreeProps {
  bookmarks: BookmarkNode[]
}

interface BreadcrumbItem {
  id: string
  title: string
}

const openNewTab = (url?: string) => {
  if (!url) return
  chrome.runtime.sendMessage({
    action: MESSAGE_ACTIONS.OPEN_TAB,
    url,
  })
}

export default function BreadcrumbBookmarkTree({
  bookmarks,
}: BreadcrumbBookmarkTreeProps) {
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([])
  const [currentNodes, setCurrentNodes] = useState<BookmarkNode[]>(bookmarks)

  // 获取当前显示的节点（只显示当前层级）
  const getCurrentLevelNodes = () => {
    if (currentPath.length === 0) {
      // 根目录：过滤掉系统文件夹
      return bookmarks.filter(
        node =>
          node.title &&
          node.title !== 'Bookmarks bar' &&
          node.title !== 'Other bookmarks'
      )
    }
    return currentNodes
  }

  // 进入文件夹
  const enterFolder = (node: BookmarkNode) => {
    if (!node.children) return

    setCurrentPath(prev => [
      ...prev,
      { id: node.id, title: node.title || '未命名文件夹' },
    ])
    setCurrentNodes(node.children)
  }

  // 导航到特定层级
  const navigateToLevel = (index: number) => {
    if (index === -1) {
      // 回到根目录
      setCurrentPath([])
      setCurrentNodes(bookmarks)
    } else {
      // 导航到指定层级
      const newPath = currentPath.slice(0, index + 1)
      setCurrentPath(newPath)

      // 重新计算当前节点
      let nodes = bookmarks
      for (const pathItem of newPath) {
        const folder = nodes.find(n => n.id === pathItem.id)
        if (folder?.children) {
          nodes = folder.children
        }
      }
      setCurrentNodes(nodes)
    }
  }

  const displayNodes = getCurrentLevelNodes()

  return (
    <div className='space-y-3'>
      {/* 面包屑导航 */}
      <div className='flex items-center gap-1 text-xs text-gray-600 px-2'>
        <Button
          variant='ghost'
          size='sm'
          className='h-6 px-2 text-xs'
          onClick={() => navigateToLevel(-1)}
        >
          <Home className='w-3 h-3 mr-1' />
          根目录
        </Button>
        {currentPath.map((item, index) => (
          <div key={item.id} className='flex items-center gap-1'>
            <ChevronRight className='w-3 h-3 text-gray-400' />
            <Button
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-xs'
              onClick={() => navigateToLevel(index)}
            >
              {item.title}
            </Button>
          </div>
        ))}
      </div>

      {/* 当前层级的书签 */}
      <div className='space-y-1'>
        {displayNodes.map(node => (
          <div
            key={node.id}
            className='p-2 rounded-lg hover:bg-gray-50 transition-colors'
          >
            {node.url ? (
              // 书签项
              <div className='flex items-center gap-2 group'>
                <img
                  src={getFaviconUrl(node.url)}
                  alt=''
                  className='w-4 h-4 flex-shrink-0'
                />
                <div className='flex-1 min-w-0'>
                  <div
                    className='text-sm font-medium text-gray-900 hover:text-blue-600 truncate cursor-pointer'
                    title={node.title || node.url}
                    onClick={() => openNewTab(node.url)}
                  >
                    {node.title || node.url}
                  </div>
                  <div className='text-xs text-gray-500 truncate'>
                    {node.url}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={() => navigator.clipboard.writeText(node.url!)}
                  title='复制链接'
                >
                  <Link className='w-3 h-3' />
                </Button>
              </div>
            ) : (
              // 文件夹
              <div
                className='flex items-center gap-2 cursor-pointer'
                onClick={() => enterFolder(node)}
              >
                <Folder className='w-4 h-4 text-gray-400' />
                <span className='text-sm font-medium text-gray-700 flex-1'>
                  {node.title || '未命名文件夹'}
                </span>
                {node.children && node.children.length > 0 && (
                  <Badge className='text-xs'>
                    {node.children.filter(child => child.url).length}
                  </Badge>
                )}
                <ChevronRight className='w-4 h-4 text-gray-400' />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
