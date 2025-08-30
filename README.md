# 书签烂插件 Bookmark Plugin

这是一个使用 React + TypeScript + Vite 编写的 Chrome 浏览器书签管理插件项目。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Chrome Extension Manifest V3** - 浏览器扩展

## 功能简介

- 书签管理（添加、编辑、删除）
- 书签分组/文件夹
- 快速搜索与访问
- 批量操作书签
- 书签去重与失效检测

## 项目结构

- `src/`：React + TypeScript 源码
  - `components/`：React 组件
  - `main.tsx`：应用入口
  - `background.ts`：扩展后台脚本
- `public/`：插件静态资源（manifest.json 等）
- `dist/`：编译输出
- `index.html`：Vite 入口文件

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 安装扩展

1. 运行 `npm run build` 构建项目
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 文件夹

6. 安装依赖：`npm install`
7. 编译 TypeScript：`npm run build`
8. 在 Chrome 扩展管理页面加载 `public` 文件夹，确保 `dist` 目录已生成 JS 文件。

## 说明

本项目为初始模板，可根据实际需求扩展功能。
