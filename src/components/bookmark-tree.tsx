import { Folder, Link } from 'lucide-react'
import { BookmarkNode } from '@/hooks/useBookmarks'
import { Button } from '@/components/ui/button'
import { getFaviconUrl } from '@/core/favicon'
import { Badge } from './ui/badge'
import { useContext } from 'react'
import { StoreContext } from '../core/context'
import { MESSAGE_ACTIONS } from '../constants'

interface BookmarkTreeProps {
  bookmarks: BookmarkNode[]
}
const openNewTab = (url?: string) => {
  if (!url) return
  chrome.runtime.sendMessage({
    action: MESSAGE_ACTIONS.OPEN_TAB,
    url,
  })
}
export default function BookmarkTree({ bookmarks }: BookmarkTreeProps) {
  const { onAddGroup } = useContext(StoreContext)
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
          return []
        }

        const element = (
          <div key={node.id} className={`${level > 0 ? 'ml-4' : ''} mb-2`}>
            {node.url ? (
              <div className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group'>
                <img
                  src={getFaviconUrl(node.url)}
                  alt=''
                  className='w-4 h-4 flex-shrink-0'
                />
                <div className='flex-1'>
                  <div
                    className='text-sm font-medium text-gray-900 hover:text-blue-600 truncate block text-left w-full max-w-[200px] cursor-pointer'
                    title={node.title || node.url}
                    onClick={() => openNewTab(node.url)}
                  >
                    <span className='truncate'>{node.title || node.url}</span>
                  </div>
                  <div className='text-xs text-gray-500 truncate max-w-[200px] cursor-pointer'>
                    {node.url}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigator.clipboard.writeText(node.url!)}
                  title='复制链接'
                >
                  <Link className='w-3 h-3' />
                </Button>
              </div>
            ) : (
              <div
                className='flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors'
                onMouseEnter={() => onAddGroup(node.id, node.parentId)}
              >
                <Folder className='w-4 h-4 text-gray-400' />
                <span className='text-sm font-medium text-gray-700'>
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

        return [element]
      })
      .flat()
  }
  return <>{renderBookmarks(bookmarks)}</>
}
