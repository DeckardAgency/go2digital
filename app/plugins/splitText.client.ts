export default defineNuxtPlugin(() => {
  const { initSplitText } = useSplitText()

  // Initialize on route change
  const router = useRouter()

  // Initial load
  onNuxtReady(() => {
    nextTick(() => {
      setTimeout(() => initSplitText(), 150)
    })
  })

  // Re-initialize after page transitions
  router.afterEach(() => {
    nextTick(() => {
      setTimeout(() => initSplitText(), 150)
    })
  })
})
