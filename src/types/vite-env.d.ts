declare module 'virtual:content-css' {
  const css: string
  export default css
}

declare module '*.css?inline' {
  const css: string
  export default css
}

declare const __DEV__: boolean
