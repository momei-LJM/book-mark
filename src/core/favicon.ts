export const getFaviconUrl = (u: string): string => {
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', u)
  url.searchParams.set('size', '32')
  return url.toString()
}
