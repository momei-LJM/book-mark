import { Search } from 'lucide-react'
import React from 'react'

export const NoMatch: React.FC = () => {
  return (
    <div className='text-center py-8'>
      <Search className='w-8 h-8 text-gray-300 mx-auto mb-2' />
      <p className='text-sm text-gray-500'>未找到匹配的书签</p>
    </div>
  )
}
