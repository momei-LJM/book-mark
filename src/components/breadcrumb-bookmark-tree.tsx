import { ChevronRight, Link, Home, Slash } from 'lucide-react'
import { BookmarkNode } from '@/hooks/useBookmarks'
import { Button } from '@/components/ui/button'
import { getFaviconUrl } from '@/core/favicon'
import { Badge } from './ui/badge'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useHotkeys } from '../hooks/useHotkeys'
import { MESSAGE_ACTIONS } from '../constants'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { ScrollArea } from './ui/scroll-area'

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
const Folder = ({ className }: { className?: string }) => {
  const src =
    typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL
      ? chrome.runtime.getURL('icons/folder.png')
      : '/icons/folder.png'
  return <img src={src} alt='' className={className} />
}
export default function BreadcrumbBookmarkTree({
  bookmarks,
}: BreadcrumbBookmarkTreeProps) {
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([])
  const [currentNodes, setCurrentNodes] = useState<BookmarkNode[]>(bookmarks)
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // 获取当前显示的节点（只显示当前层级）
  const getCurrentLevelNodes = () => {
    if (currentPath.length === 0) {
      // 根目录：过滤掉系统文件夹
      const res = bookmarks.filter(
        node =>
          node.title &&
          node.title !== 'Bookmarks bar' &&
          node.title !== 'Other bookmarks'
      )

      return res
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
  const navigateToLevel = useCallback(
    (index: number) => {
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
    },
    [bookmarks, currentPath]
  )

  const displayNodes = getCurrentLevelNodes()

  // 使用 useHotkeys 监听上下键和回车
  const handleHotkey = useCallback(
    (e: KeyboardEvent) => {
      if (displayNodes.length === 0) return
      if (e.key === 'ArrowDown') {
        setActiveIndex(idx => (idx + 1) % displayNodes.length)
      } else if (e.key === 'ArrowUp') {
        setActiveIndex(
          idx => (idx - 1 + displayNodes.length) % displayNodes.length
        )
      } else if (e.key === 'Enter') {
        const node = displayNodes[activeIndex]
        if (node.url) {
          openNewTab(node.url)
        } else if (node.children) {
          enterFolder(node)
          setActiveIndex(0)
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentPath.length > 0) {
          navigateToLevel(currentPath.length - 2)
          setActiveIndex(0)
        }
      }
    },
    [displayNodes, activeIndex, currentPath, navigateToLevel]
  )
  useHotkeys('up,down,left,enter', handleHotkey)

  // 当 activeIndex 改变时，滚动到对应的元素
  useEffect(() => {
    if (listRef.current && displayNodes.length > 0) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }
  }, [activeIndex, displayNodes.length])

  return (
    <div className='space-y-3'>
      {/* 面包屑导航 */}
      <div className='p-[10px]'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem
              className='cursor-pointer'
              onClick={() => navigateToLevel(-1)}
            >
              <Home className='w-[16px] h-[16px] mr-1' />
            </BreadcrumbItem>
            {currentPath.map((item, index) => (
              <>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem className='cursor-pointer'>
                  <BreadcrumbLink onClick={() => navigateToLevel(index)}>
                    {item.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <ScrollArea className='h-[280px]'>
        <div className='space-y-1 w-[660px]' ref={listRef}>
          {displayNodes.map((node, idx) => (
            <div
              key={node.id}
              className={`p-2 rounded-lg transition-colors ${activeIndex === idx ? 'bg-gray-100' : 'hover:bg-[#f3f4f6a4]'}`}
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
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeIndex === idx ? 'opacity-100' : ''}`}
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
                  <Folder className='w-[24px]' />
                  <span className='text-sm font-medium text-gray-700 flex-1'>
                    {node.title || '未命名文件夹'}
                  </span>
                  {node.children && node.children.length > 0 && (
                    <Badge className='text-xs rounded-[3px]'>
                      {node.children.filter(child => child.url).length}
                    </Badge>
                  )}
                  <ChevronRight className='w-4 h-4 text-gray-400' />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
