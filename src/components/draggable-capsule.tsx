import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from 'react-spring'
import { useState, useRef, useEffect } from 'react'

interface DraggableCapsuleProps {
  onClick: () => void
  isExpanded: boolean
  children?: React.ReactNode
}

export const DraggableCapsule: React.FC<DraggableCapsuleProps> = ({
  onClick,
  isExpanded,
  children,
}) => {
  const [position, setPosition] = useState({
    x: window.innerWidth - 200, // 调整初始位置
    y: window.innerHeight - 80, // 放在底部
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)
  const capsuleRef = useRef<HTMLDivElement>(null)

  // 监听窗口大小变化，确保胶囊位置有效
  useEffect(() => {
    const handleResize = () => {
      const capsuleWidth = 168 // 根据展开状态动态调整宽度
      const capsuleHeight = 48 // 胶囊高度
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, window.innerWidth - capsuleWidth)),
        y: Math.max(0, Math.min(prev.y, window.innerHeight - capsuleHeight)),
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isExpanded])

  // 拖拽手势
  const bind = useDrag(
    ({ active, movement: [mx, my], memo = position }) => {
      setIsDragging(active)
      if (active) {
        setIsBouncing(false)
        // 拖拽过程中允许在整个屏幕移动
        const newX = memo.x + mx
        const newY = memo.y + my
        setPosition({ x: newX, y: newY })
      } else {
        // 拖拽结束时检查边界并回弹
        const capsuleWidth = 168 // 根据展开状态动态调整宽度
        const capsuleHeight = 48
        let finalX = position.x
        let finalY = position.y
        let needsBounce = false

        // 检查水平边界
        if (position.x < 0) {
          finalX = 0
          needsBounce = true
        } else if (position.x > window.innerWidth - capsuleWidth) {
          finalX = window.innerWidth - capsuleWidth
          needsBounce = true
        }

        // 检查垂直边界
        if (position.y < 0) {
          finalY = 0
          needsBounce = true
        } else if (position.y > window.innerHeight - capsuleHeight) {
          finalY = window.innerHeight - capsuleHeight
          needsBounce = true
        }

        // 如果位置需要调整，使用动画回弹
        if (needsBounce) {
          setIsBouncing(true)
          setPosition({ x: finalX, y: finalY })
          // 短暂延迟后重置回弹状态
          setTimeout(() => setIsBouncing(false), 300)
        }
      }
      return memo
    },
    {
      filterTaps: true, // 允许点击事件通过
      // 移除 bounds 限制，允许在整个屏幕拖拽
    }
  )

  // 胶囊动画
  const capsuleSpring = useSpring({
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    scale: isExpanded ? 1.05 : isDragging ? 1.02 : isBouncing ? 1.1 : 1,

    config: isDragging
      ? { tension: 300, friction: 30 } // 拖拽时响应更快
      : isBouncing
        ? { tension: 400, friction: 20 } // 回弹时更有弹性
        : isExpanded
          ? { tension: 250, friction: 25 } // 展开时稍微快一点
          : { tension: 200, friction: 25 }, // 折叠时平滑过渡
  })

  // 背景动画
  const backgroundSpring = useSpring({
    backgroundColor: isExpanded ? '#3b82f6' : '#2563eb',
    borderRadius: isExpanded ? '24px' : '24px',
    config: isExpanded
      ? { tension: 300, friction: 250 } // 展开时稍微快一点
      : { tension: 300, friction: 25 }, // 折叠时平滑过渡
  })

  // 面板动画
  const panelSpring = useSpring({
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded
      ? 'translateY(0px) scale(1)'
      : 'translateY(-10px) scale(0.95)',
    config: { tension: 300, friction: 25 },
  })

  return (
    <animated.div
      ref={capsuleRef}
      {...bind()}
      style={capsuleSpring}
      className='fixed z-50 select-none'
    >
      {/* 胶囊主体 */}
      <animated.div
        style={backgroundSpring}
        className='h-12 shadow-lg transition-all duration-200 flex items-center justify-center cursor-move hover:shadow-xl border-2 border-white/20 backdrop-blur-sm bg-opacity-95 rounded-3xl'
        onClick={e => {
          // 只有在没有拖拽时才触发点击
          if (!isDragging && !e.defaultPrevented) {
            onClick()
          }
        }}
      >
        <div className='drag-handle flex-1 h-full bg-gray-100 px-4 py-2 cursor-move flex items-center justify-between rounded-3xl'>
          <span className='font-semibold'>Bookmark Manager</span>
        </div>
      </animated.div>

      {/* 展开的面板 */}
      {isExpanded && children && (
        <animated.div style={panelSpring} className='absolute top-14 left-0'>
          {children}
        </animated.div>
      )}
    </animated.div>
  )
}
