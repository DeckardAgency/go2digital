<template>
  <section class="text-animation" ref="sectionRef">
    <div class="text-animation__container" ref="containerRef">
      <p :class="['text-animation__word', 'text-animation__word--primary', typoClass('word')]" ref="word1Ref">{{ textAnim?.word1 ?? $t('homepage.textAnimation.word1') }}</p>
      <p :class="['text-animation__word', 'text-animation__word--secondary', typoClass('word')]" ref="word2Ref">{{ textAnim?.word2 ?? $t('homepage.textAnimation.word2') }}</p>
      <p :class="['text-animation__word', 'text-animation__word--tertiary', typoClass('word')]" ref="word3Ref">{{ textAnim?.word3 ?? $t('homepage.textAnimation.word3') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HomepageTextAnimation } from '~/types/api'

const { data: textAnim } = useApi<HomepageTextAnimation>('/api/singletons/homepage-text-animation', { lazy: true, server: false })

const DEFAULT_PRESETS = {
  word: 'display-huge',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = (textAnim.value as { typographyMap?: Record<string, string> } | null)?.typographyMap
  return `typo-${map?.[key] || DEFAULT_PRESETS[key]}`
}

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const word1Ref = ref<HTMLElement | null>(null)
const word2Ref = ref<HTMLElement | null>(null)
const word3Ref = ref<HTMLElement | null>(null)

let timeline: gsap.core.Timeline | null = null
const prefersReducedMotion = ref(false)

const mobileBreakpoint = 768
const isMobile = () => window.innerWidth < mobileBreakpoint

// #5: Debounced resize handler
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh()
  }, 150)
}

// #2: Use nextTick + requestAnimationFrame for proper DOM readiness
onMounted(async () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await nextTick()
  requestAnimationFrame(() => {
    if (!containerRef.value || !word1Ref.value || !word2Ref.value || !word3Ref.value) return

    const w1 = word1Ref.value
    const w2 = word2Ref.value
    const w3 = word3Ref.value
    const words = [w1, w2, w3]

    // #4: If reduced motion, show first word visible, skip animations
    if (prefersReducedMotion.value) {
      gsap.set(w1, { opacity: 1, y: 0 })
      gsap.set(w2, { opacity: 0 })
      gsap.set(w3, { opacity: 0 })
      window.addEventListener('resize', handleResize, { passive: true })
      return
    }

    // Initial state: only first word visible
    gsap.set(w1, { opacity: 1, y: 0 })
    gsap.set(w2, { opacity: 0, y: '5vh' })
    gsap.set(w3, { opacity: 0, y: '5vh' })

    const mobile = isMobile()

    timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top top',
        end: '+=300%',
        scrub: mobile ? 0.3 : 1, // #12: faster scrub on mobile
        pin: containerRef.value,
        pinSpacing: false,
        invalidateOnRefresh: true
      }
    })

    // Hold word 1 visible at the start of the pin
    timeline.to({}, { duration: 0.5 })

    // Word 1 → Word 2
    timeline
      .to(w1, { opacity: 0, y: '-5vh', duration: 0.3, ease: 'power2.in' })
      .fromTo(w2, { opacity: 0, y: '5vh' }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
      .to({}, { duration: 0.2 }) // hold

    // Word 2 → Word 3
    timeline
      .to(w2, { opacity: 0, y: '-5vh', duration: 0.3, ease: 'power2.in' })
      .fromTo(w3, { opacity: 0, y: '5vh' }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
      .to({}, { duration: 0.3 }) // #11: longer hold so last word lingers

    window.addEventListener('resize', handleResize, { passive: true })

    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true)
    })
  })
})

onUnmounted(() => {
  // Clear pending timers
  if (resizeTimeout) clearTimeout(resizeTimeout)
  window.removeEventListener('resize', handleResize)

  if (timeline) {
    timeline.kill()
    timeline = null
  }

  // #6: Clear inline styles from GSAP
  if (word1Ref.value) gsap.set(word1Ref.value, { clearProps: 'all' })
  if (word2Ref.value) gsap.set(word2Ref.value, { clearProps: 'all' })
  if (word3Ref.value) gsap.set(word3Ref.value, { clearProps: 'all' })
})
</script>

<style scoped lang="scss">
@mixin dot-pattern-bg {
  --d: 1px;
  background: #03120F radial-gradient(
    circle at var(--d) var(--d),
    rgba(250, 250, 250, 0.2) calc(var(--d) - 1px),
    #0000 var(--d)
  ) 0 0 / 10px 10px;
}

.text-animation {
  position: relative;
  width: 100%;
  height: 300vh;
  // #1: Removed overflow: hidden — it clips the ScrollTrigger pin-spacer
  z-index: 30;
  @include dot-pattern-bg;

  &__container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    width: 100%;
    padding: 2.5rem;
    @include dot-pattern-bg;
    @include tablet { padding: 1.5rem; }
  }

  &__word {
    color: #FAFAFA;
    text-align: center;
    white-space: nowrap;
    margin: 0;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    // #9: Removed permanent will-change — GSAP handles this during animation

    &--primary { z-index: 3; }
    &--secondary { z-index: 2; }
    &--tertiary { z-index: 1; }

    @include tablet { letter-spacing: -0.04em; }
  }
}

// #4: Accessibility — reduced motion
@media (prefers-reduced-motion: reduce) {
  .text-animation__word {
    transition: none;
  }
}
</style>

<style>
/* #10: Pin spacer background for GSAP — scoped to this section via :has() */
.pin-spacer:has(.text-animation__container) {
  --d: 1px;
  background: #03120F radial-gradient(
    circle at var(--d) var(--d),
    rgba(250, 250, 250, 0.2) calc(var(--d) - 1px),
    #0000 var(--d)
  ) 0 0 / 10px 10px !important;
}
</style>
