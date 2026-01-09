import type Lenis from 'lenis'

export const useLenis = () => {
  const nuxtApp = useNuxtApp()

  const lenis = computed(() => nuxtApp.$lenis as Lenis | undefined)

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: {
      offset?: number
      duration?: number
      easing?: (t: number) => number
      immediate?: boolean
      lock?: boolean
      onComplete?: () => void
    }
  ) => {
    lenis.value?.scrollTo(target, options)
  }

  const stop = () => {
    lenis.value?.stop()
  }

  const start = () => {
    lenis.value?.start()
  }

  return {
    lenis,
    scrollTo,
    stop,
    start
  }
}
