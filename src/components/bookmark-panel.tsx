import { ScrollArea } from '@radix-ui/react-scroll-area'
import BookmarkTree from './bookmark-tree'
import { Empty } from './empty'
import { NoMatch } from './no-match'
import { SearchBlock } from './search-block'
import { Statistics } from './statiscs'
import { Separator } from './ui/separator'
import { useContext } from 'react'
import { StoreContext } from '../core/context'

interface BookmarkPanelProps {
  onClose: () => void
}

export const BookmarkPanel: React.FC<BookmarkPanelProps> = () => {
  const { bookmarks, searchQuery, filter, statistic } = useContext(StoreContext)
  return (
    <div className='w-96 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden'>
      <Statistics statistic={statistic} />
      <div className='p-4 flex flex-col max-h-80'>
        <div className='pb-3'>
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
