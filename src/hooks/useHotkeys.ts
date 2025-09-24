import hotkeys from 'hotkeys-js'
import { useEffect } from 'react'

export const useHotkeys = (
  keys: string,
  callback: (event: KeyboardEvent) => void
) => {
  useEffect(() => {
    hotkeys(keys, event => {
      event.preventDefault()
      callback(event)
    })
    return () => hotkeys.unbind(keys)
  }, [keys, callback])
}
