import { ScrollArea } from '@radix-ui/react-scroll-area'
import hotkeys from 'hotkeys-js'
import { useEffect, useState } from 'react'
import { useBookmarks } from '../hooks/useBookmarks'
import BookmarkTree from './bookmark-tree'
import { Empty } from './empty'
import { NoMatch } from './no-match'
import { SearchBlock } from './search-block'
import { Statistics } from './statiscs'
import { Separator } from './ui/separator'

export const ContentApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { bookmarks, searchQuery, filter, statistic } = useBookmarks()
  useEffect(() => {
    // 监听快捷键 - 使用Ctrl+Alt+B避免与浏览器冲突
    hotkeys('ctrl+alt+c, command+option+c', event => {
      event.preventDefault()
      setIsVisible(!isVisible)
      console.log('Bookmark panel toggled hotkey')
    })

    // 监听来自background的命令
    chrome.runtime.onMessage.addListener(message => {
      if (message.action === 'toggle-bookmark-panel') {
        setIsVisible(!isVisible)
      }
    })

    return () => {
      hotkeys.unbind('ctrl+alt+b, command+option+b')
    }
  }, [isVisible])

  if (!isVisible) return null
  return (
    <div className='fixed top-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-hidden'>
      <div className='drag-handle bg-gray-100 px-4 py-2 cursor-move flex items-center justify-between'>
        <span className='font-semibold'>Bookmark Manager</span>
        <button
          onClick={() => setIsVisible(false)}
          className='text-gray-500 hover:text-gray-700'
        >
          ✕
        </button>
      </div>
      <Statistics statistic={statistic} />
      <div className='p-4 flex flex-col max-h-80'>
        <div className='px-6 pb-3'>
          <SearchBlock searchQuery={searchQuery} filter={filter} />
        </div>
        <Separator />
        <ScrollArea className='flex-1 overflow-auto'>
          <div className='p-4'>
            {bookmarks.length > 0 ? (
              <BookmarkTree bookmarks={bookmarks} />
            ) : searchQuery ? (
              <NoMatch />
            ) : (
              <Empty />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
