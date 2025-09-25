import { Folder, Link, ChevronDown, ChevronRight } from 'lucide-react'
import { BookmarkNode } from '@/hooks/useBookmarks'
import { Button } from '@/components/ui/button'
import { getFaviconUrl } from '@/core/favicon'
import { Badge } from './ui/badge'
import { useState } from 'react'
import { MESSAGE_ACTIONS } from '../constants'

interface CollapsibleBookmarkTreeProps {
  bookmarks: BookmarkNode[]
}

const openNewTab = (url?: string) => {
  if (!url) return
  chrome.runtime.sendMessage({
    action: MESSAGE_ACTIONS.OPEN_TAB,
    url,
  })
}

export default function CollapsibleBookmarkTree({
  bookmarks,
}: CollapsibleBookmarkTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderBookmarks = (
    nodes: BookmarkNode[],
    level = 0
  ): React.JSX.Element[] => {
    return nodes.flatMap(node => {
      // 跳过根级别的默认文件夹
      if (
        level === 0 &&
        (!node.title ||
          node.title === 'Bookmarks bar' ||
          node.title === 'Other bookmarks')
      ) {
        return node.children ? renderBookmarks(node.children, level) : []
      }

      const isExpanded = expandedFolders.has(node.id)
      const elements: React.JSX.Element[] = []

      // 当前节点
      const element = (
        <div
          key={node.id}
          className={`${level > 0 ? `ml-${level * 4}` : ''} mb-1`}
        >
          {node.url ? (
            // 书签项
            <div className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group'>
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
                <div className='text-xs text-gray-500 truncate'>{node.url}</div>
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
              className='flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors cursor-pointer rounded-lg'
              onClick={() => toggleFolder(node.id)}
            >
              {node.children && node.children.length > 0 ? (
                isExpanded ? (
                  <ChevronDown className='w-4 h-4 text-gray-400' />
                ) : (
                  <ChevronRight className='w-4 h-4 text-gray-400' />
                )
              ) : (
                <div className='w-4 h-4' />
              )}
              <Folder className='w-4 h-4 text-gray-400' />
              <span className='text-sm font-medium text-gray-700 flex-1'>
                {node.title || '未命名文件夹'}
              </span>
              {node.children && node.children.length > 0 && (
                <Badge className='text-xs'>
                  {node.children.filter(child => child.url).length}
                </Badge>
              )}
            </div>
          )}
        </div>
      )

      elements.push(element)

      // 子节点（如果展开）
      if (!node.url && node.children && isExpanded) {
        elements.push(...renderBookmarks(node.children, level + 1))
      }

      return elements
    })
  }

  return <div className='space-y-1'>{renderBookmarks(bookmarks)}</div>
}
