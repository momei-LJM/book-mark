import { Folder } from 'lucide-react'

export const Empty: React.FC = () => {
  return (
    <div className='text-center py-8'>
      <Folder className='w-8 h-8 text-gray-300 mx-auto mb-2' />
      <p className='text-sm text-gray-500'>暂无书签</p>
    </div>
  )
}
