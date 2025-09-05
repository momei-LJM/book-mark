import { MESSAGE_ACTIONS } from '../constants'

/**
 * get all bookmark tree from background
 * @returns
 */
export const requestBookmarkTree = () => {
  return chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.GET_BOOKMARKS })
}
