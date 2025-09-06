import { ScrollArea } from '@radix-ui/react-scroll-area'
import BookmarkTree from './bookmark-tree'
import { Empty } from './empty'
import { NoMatch } from './no-match'
import { SearchBlock } from './search-block'
import { Statistics } from './statiscs'
import { Separator } from './ui/separator'

interface BookmarkPanelProps {
  bookmarks: any[]
  searchQuery: string
  filter: (query: string) => void
  statistic: any
  onClose: () => void
}

export const BookmarkPanel: React.FC<BookmarkPanelProps> = ({
  bookmarks,
  searchQuery,
  filter,
  statistic,
  onClose,
}) => {
  return (
    <div className='w-96 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden'>
      <div className='drag-handle bg-gray-100 px-4 py-2 cursor-move flex items-center justify-between'>
        <span className='font-semibold'>Bookmark Manager</span>
        <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
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
