import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Settings, Star } from 'lucide-react'
import React from 'react'
import BookmarkTree from './bookmark-tree'
import { Empty } from './empty'
import { NoMatch } from './no-match'
import { SearchBlock } from './search-block'
import { Statistics } from './statiscs'
const Popup: React.FC = () => {
  const { bookmarks, searchQuery, filter, isLoading, statistic } =
    useBookmarks()

  if (isLoading) {
    return (
      <Card className='w-96'>
        <CardContent className='flex items-center justify-center p-8'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
            <p className='text-sm text-gray-500'>加载书签中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-96 max-h-[600px] flex flex-col'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Star className='w-5 h-5 text-yellow-500' />
              书签管理器
            </CardTitle>
            <CardDescription className='flex items-center gap-4 mt-1'>
              <Statistics statistic={statistic} />
            </CardDescription>
          </div>
          <Button variant='ghost' size='sm'>
            <Settings className='w-4 h-4' />
          </Button>
        </div>
      </CardHeader>

      <div className='px-6 pb-3'>
        <SearchBlock searchQuery={searchQuery} filter={filter} />
      </div>

      <Separator />

      <CardContent className='flex-1 p-0'>
        <ScrollArea className='h-96'>
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
      </CardContent>
    </Card>
  )
}

export default Popup
