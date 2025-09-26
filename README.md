# 书签管理器

一个 简介美观的 Chrome 浏览器书签管理扩展，提供键盘导航和搜索功能。

## 功能特性

- 键盘导航：使用方向键在书签间移动
- 快速搜索：支持书签标题和 URL 搜索
- 文件夹管理：支持书签文件夹的层级浏览
- 快捷键：Command+Shift+B (Mac) / Ctrl+Shift+B (Windows/Linux) 切换显示

## 技术栈

- React 18 + TypeScript
- Vite + Tailwind CSS
- Chrome Extension Manifest V3

## 安装使用

1. 构建项目：`npm run build`
2. 打开 Chrome 扩展管理页面
3. 加载 `dist` 文件夹
4. 使用快捷键打开扩展

## 操作说明

- **打开/关闭**：Command+Shift+B / Ctrl+Shift+B
- **导航**：↑↓ 键选择书签
- **进入文件夹**：Enter 键
- **返回上级**：← 键
- **搜索**：输入关键词进行搜索

## 开发

```bash
npm install
npm run dev
npm run build
```

## 许可证

MIT
