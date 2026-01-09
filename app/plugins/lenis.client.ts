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

  // Use GSAP ticker for Lenis RAF - this ensures proper sync
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  // Disable GSAP's lag smoothing to prevent jumps
  gsap.ticker.lagSmoothing(0)

  // Provide lenis instance globally
  return {
    provide: {
      lenis
    }
  }
})
