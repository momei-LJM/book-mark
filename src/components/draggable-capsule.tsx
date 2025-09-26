import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from 'react-spring'
import { useState, useRef, useEffect } from 'react'

interface DraggableCapsuleProps {
  isExpanded: boolean
  children?: React.ReactNode
}

export const DraggableCapsule: React.FC<DraggableCapsuleProps> = ({
  isExpanded,
  children,
}) => {
  const PANEL_W = 720
  const PANEL_H = 530
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - PANEL_W / 2, // 居中
    y: window.innerHeight / 2 - PANEL_H / 2, // 居中
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)
  const capsuleRef = useRef<HTMLDivElement>(null)

  // 监听窗口大小变化，确保胶囊位置有效
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, window.innerWidth - PANEL_W / 2)),
        y: Math.max(0, Math.min(prev.y, window.innerHeight - PANEL_H / 2)),
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
        let finalX = position.x
        let finalY = position.y
        let needsBounce = false

        // 检查水平边界
        if (position.x < 0) {
          finalX = 0
          needsBounce = true
        } else if (position.x > window.innerWidth - PANEL_W) {
          finalX = window.innerWidth - PANEL_W
          needsBounce = true
        }

        // 检查垂直边界
        if (position.y < 0) {
          finalY = 0
          needsBounce = true
        } else if (position.y > window.innerHeight - PANEL_H) {
          finalY = window.innerHeight - PANEL_H
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
      pointer: {
        keys: false,
      },
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
      {/* <animated.div
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
      </animated.div> */}

      {/* 展开的面板 */}
      {isExpanded && children && (
        <animated.div
          style={panelSpring}
          className='absolute top-14 left-0 flex flex-row gap-2'
        >
          {children}
        </animated.div>
      )}
    </animated.div>
  )
}
