import { createRoot } from 'react-dom/client'
import { createShadowRoot, injectStyles } from '../core/shadow-dom'
import { ContentApp } from '../components/content-app'

const bootstrap = async () => {
  const { reactContainer, shadowRoot } = createShadowRoot()
  await injectStyles(shadowRoot)
  const root = createRoot(reactContainer)
  root.render(<ContentApp />)
}

bootstrap()
