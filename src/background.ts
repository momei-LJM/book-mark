// Chrome Extension Background Script (TypeScript)
// TypeScript: 使用全局 chrome API，无需 import 类型

chrome.runtime.onInstalled.addListener(() => {
  console.log('Bookmark plugin installed.');
  // 获取所有书签并打印
  chrome.bookmarks.getTree((bookmarkTreeNodes: chrome.bookmarks.BookmarkTreeNode[]) => {
    console.log('当前书签树:', bookmarkTreeNodes);
  });
});
