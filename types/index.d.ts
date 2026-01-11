// Extend Nuxt's PageMeta to include custom properties
declare module '#app' {
  interface PageMeta {
    showFooter?: boolean
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    showFooter?: boolean
  }
}

export {}
