import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({
    lerp: 0.06,
    duration: 1.2,
    wheelMultiplier: 0.8,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
  })

  // Sync Lenis scroll with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)

  // Use GSAP ticker for Lenis RAF
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  // Disable GSAP's lag smoothing to prevent jumps
  gsap.ticker.lagSmoothing(0)

  // Handle route changes
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  router.beforeEach(() => {
    // Stop Lenis during navigation to prevent scroll while transitioning
    lenis.stop()

    // Only kill component-level ScrollTriggers, NOT transition overlays.
    // Skip if a custom transition (e.g. location card) is handling it.
    if (!(window as any).__skipPageTransition) {
      // Defer ScrollTrigger cleanup to after the leave animation completes.
      // app.vue's beforeEach runs the leave animation with overlays that don't
      // use ScrollTrigger, so this is safe to do immediately for page components.
      // However, we must NOT kill them here because the leave animation in app.vue
      // uses an awaited promise — killing triggers here would conflict.
      // Instead, let components clean up their own triggers via onUnmounted.
    }
  })

  // Reset scroll on page finish. Two cases:
  // 1. Transition running (is-transitioning): app.vue's enter animation onComplete
  //    handles ScrollTrigger.refresh() + lenis.start() after transforms are cleared.
  // 2. No transition (initial load, __skipPageTransition): restart Lenis here directly.
  nuxtApp.hook('page:finish', () => {
    // Skip scroll reset if returning from detail page (card return animation handles scroll)
    const isReturningToCard = sessionStorage.getItem('returnSlug')
    if (!isReturningToCard) {
      window.scrollTo(0, 0)
      lenis.scrollTo(0, { immediate: true, force: true })
    }

    const isTransitioning = document.documentElement.classList.contains('is-transitioning')

    if (!isTransitioning) {
      // No enter animation — start Lenis after components mount
      nextTick(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh(true)
            lenis.start()
          })
        })
      })
    }
    // else: app.vue onComplete handles lenis.start() + ScrollTrigger.refresh()
  })

  // Provide lenis instance globally
  return {
    provide: {
      lenis
    }
  }
})
