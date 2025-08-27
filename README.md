# 书签烂插件 Bookmark Plugin

这是一个使用 TypeScript 编写的 Chrome 浏览器书签管理插件项目。

## 功能简介

- 书签管理（添加、编辑、删除）
- 书签分组/文件夹
- 快速搜索与访问
- 批量操作书签
- 书签去重与失效检测

## 项目结构

- `src/`：TypeScript 源码
- `public/`：插件静态资源（manifest、popup.html 等）
- `dist/`：编译输出

## 开发

1. 安装依赖：`npm install`
2. 编译 TypeScript：`npm run build`
3. 在 Chrome 扩展管理页面加载 `public` 文件夹，确保 `dist` 目录已生成 JS 文件。

## 说明

本项目为初始模板，可根据实际需求扩展功能。
