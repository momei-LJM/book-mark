import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Bookmark Manager',
  version: '1.0.0',
  description:
    'A Chrome bookmark manager extension written in React + TypeScript with Vite.',
  action: {
    default_popup: 'src/entry/main.tsx',
    default_title: 'Bookmark Manager',
  },
  background: {
    service_worker: 'src/entry/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      js: ['src/entry/content.tsx'],
      matches: ['<all_urls>'],
    },
  ],

  web_accessible_resources: [
    {
      resources: ['_favicon/*'],
      matches: ['<all_urls>'],
      extension_ids: ['*'],
    },
  ],
  permissions: ['bookmarks', 'storage', 'activeTab', 'tabs', 'favicon'],
  host_permissions: ['<all_urls>'],
})
