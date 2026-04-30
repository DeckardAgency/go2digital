import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default defineNuxtPlugin(() => {
  // Disable Lenis on mobile. Native momentum scroll feels fine on touch
  // devices, and Lenis fights with the address-bar resize that fires when
  // the user scrolls up — causing scroll to start then immediately stop.
  // ScrollTriggers attach to native scroll events when no Lenis is present.
  const isMobile = window.matchMedia('(max-width: 767px)').matches

  if (isMobile) {
    gsap.ticker.lagSmoothing(0)

    const router = useRouter()
    router.beforeEach(() => {
      ScrollTrigger.getAll().forEach(st => st.kill())
      ScrollTrigger.clearScrollMemory()
    })

    return { provide: { lenis: null } }
  }

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

  const router = useRouter()

  // Stop Lenis and kill all ScrollTriggers on every navigation.
  // Components create fresh ScrollTriggers on mount — old ones must be gone.
  router.beforeEach(() => {
    lenis.stop()
    ScrollTrigger.getAll().forEach(st => st.kill())
    ScrollTrigger.clearScrollMemory()
  })

  // Provide lenis instance globally
  return {
    provide: {
      lenis
    }
  }
})
