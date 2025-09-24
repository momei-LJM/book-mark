// Chrome Extension Background Script (TypeScript)
// TypeScript: 使用全局 chrome API，无需 import 类型

import { MESSAGE_ACTIONS } from '../constants'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Bookmark plugin installed.')
  // 获取所有书签并打印
  chrome.bookmarks.getTree(
    (bookmarkTreeNodes: chrome.bookmarks.BookmarkTreeNode[]) => {
      console.log('当前书签树:', bookmarkTreeNodes)
    }
  )
})

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === MESSAGE_ACTIONS.GET_BOOKMARKS) {
    chrome.bookmarks.getTree(bookmarkTreeNodes => {
      sendResponse({ bookmarks: bookmarkTreeNodes })
    })
    return true // 保持消息通道开放
  }
  if (request.action === MESSAGE_ACTIONS.OPEN_TAB) {
    chrome.tabs.create({ url: request.url })
    sendResponse({ success: true })
  }
})
