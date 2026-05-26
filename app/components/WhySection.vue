<template>
  <section class="why-section" ref="sectionRef">
    <!-- Header -->
    <div class="why-section__header">
      <div class="why-section__label">
        <span class="why-section__label-dot"></span>
        <span
          :class="['why-section__label-text', typoClass('label')]"
        >
          {{ whySection?.label ?? $t('whySection.label') }}
        </span>
      </div>

      <h1
        :class="['why-section__headline', typoClass('headline')]"
      >
        {{ whySection?.headline ?? $t('whySection.headline') }}
      </h1>
    </div>

    <!-- Slides Wrapper -->
    <div class="why-section__slides-wrapper">
      <!-- Slide Cards -->
      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="why-section__slide"
        :ref="el => slideRefs[index] = el as HTMLElement"
      >
        <div class="why-section__slide-content-wrapper" :ref="el => contentWrapperRefs[index] = el as HTMLElement">
          <div class="why-section__slide-content" :ref="el => contentRefs[index] = el as HTMLElement">
            <!-- Top Section -->
            <div class="why-section__slide-top">
              <div class="why-section__slide-top-left">
                <div :class="['why-section__slide-number', typoClass('slideNumber')]">{{ slide.number }}</div>
              </div>
              <div class="why-section__slide-top-right">
                <h4 :class="['why-section__slide-title', typoClass('slideTitle')]">{{ slide.title }}</h4>
              </div>
            </div>

            <!-- Bottom Section -->
            <div class="why-section__slide-bottom">
              <div class="why-section__slide-bottom-left">
                <svg class="why-section__slide-arrow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="145" height="145" viewBox="0 0 145 145" fill="none">
                  <path opacity="0.3" d="M-2.29007e-05 130.977L111.56 19.6325L41.0271 19.6325L41.0271 7.17341e-06L145 2.53526e-05L145 103.772L125.329 103.772L125.329 33.3753L13.7694 145L-2.29007e-05 130.977Z" fill="#FAFAFA"/>
                </svg>
              </div>
              <div class="why-section__slide-bottom-right">
                <div class="why-section__slide-bottom-content">
                  <h4 :class="['why-section__slide-title-mobile', typoClass('slideTitleMobile')]">{{ slide.title }}</h4>
                  <p class="why-section__slide-text typo-body-md">{{ slide.description }}</p>
                </div>
                <div class="why-section__slide-dots" :ref="el => dotsContainerRefs[index] = el as HTMLElement">
                  <div
                    v-for="(dot, dotIndex) in slide.dots"
                    :key="dotIndex"
                    class="why-section__slide-dot"
                    :class="{ 'why-section__slide-dot--hide': !dot }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from 'vue-i18n'
import type { HomepageWhySection, HomepageWhyCard } from '~/types/api'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

const { data: whySection } = useApi<HomepageWhySection>('/api/singletons/homepage-why-section', { lazy: true, server: false })
const { data: whyCards } = useApi<HomepageWhyCard[]>('/api/homepage_why_cards', { lazy: true, server: false })

const DEFAULT_PRESETS = {
  label: 'eyebrow-tight',
  headline: 'display-xl',
  slideNumber: 'display-stat-xl',
  slideTitle: 'display-md',
  slideTitleMobile: 'body',
  slideText: 'body-sm',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = (whySection.value as { typographyMap?: Record<string, string> } | null)?.typographyMap
  return `typo-${map?.[key] || DEFAULT_PRESETS[key]}`
}

const mobileBreakpoint = 768
const isMobile = () => window.innerWidth < mobileBreakpoint

// Default dot patterns as fallback
const defaultDots = [
  [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1]
]

// Slide data with dot patterns
const slides = computed(() => [
  {
    number: '(01)',
    title: whyCards.value?.[0]?.title ?? t('homepage.whySection.card1.title'),
    description: whyCards.value?.[0]?.description ?? t('homepage.whySection.card1.description'),
    dots: whyCards.value?.[0]?.dotPattern ?? defaultDots[0]
  },
  {
    number: '(02)',
    title: whyCards.value?.[1]?.title ?? t('homepage.whySection.card2.title'),
    description: whyCards.value?.[1]?.description ?? t('homepage.whySection.card2.description'),
    dots: whyCards.value?.[1]?.dotPattern ?? defaultDots[1]
  },
  {
    number: '(03)',
    title: whyCards.value?.[2]?.title ?? t('homepage.whySection.card3.title'),
    description: whyCards.value?.[2]?.description ?? t('homepage.whySection.card3.description'),
    dots: whyCards.value?.[2]?.dotPattern ?? defaultDots[2]
  }
])

// Template refs (#4: ref() instead of reactive())
const sectionRef = ref<HTMLElement | null>(null)
const slideRefs = ref<(HTMLElement | null)[]>([])
const contentWrapperRefs = ref<(HTMLElement | null)[]>([])
const contentRefs = ref<(HTMLElement | null)[]>([])
const dotsContainerRefs = ref<(HTMLElement | null)[]>([])

// Animation instances (#3: store timelines for proper cleanup)
const slideTimelines: gsap.core.Timeline[] = []
const prefersReducedMotion = ref(false)

// #7: Debounced resize handler — only refresh on width changes so the mobile
// address-bar show/hide (which only changes height) doesn't trigger refresh.
let resizeTimeout: ReturnType<typeof setTimeout> | null = null
let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0

const handleResize = () => {
  if (window.innerWidth === lastWidth) return
  lastWidth = window.innerWidth
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh()
  }, 150)
}

// #5: nextTick + rAF instead of setTimeout
onMounted(async () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await nextTick()
  requestAnimationFrame(() => {
    // #2: If reduced motion, make everything visible and skip animations
    if (prefersReducedMotion.value) {
      slides.value.forEach((_, index) => {
        const content = contentRefs.value[index]
        const dotsContainer = dotsContainerRefs.value[index]
        if (content) gsap.set(content, { scale: 1, opacity: 1, autoAlpha: 1 })
        if (dotsContainer) {
          const dots = dotsContainer.querySelectorAll('.why-section__slide-dot:not(.why-section__slide-dot--hide)')
          gsap.set(dots, { autoAlpha: 1 })
        }
      })
      window.addEventListener('resize', handleResize, { passive: true })
      return
    }

    createAnimations()
    window.addEventListener('resize', handleResize, { passive: true })
  })
})

onUnmounted(() => {
  destroy()
})

// #1: Consolidated single timeline per slide
function createAnimations() {
  const mobile = isMobile()
  const scrubSpeed = mobile ? 0.3 : 0.8 // #11: faster scrub on mobile

  slides.value.forEach((_, index) => {
    const slide = slideRefs.value[index]
    const contentWrapper = contentWrapperRefs.value[index]
    const content = contentRefs.value[index]
    const dotsContainer = dotsContainerRefs.value[index]

    if (!slide || !contentWrapper || !content) return

    // Single timeline per slide with pin
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: slide,
        start: 'top top',
        end: () => `+=${window.innerHeight}`,
        pin: contentWrapper,
        scrub: scrubSpeed,
        invalidateOnRefresh: true
      }
    })

    // Scale from 1 to 0.7 over full progress
    tl.fromTo(content,
      { scale: 1 },
      { scale: 0.7, duration: 1, force3D: true, ease: 'none' },
      0
    )

    // Opacity from 1 to 0.3 over 0-80%
    tl.fromTo(content,
      { opacity: 1 },
      { opacity: 0.3, duration: 0.8, ease: 'none' },
      0
    )

    // Fade out (autoAlpha 1 → 0) over 80-100%
    tl.fromTo(content,
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: 0.2, ease: 'none' },
      0.8
    )

    // #2: Dots — scrub-linked with stagger (reversible)
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.why-section__slide-dot:not(.why-section__slide-dot--hide)')
      if (dots.length > 0) {
        gsap.set(dots, { autoAlpha: 0 })

        tl.fromTo(dots,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.4,
            stagger: 0.02,
            ease: 'power2.out'
          },
          0.1 // Start early so dots are visible while card is still prominent
        )
      }
    }

    slideTimelines.push(tl)
  })
}

function destroy() {
  // #7: Clear resize handler
  if (resizeTimeout) clearTimeout(resizeTimeout)
  window.removeEventListener('resize', handleResize)

  // Kill all timelines (includes their ScrollTriggers)
  slideTimelines.forEach(tl => tl.kill())
  slideTimelines.length = 0

  // #10: Reset content and dot elements
  contentRefs.value.forEach(content => {
    if (content) gsap.set(content, { clearProps: 'all' })
  })

  dotsContainerRefs.value.forEach(dotsContainer => {
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.why-section__slide-dot:not(.why-section__slide-dot--hide)')
      gsap.set(dots, { clearProps: 'all' })
    }
  })

  // #6: Clear refs to release DOM references
  slideRefs.value = []
  contentWrapperRefs.value = []
  contentRefs.value = []
  dotsContainerRefs.value = []
}
</script>

<style lang="scss" scoped>
// ==========================================================================
// Why Section
// Stacked card scroll animation with 3D perspective
// NOTE: Do NOT use `contain: layout` - it uses ScrollTrigger pinning
// ==========================================================================

// Component-specific variables
// --------------------------------------------------------------------------
$why-bg-color: #03120F;
$why-border-color: #293331;
$why-text-color: #FAFAFA;
$why-number-opacity: 0.2;
$why-number-opacity-mobile: 0.3;
$why-text-opacity: 0.3;
$why-text-opacity-mobile: 0.4;

// Layout sizes
$why-arrow-size-desktop: 9rem;
$why-arrow-size-tablet: 6rem;
$why-dot-size: 6px;
$why-header-padding-top: 16.25rem;
$why-header-padding-top-desktop: 8rem;
$why-header-padding-top-tablet: 5rem;
$why-mobile-bottom-padding: 5rem;
$why-dots-gap-mobile: 3rem;
$why-text-max-width: 21.4375rem;

// 3D perspective
$why-perspective: 250vw;

.why-section {
  position: relative;
  overflow: hidden;
  width: 100%;
  background-color: $why-bg-color;
  z-index: $z-sticky;

  // ==========================================================================
  // Element: Header
  // ==========================================================================
  &__header {
    padding: $why-header-padding-top $spacing-2xl $spacing-2xl;

    @include desktop {
      padding: $why-header-padding-top-desktop $spacing-xl $spacing-xl;
    }

    @include tablet {
      padding: $why-header-padding-top-tablet $spacing-lg $spacing-lg;
    }
  }

  // ==========================================================================
  // Element: Label
  // ==========================================================================
  &__label {
    @include flex-start;
    gap: $spacing-xs;
    margin-bottom: $spacing-md;

    @include tablet {
      margin-bottom: $spacing-sm;
    }
  }

  &__label-dot {
    width: $why-dot-size;
    height: $why-dot-size;
    background-color: $why-text-color;
    border-radius: $radius-full;
  }

  &__label-text {
    color: $why-text-color;
    text-transform: capitalize;
  }

  // ==========================================================================
  // Element: Headline
  // ==========================================================================
  &__headline {
    color: $why-text-color;
    margin: 0;
  }

  // ==========================================================================
  // Element: Slides Wrapper
  // ==========================================================================
  &__slides-wrapper {
    position: relative;
  }

  // ==========================================================================
  // Element: Slide
  // ==========================================================================
  &__slide {
    position: relative;
    height: 100svh;
    background-color: $why-bg-color;
  }

  &__slide-content-wrapper {
    @include gpu-accelerate;
    position: relative;
    width: 100%;
    height: 100svh;
    perspective: $why-perspective;
    background-color: $why-bg-color;
  }

  &__slide-content {
    @include absolute-fill;
    @include gpu-accelerate;
    transform-style: preserve-3d;
    transform-origin: 50% 10%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: $why-bg-color;
    border: 1px solid $why-border-color;
    border-radius: $radius-lg;

    @include tablet {
      border-radius: 0;
    }
  }

  // ==========================================================================
  // Element: Slide Top
  // ==========================================================================
  &__slide-top {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    height: 50%;

    @include tablet {
      height: auto;
      grid-template-columns: 1fr;
      border-bottom: 1px solid $why-border-color;
    }
  }

  &__slide-top-left {
    padding: $spacing-2xl;
    grid-column: 1 / 6;
    border-right: 1px solid $why-border-color;
    border-bottom: 1px solid $why-border-color;

    @include desktop {
      padding: $spacing-lg;
    }

    @include tablet {
      grid-column: 1;
      padding: $spacing-md;
      border-right: none;
      border-bottom: none;
    }
  }

  &__slide-top-right {
    padding: $spacing-2xl;
    grid-column: 6 / 13;
    border-bottom: 1px solid $why-border-color;

    @include desktop {
      padding: $spacing-lg;
    }

    @include tablet {
      display: none;
    }
  }

  // ==========================================================================
  // Element: Slide Number
  // ==========================================================================
  &__slide-number {
    color: $why-text-color;
    opacity: $why-number-opacity;
    margin-top: $spacing-2xl;

    @include desktop {
      margin-top: $spacing-lg;
    }

    @include tablet {
      margin: 0;
      opacity: $why-number-opacity-mobile;
    }
  }

  // ==========================================================================
  // Element: Slide Title
  // ==========================================================================
  &__slide-title {
    color: $why-text-color;
    margin: 0 0 $spacing-xl 0;

    @include desktop {
      margin: 0 0 $spacing-lg 0;
    }

    @include tablet {
      display: none;
    }
  }

  &__slide-title-mobile {
    display: none;
    color: $why-text-color;
    margin: 0;

    @include tablet {
      display: block;
    }
  }

  // ==========================================================================
  // Element: Slide Bottom
  // ==========================================================================
  &__slide-bottom {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    height: 50%;

    @include tablet {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: auto;
    }
  }

  &__slide-bottom-left {
    padding: $spacing-2xl;
    display: flex;
    grid-column: 1 / 6;
    margin-top: auto;
    border-right: 1px solid $why-border-color;
    height: 100%;

    @include desktop {
      padding: $spacing-lg;
    }

    @include tablet {
      display: none;
    }
  }

  &__slide-bottom-right {
    padding: $spacing-2xl;
    grid-column: 6 / 13;
    display: grid;
    grid-template-columns: repeat(12, 1fr);

    @include desktop {
      padding: $spacing-lg;
    }

    @include tablet {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      padding: $spacing-md $spacing-lg $why-mobile-bottom-padding $spacing-lg;
    }
  }

  // ==========================================================================
  // Element: Slide Arrow
  // ==========================================================================
  &__slide-arrow {
    margin-top: auto;
    width: $why-arrow-size-desktop;
    height: $why-arrow-size-desktop;

    @include desktop {
      width: $why-arrow-size-tablet;
      height: $why-arrow-size-tablet;
    }
  }

  // ==========================================================================
  // Element: Slide Bottom Content
  // ==========================================================================
  &__slide-bottom-content {
    display: contents;

    @include tablet {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
    }
  }

  &__slide-text {
    color: $why-text-color;
    opacity: $why-text-opacity;
    grid-column: 1 / 5;
    margin: 0;

    @include tablet {
      opacity: $why-text-opacity-mobile;
      max-width: $why-text-max-width;
    }
  }

  // ==========================================================================
  // Element: Slide Dots
  // ==========================================================================
  &__slide-dots {
    grid-column: 1 / 5;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: end;
    gap: $spacing-xs;

    @include tablet {
      align-self: center;
      margin-top: auto;
      gap: $why-dots-gap-mobile;
    }
  }

  &__slide-dot {
    // gpu-accelerate removed — tiny elements don't need permanent GPU layers
    width: $why-dot-size;
    height: $why-dot-size;
    aspect-ratio: 1;
    background-color: $color-accent;
    border-radius: $radius-full;

    // #9: Hidden by default so no flash before JS initializes
    &:not(&--hide) {
      visibility: hidden;
    }

    // ------------------------------------------
    // Modifier: Hidden dot (grid placeholder)
    // ------------------------------------------
    &--hide {
      opacity: 0;
      visibility: hidden;
    }
  }
}

// #2: Accessibility — reduced motion
@media (prefers-reduced-motion: reduce) {
  .why-section {
    &__slide-content-wrapper {
      perspective: none;
    }

    &__slide-content {
      transform: none !important;
    }

    &__slide-dot:not(.why-section__slide-dot--hide) {
      visibility: visible;
    }
  }
}
</style>
