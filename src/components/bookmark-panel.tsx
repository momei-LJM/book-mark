import BookmarkTree from './bookmark-tree'
import { Empty } from './empty'
import { NoMatch } from './no-match'
import { SearchBlock } from './search-block'
import { Statistics } from './statiscs'
import { Separator } from './ui/separator'
import { useContext } from 'react'
import { StoreContext } from '../core/context'
import { BookmarkNode } from '../hooks/useBookmarks'
import { ScrollArea } from './ui/scroll-area'
import BreadcrumbBookmarkTree from './breadcrumb-bookmark-tree'
import CollapsibleBookmarkTree from './collapsible-bookmark-tree'

interface BookmarkPanelProps {
  onClose: () => void
  main?: boolean
  bookmarks: BookmarkNode[]
}

export const BookmarkPanel: React.FC<BookmarkPanelProps> = ({
  main,
  bookmarks,
}) => {
  const { searchQuery, filter, statistic, isExpanded } =
    useContext(StoreContext)

  const BookTreeRender = () =>
    bookmarks.length > 0 ? (
      <CollapsibleBookmarkTree bookmarks={bookmarks} />
    ) : searchQuery ? (
      <NoMatch />
    ) : (
      <Empty />
    )

  return (
    <div className='w-96 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[300px] h-[300px] overflow-hidden'>
      {main ? (
        <>
          <Statistics statistic={statistic} />
          <div className='p-4'>
            <div className='pb-3'>
              <SearchBlock
                searchQuery={searchQuery}
                filter={filter}
                isExpanded={isExpanded}
              />
            </div>
            <Separator />
            <ScrollArea className='h-[210px]'>
              <BookTreeRender />
            </ScrollArea>
          </div>
        </>
      ) : (
        <ScrollArea className='h-[300px] p-4'>
          <BookTreeRender />
        </ScrollArea>
      )}
    </div>
  )
}
