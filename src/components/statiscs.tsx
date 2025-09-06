import { Folder, Link } from 'lucide-react'

interface StatisticProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  statistic: {
    totalBookmarks: number
    totalFolders: number
  }
}

export const Statistics: React.FC<StatisticProps> = ({
  statistic,
  className,
}) => {
  return (
    <div className={`flex flex-rowl gap-2 p-2 ${className}`}>
      <span className='flex items-center gap-1'>
        <Link className='w-3 h-3' />
        {statistic.totalBookmarks} 个书签
      </span>
      <span className='flex items-center gap-1'>
        <Folder className='w-3 h-3' />
        {statistic.totalFolders} 个文件夹
      </span>
    </div>
  )
}
