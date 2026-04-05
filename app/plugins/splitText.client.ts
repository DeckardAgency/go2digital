export default defineNuxtPlugin(() => {
  const { initSplitText } = useSplitText()
  const nuxtApp = useNuxtApp()

  // Initial load
  onNuxtReady(() => {
    nextTick(() => {
      setTimeout(() => initSplitText(), 150)
    })
  })

  // Re-initialize after page transitions — use page:finish instead of router.afterEach
  // so we target the NEW page's elements after Suspense resolves, not the old page's
  nuxtApp.hook('page:finish', () => {
    nextTick(() => {
      setTimeout(() => initSplitText(), 150)
    })
  })
})
