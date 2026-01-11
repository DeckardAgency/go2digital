import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2
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

  router.beforeEach(() => {
    // Stop Lenis during navigation
    lenis.stop()
    // Kill all ScrollTriggers
    ScrollTrigger.getAll().forEach(st => st.kill())
  })

  router.afterEach(() => {
    // Reset scroll and restart Lenis after navigation
    window.scrollTo(0, 0)
    lenis.scrollTo(0, { immediate: true, force: true })
    lenis.start()
  })

  // Provide lenis instance globally
  return {
    provide: {
      lenis
    }
  }
})
