import chokidar from 'chokidar'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const SRC = dirname(fileURLToPath(new URL('.', import.meta.url)))
const NODE = dirname(fileURLToPath(import.meta.url))

export const createFileWatcher = (action: () => void) => {
  let isReady = false
  console.log('Setting up file watcher...', import.meta.url, SRC, NODE)

  chokidar
    .watch(SRC, {
      ignored: [
        path => {
          return dirname(path) === NODE
        },
        (path, stats) => {
          return (
            !!stats?.isFile() &&
            !['.ts', '.tsx', '.css', '.js'].some(ext => path.endsWith(ext))
          )
        },
      ],
    })
    .on('ready', () => {
      console.log('🔍 File watcher is ready. Watching for changes...')
      isReady = true
    })
    .on('change', path => {
      if (isReady) {
        console.log(`📁 File changed: ${path}`)
        action()
      }
    })
    .on('add', path => {
      if (isReady) {
        console.log(`➕ File added: ${path}`)
        action()
      }
    })
    .on('unlink', path => {
      if (isReady) {
        console.log(`❌ File removed: ${path}`)
        action()
      }
    })
  return chokidar
}
