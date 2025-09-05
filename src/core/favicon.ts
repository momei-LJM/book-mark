export const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    // 优先使用网站自己的favicon.ico
    return `${urlObj.protocol}//${hostname}/favicon.ico`
  } catch {
    return ''
  }
}

// 处理favicon加载失败的多级fallback
export const handleFaviconError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  url: string
) => {
  const img = e.currentTarget
  const currentSrc = img.src

  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    // 第一次失败，尝试使用DuckDuckGo服务
    if (currentSrc.includes('/favicon.ico')) {
      img.src = `https://icons.duckduckgo.com/ip3/${hostname}.ico`
      return
    }

    // 第二次失败，尝试使用Yandex服务
    if (currentSrc.includes('duckduckgo.com')) {
      img.src = `https://favicon.yandex.net/favicon/${hostname}`
      return
    }

    // 第三次失败，使用默认图标
    if (currentSrc.includes('yandex.net')) {
      img.src =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04IDRMMTIgOEw4IDEyTDQgOEw4IDRaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPg=='
      return
    }
  } catch {
    // 如果URL解析失败，直接使用默认图标
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04IDRMMTIgOEw4IDEyTDQgOEw4IDRaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPg=='
  }
}
