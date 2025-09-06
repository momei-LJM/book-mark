import { Badge, Folder, Link } from 'lucide-react'
import { BookmarkNode } from '@/hooks/useBookmarks'
import { Button } from '@/components/ui/button'
import { getFaviconUrl, handleFaviconError } from '@/core/favicon'

interface BookmarkTreeProps {
  bookmarks: BookmarkNode[]
}

export default function BookmarkTree({ bookmarks }: BookmarkTreeProps) {
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
                  onError={e => handleFaviconError(e, node.url!)}
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
                  <Badge className='text-xs'>
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
  return <>{renderBookmarks(bookmarks)}</>
}
