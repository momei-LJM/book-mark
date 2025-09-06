# Chrome Extension Hot Reload Setup

CRXJS plugin has been successfully added to your project! 🎉

## How to use:

### 1. Start development server

```bash
pnpm dev
```

### 2. Load extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `dist` folder from your project

### 3. Test the draggable capsule

- **Click the blue capsule** to open/close the bookmark panel
- **Drag the capsule** to move it anywhere on the screen
- **Use keyboard shortcut** `Ctrl+Alt+C` (or `Cmd+Option+C` on Mac) as alternative
- The capsule shows a search icon when closed and an X when the panel is open

## Features:

- ✅ Hot Module Replacement (HMR)
- ✅ Automatic extension reload
- ✅ Tailwind CSS v3 support
- ✅ Shadow DOM compatibility
- ✅ TypeScript support
- ✅ **Draggable Capsule**: Click the floating blue capsule to toggle the bookmark panel
- ✅ **Smooth Animations**: Powered by React Spring for fluid interactions
- ✅ **Drag & Drop**: Move the capsule anywhere on the screen

## Development commands:

- `pnpm dev` - Start development with hot reload
- `pnpm build` - Build for production
- `pnpm watch` - Build and watch for changes

## Notes:

- The development server runs on port 5173
- Extensions files are generated in the `dist/` directory
- Make sure to load the `dist` folder (not the root folder) as an unpacked extension
