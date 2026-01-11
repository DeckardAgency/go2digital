<template>
  <section class="why-section" ref="sectionRef">
    <!-- Header -->
    <div class="why-section__header">
      <div class="why-section__label">
        <span class="why-section__label-dot"></span>
        <span
          class="why-section__label-text"
          data-split-text
          data-split-type="words"
          data-split-duration="1.2"
          data-split-y="80"
          data-split-stagger="0.10"
        >
          {{ $t('whySection.label') }}
        </span>
      </div>

      <h1
        class="why-section__headline"
        data-split-text
        data-split-type="lines"
        data-split-duration="1.2"
        data-split-delay="0.2"
        data-split-y="80"
        data-split-stagger="0.10"
      >
        {{ $t('whySection.headline') }}
      </h1>
    </div>

    <!-- Slides Wrapper -->
    <div class="why-section__slides-wrapper">
      <!-- Slide Cards -->
      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="why-section__slide"
        :ref="el => slideRefs[index] = el"
      >
        <div class="why-section__slide-content-wrapper" :ref="el => contentWrapperRefs[index] = el">
          <div class="why-section__slide-content" :ref="el => contentRefs[index] = el">
            <!-- Top Section -->
            <div class="why-section__slide-top">
              <div class="why-section__slide-top-left">
                <div class="why-section__slide-number">{{ slide.number }}</div>
              </div>
              <div class="why-section__slide-top-right">
                <h4 class="why-section__slide-title">{{ slide.title }}</h4>
              </div>
            </div>

            <!-- Bottom Section -->
            <div class="why-section__slide-bottom">
              <div class="why-section__slide-bottom-left">
                <svg class="why-section__slide-arrow" xmlns="http://www.w3.org/2000/svg" width="145" height="145" viewBox="0 0 145 145" fill="none">
                  <path opacity="0.3" d="M-2.29007e-05 130.977L111.56 19.6325L41.0271 19.6325L41.0271 7.17341e-06L145 2.53526e-05L145 103.772L125.329 103.772L125.329 33.3753L13.7694 145L-2.29007e-05 130.977Z" fill="#FAFAFA"/>
                </svg>
              </div>
              <div class="why-section__slide-bottom-right">
                <div class="why-section__slide-bottom-content">
                  <h4 class="why-section__slide-title-mobile">{{ slide.title }}</h4>
                  <p class="why-section__slide-text">{{ slide.description }}</p>
                </div>
                <div class="why-section__slide-dots" :ref="el => dotsContainerRefs[index] = el">
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
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from 'vue-i18n'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

// Slide data with dot patterns
const slides = computed(() => [
  {
    number: '(01)',
    title: t('homepage.whySection.card1.title'),
    description: t('homepage.whySection.card1.description'),
    // Dot pattern: 3x5 grid, 1=visible, 0=hidden
    dots: [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1]
  },
  {
    number: '(02)',
    title: t('homepage.whySection.card2.title'),
    description: t('homepage.whySection.card2.description'),
    // Diamond pattern
    dots: [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0]
  },
  {
    number: '(03)',
    title: t('homepage.whySection.card3.title'),
    description: t('homepage.whySection.card3.description'),
    // Grid pattern
    dots: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1]
  }
])

// Template refs
const sectionRef = ref<HTMLElement | null>(null)
const slideRefs = reactive<(HTMLElement | null)[]>([])
const contentWrapperRefs = reactive<(HTMLElement | null)[]>([])
const contentRefs = reactive<(HTMLElement | null)[]>([])
const dotsContainerRefs = reactive<(HTMLElement | null)[]>([])

// Animation instances
const scrollTriggers: ScrollTrigger[] = []

onMounted(() => {
  setTimeout(() => {
    createAnimations()
  }, 100)
})

onUnmounted(() => {
  destroy()
})

function createAnimations() {
  slides.value.forEach((_, index) => {
    const slide = slideRefs[index]
    const contentWrapper = contentWrapperRefs[index]
    const content = contentRefs[index]
    const dotsContainer = dotsContainerRefs[index]

    if (!slide || !contentWrapper || !content) return

    // Scale animation with pinning
    const scaleTrigger = ScrollTrigger.create({
      trigger: slide,
      start: 'top top',
      end: () => `+=${window.innerHeight}`,
      pin: contentWrapper,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const scale = 1 - (self.progress * 0.3) // Scale from 1 to 0.7
        gsap.set(content, { scale, force3D: true })
      }
    })
    scrollTriggers.push(scaleTrigger)

    // Opacity animation
    const opacityTrigger = ScrollTrigger.create({
      trigger: slide,
      start: 'top 100%',
      end: 'top -50%',
      scrub: 0.8,
      onUpdate: (self) => {
        const opacity = 1 - (self.progress * 0.7) // Opacity from 1 to 0.3
        gsap.set(content, { opacity })
      }
    })
    scrollTriggers.push(opacityTrigger)

    // Fade out animation
    const fadeOutTrigger = ScrollTrigger.create({
      trigger: content,
      start: 'top -80%',
      end: () => `+=${0.2 * window.innerHeight}`,
      scrub: 0.8,
      onUpdate: (self) => {
        gsap.set(content, { autoAlpha: 1 - self.progress })
      }
    })
    scrollTriggers.push(fadeOutTrigger)

    // Dots fade-in animation
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.why-section__slide-dot:not(.why-section__slide-dot--hide)')

      gsap.set(dots, { autoAlpha: 0 })

      ScrollTrigger.create({
        trigger: dotsContainer,
        start: 'top 80%',
        end: 'top 50%',
        onEnter: () => {
          gsap.to(dots, {
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out'
          })
        }
      })
    }
  })
}

function destroy() {
  scrollTriggers.forEach(trigger => trigger.kill())
  scrollTriggers.length = 0

  // Reset elements
  contentRefs.forEach(content => {
    if (content) {
      gsap.set(content, { clearProps: 'all' })
    }
  })
}
</script>

<style lang="scss" scoped>
// ==========================================================================
// Why Section
// Stacked card scroll animation with 3D perspective
// NOTE: Do NOT use `contain: layout` - it uses ScrollTrigger pinning
// ==========================================================================

// Component-specific variables
$why-bg-color: #03120F;
$why-border-color: #293331;
$why-text-color: #FAFAFA;
$why-number-size-desktop: 17.5rem;
$why-number-size-tablet: 10rem;
$why-number-size-mobile: 5.375rem;
$why-headline-size-desktop: 5.375rem;
$why-headline-size-tablet: 3.5rem;
$why-headline-size-mobile: 2.625rem;
$why-dot-size: 0.375rem;

.why-section {
  position: relative;
  overflow: hidden;
  width: 100%;
  background-color: $why-bg-color;
  z-index: 30;

  // ==========================================================================
  // Element: Header
  // ==========================================================================
  &__header {
    padding: 16.25rem $spacing-2xl $spacing-2xl $spacing-2xl;

    @include desktop {
      padding: 8rem $spacing-xl $spacing-xl $spacing-xl;
    }

    @include tablet {
      padding: 5rem $spacing-lg $spacing-lg $spacing-lg;
    }
  }

  // ==========================================================================
  // Element: Label
  // ==========================================================================
  &__label {
    display: flex;
    align-items: center;
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
    font-size: $font-size-sm;
    font-weight: 400;
    line-height: 0.9;
    text-transform: capitalize;

    @include tablet {
      font-size: 0.6875rem;
    }
  }

  // ==========================================================================
  // Element: Headline
  // ==========================================================================
  &__headline {
    color: $why-text-color;
    font-size: $why-headline-size-desktop;
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin: 0;

    @include desktop {
      font-size: $why-headline-size-tablet;
    }

    @include tablet {
      font-size: $why-headline-size-mobile;
    }
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
    height: 100dvh;
    background-color: $why-bg-color;
  }

  &__slide-content-wrapper {
    position: relative;
    width: 100%;
    height: 100dvh;
    perspective: 250vw;
    background-color: $why-bg-color;
  }

  &__slide-content {
    @include absolute-fill;
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
    font-size: $why-number-size-desktop;
    font-weight: 400;
    line-height: 0.8;
    letter-spacing: -0.06em;
    color: $why-text-color;
    opacity: 0.2;
    margin-top: $spacing-2xl;

    @include desktop {
      font-size: $why-number-size-tablet;
      margin-top: $spacing-lg;
    }

    @include tablet {
      font-size: $why-number-size-mobile;
      margin: 0;
      opacity: 0.3;
    }
  }

  // ==========================================================================
  // Element: Slide Title
  // ==========================================================================
  &__slide-title {
    font-size: 3.125rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.02em;
    color: $why-text-color;
    margin: 0 0 $spacing-xl 0;

    @include desktop {
      font-size: 2rem;
      margin: 0 0 $spacing-lg 0;
    }

    @include tablet {
      display: none;
    }
  }

  &__slide-title-mobile {
    display: none;
    color: $why-text-color;
    font-size: $font-size-md;
    font-weight: 400;
    line-height: 1.3;
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
      padding: $spacing-md $spacing-lg 5rem $spacing-lg;
    }
  }

  // ==========================================================================
  // Element: Slide Arrow
  // ==========================================================================
  &__slide-arrow {
    margin-top: auto;
    width: 9rem;
    height: 9rem;

    @include desktop {
      width: 6rem;
      height: 6rem;
    }
  }

  // ==========================================================================
  // Element: Slide Content
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
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
    color: $why-text-color;
    opacity: 0.3;
    grid-column: 1 / 5;
    margin: 0;

    @include tablet {
      opacity: 0.4;
      max-width: 21.4375rem;
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
      gap: 3rem;
    }
  }

  &__slide-dot {
    width: 6px;
    height: 6px;
    aspect-ratio: 1;
    background-color: $color-accent;
    border-radius: $radius-full;

    // ------------------------------------------
    // Modifier: Hidden dot
    // ------------------------------------------
    &--hide {
      opacity: 0;
      visibility: hidden;
    }
  }
}
</style>
