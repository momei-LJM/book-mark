import { Folder, Link } from 'lucide-react'
import { BookmarkNode } from '@/hooks/useBookmarks'
import { Button } from '@/components/ui/button'
import { getFaviconUrl, handleFaviconError } from '@/core/favicon'
import { Badge } from './ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface BookmarkTreeProps {
  bookmarks: BookmarkNode[]
}

export default function BookmarkTree({ bookmarks }: BookmarkTreeProps) {
  const renderItem = (node: BookmarkNode) => {
    return <div key={node.id}>{node.title}</div>
  }

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
              <Popover>
                <PopoverTrigger asChild>
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
                </PopoverTrigger>
                <PopoverContent side='right' align='start'>
                  {node.children && node.children.length > 0 && (
                    <BookmarkTree bookmarks={node.children} />
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        )

        return [element]
      })
      .flat()
  }

  const nextLevelPanel = (props: { bookmarks: BookmarkNode[] }) => {
    return <div className='ml-4'>{renderBookmarks(props.bookmarks)}</div>
  }
  return <>{renderBookmarks(bookmarks)}</>
}
