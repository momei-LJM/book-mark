import { Empty } from './empty'
import { NoMatch } from './no-match'
import { SearchBlock } from './search-block'
import { Statistics } from './statiscs'
import { Separator } from './ui/separator'
import { useContext } from 'react'
import { StoreContext } from '../core/context'
import { BookmarkNode } from '../hooks/useBookmarks'
import BreadcrumbBookmarkTree from './breadcrumb-bookmark-tree'

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
      <BreadcrumbBookmarkTree bookmarks={bookmarks} />
    ) : searchQuery ? (
      <NoMatch />
    ) : (
      <Empty />
    )

  return (
    <div className='w-[700px] bg-gray-50 border border-gray-300 rounded-lg shadow-2xl max-h-[450px] h-[450px] overflow-hidden'>
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
            <BookTreeRender />
          </div>
        </>
      ) : (
        <BookTreeRender />
      )}
    </div>
  )
}
