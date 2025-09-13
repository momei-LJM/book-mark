import { ScrollArea } from '@radix-ui/react-scroll-area'
import BookmarkTree from './bookmark-tree'
import { Empty } from './empty'
import { NoMatch } from './no-match'
import { SearchBlock } from './search-block'
import { Statistics } from './statiscs'
import { Separator } from './ui/separator'
import { useContext } from 'react'
import { StoreContext } from '../core/context'
import { BookmarkNode } from '../hooks/useBookmarks'

interface BookmarkPanelProps {
  onClose: () => void
  main?: boolean
  bookmarks: BookmarkNode[]
}

export const BookmarkPanel: React.FC<BookmarkPanelProps> = ({
  main,
  bookmarks,
}) => {
  const { searchQuery, filter, statistic } = useContext(StoreContext)

  const BookTreeRender = () =>
    bookmarks.length > 0 ? (
      <BookmarkTree bookmarks={bookmarks} />
    ) : searchQuery ? (
      <NoMatch />
    ) : (
      <Empty />
    )

  return (
    <div className='w-96 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden'>
      {main ? (
        <>
          <Statistics statistic={statistic} />
          <div className='p-4 flex flex-col max-h-80'>
            <div className='pb-3'>
              <SearchBlock searchQuery={searchQuery} filter={filter} />
            </div>
            <Separator />
            <ScrollArea className='flex-1 overflow-auto'>
              <div className='p-4'>
                <BookTreeRender />
              </div>
            </ScrollArea>
          </div>
        </>
      ) : (
        <BookTreeRender />
      )}
    </div>
  )
}
