// Chrome Extension Popup Script (TypeScript)



function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch {
    return '';
  }
}

function renderBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[], container: HTMLElement) {
  nodes.forEach(node => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '6px';
    if (node.url) {
      const favicon = document.createElement('img');
      favicon.src = getFaviconUrl(node.url);
      favicon.alt = '';
      favicon.width = 16;
      favicon.height = 16;
      div.appendChild(favicon);
      const link = document.createElement('a');
      link.href = node.url;
      link.target = '_blank';
      link.textContent = node.title || node.url;
      div.appendChild(link);
    } else {
      div.innerHTML = `<strong>${node.title || '文件夹'}</strong>`;
    }
    container.appendChild(div);
    if (node.children && node.children.length > 0) {
      renderBookmarks(node.children, container);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;
  chrome.bookmarks.getTree((tree: chrome.bookmarks.BookmarkTreeNode[]) => {
    renderBookmarks(tree, app);
  });
});
