import { useEffect } from 'react'

export const useDocFocus = () => {
  useEffect(() => {
    const handleFocus = () => {
      window.focus()
    }
    document.addEventListener('visibilitychange', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [])
}
