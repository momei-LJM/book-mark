import { Search } from 'lucide-react'
import { Input } from './ui/input'

interface SearchBlockProps {
  searchQuery: string
  filter: (query: string) => void
}

export const SearchBlock: React.FC<SearchBlockProps> = props => {
  const { searchQuery, filter } = props
  return (
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
      <Input
        placeholder='搜索书签...'
        value={searchQuery}
        onChange={e => filter(e.target.value)}
        className='pl-10'
      />
    </div>
  )
}
