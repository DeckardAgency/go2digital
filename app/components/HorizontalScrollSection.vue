<template>
  <section class="horizontal-scroll" ref="sectionRef" data-horizontal-scroll>
    <!-- Panels Container - This will scroll horizontally -->
    <div class="horizontal-scroll__wrapper" ref="wrapperRef" data-scroll-wrapper>
      <div class="horizontal-scroll__panels" ref="panelsRef" data-scroll-panels>

        <!-- Timeline - spans full width of all panels -->
        <div class="horizontal-scroll__timeline" ref="timelineRef" data-scroll-timeline>
          <div class="horizontal-scroll__timeline-line"></div>
          <div class="horizontal-scroll__timeline-progress" ref="progressRef"></div>

          <!-- Timeline dots - positioned at center of each panel -->
          <div
            v-for="(panel, index) in panels"
            :key="`dot-${index}`"
            class="horizontal-scroll__timeline-dot"
            :class="{ 'horizontal-scroll__timeline-dot--active': index <= activeIndex }"
            :style="{ left: `${(index * 100) + 50}vw` }"
          ></div>
        </div>

        <!-- Panels -->
        <div
          v-for="(panel, index) in panels"
          :key="index"
          class="horizontal-scroll__panel"
          data-scroll-panel
        >
          <!-- Top Section - Title/Description on left, Scroll label on right -->
          <div class="horizontal-scroll__panel-top">
            <h2 class="horizontal-scroll__title">
              {{ panel.title }}
            </h2>
            <p v-if="index === 0" class="horizontal-scroll__scroll-label" ref="scrollLabelRef">
              {{ $t('homepage.horizontalScroll.scrollLabel') }}
            </p>
          </div>

          <!-- Middle Section - Tag and Description below timeline -->
          <div class="horizontal-scroll__panel-middle" :ref="el => panelMiddleRefs[index] = el">
            <div class="horizontal-scroll__tag">
              <span class="horizontal-scroll__tag-dot"></span>
              <span class="horizontal-scroll__tag-text">{{ panel.tag }}</span>
            </div>
            <p class="horizontal-scroll__description">
              {{ panel.description }}
            </p>
          </div>

          <!-- Bottom Section - Large Stat Value -->
          <div class="horizontal-scroll__panel-bottom" :ref="el => panelBottomRefs[index] = el">
            <p class="horizontal-scroll__stat-value" :ref="el => statValueRefs[index] = el">
              {{ panel.statValue }}
            </p>
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

// Panel data
const panels = computed(() => [
  {
    title: t('homepage.horizontalScroll.panel1.title'),
    tag: t('homepage.horizontalScroll.panel1.tag'),
    description: t('homepage.horizontalScroll.panel1.description'),
    statValue: '2.5M'
  },
  {
    title: t('homepage.horizontalScroll.panel2.title'),
    tag: t('homepage.horizontalScroll.panel2.tag'),
    description: t('homepage.horizontalScroll.panel2.description'),
    statValue: '460'
  },
  {
    title: t('homepage.horizontalScroll.panel3.title'),
    tag: t('homepage.horizontalScroll.panel3.tag'),
    description: t('homepage.horizontalScroll.panel3.description'),
    statValue: '50'
  },
  {
    title: t('homepage.horizontalScroll.panel4.title'),
    tag: t('homepage.horizontalScroll.panel4.tag'),
    description: t('homepage.horizontalScroll.panel4.description'),
    statValue: '28'
  }
])

// Template refs
const sectionRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const panelsRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const scrollLabelRef = ref<HTMLElement | null>(null)

// Panel element refs
const panelMiddleRefs = reactive<(HTMLElement | null)[]>([])
const panelBottomRefs = reactive<(HTMLElement | null)[]>([])
const statValueRefs = reactive<(HTMLElement | null)[]>([])

// Animation state
const activeIndex = ref(0)
let scrollTimeline: gsap.core.Timeline | null = null
let scrollTriggerInstance: ScrollTrigger | null = null

onMounted(() => {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    createAnimation()
  }, 100)
})

onUnmounted(() => {
  destroy()
})

function createAnimation() {
  if (!sectionRef.value || !panelsRef.value) return

  const numPanels = panels.value.length
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Scroll distance = (numPanels - 1) panels worth of scrolling
  const scrollDistance = (numPanels - 1) * viewportWidth

  // Add delay distance before horizontal scroll starts
  const delayDistance = viewportHeight * 0.5
  const totalScrollDistance = scrollDistance + delayDistance

  // Calculate delay ratio for timeline
  const delayRatio = delayDistance / totalScrollDistance

  // Create the horizontal scroll animation
  scrollTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top top',
      end: () => `+=${totalScrollDistance}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Calculate adjusted progress (excluding delay period)
        const adjustedProgress = Math.max(0, (self.progress - delayRatio) / (1 - delayRatio))

        // Update timeline progress bar
        if (progressRef.value) {
          gsap.set(progressRef.value, {
            scaleX: adjustedProgress,
            transformOrigin: 'left center'
          })
        }

        // Update active dot
        updateActiveDot(adjustedProgress)

        // Fade out scroll label as user scrolls
        if (scrollLabelRef.value) {
          const labelOpacity = 1 - (self.progress * 5)
          gsap.set(scrollLabelRef.value, {
            opacity: Math.max(0, labelOpacity)
          })
        }
      }
    }
  })

  scrollTriggerInstance = scrollTimeline.scrollTrigger as ScrollTrigger

  // Add delay period at start (nothing moves)
  scrollTimeline.to({}, { duration: delayRatio })

  // Animate panels horizontally (after delay)
  scrollTimeline.to(panelsRef.value, {
    x: -scrollDistance,
    ease: 'none',
    duration: 1 - delayRatio,
    force3D: true
  })

  // Animate individual panel elements
  const scrollPhase = 1 - delayRatio
  const totalPanelScrolls = numPanels - 1

  panels.value.forEach((_, index) => {
    const panelMiddle = panelMiddleRefs[index]
    const panelBottom = panelBottomRefs[index]
    const statValue = statValueRefs[index]

    // Set initial states
    if (index === 0) {
      if (panelMiddle) gsap.set(panelMiddle, { opacity: 0, y: 20 })
      if (panelBottom) gsap.set(panelBottom, { opacity: 0, y: 40 })
      if (statValue) gsap.set(statValue, { opacity: 0, y: 50 })

      // Animate first panel elements during the delay period
      scrollTimeline!.add(() => {
        const tl = gsap.timeline()
        if (statValue) {
          tl.to(statValue, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          }, 0)
        }
        if (panelMiddle) {
          tl.to(panelMiddle, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          }, 0.1)
        }
        if (panelBottom) {
          tl.to(panelBottom, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          }, 0.15)
        }
      }, 0)
    } else {
      if (panelMiddle) gsap.set(panelMiddle, { opacity: 0, y: 20 })
      if (panelBottom) gsap.set(panelBottom, { opacity: 0, y: 40 })
      if (statValue) gsap.set(statValue, { opacity: 0, y: 50 })
    }

    // Calculate progress points for horizontal scroll
    const rawAnimationStart = Math.max(0, (index - 0.3) / totalPanelScrolls)
    const animationStart = delayRatio + (rawAnimationStart * scrollPhase)
    const animationDuration = (0.25 / totalPanelScrolls) * scrollPhase

    // Skip animation for first panel (handled separately above)
    if (index > 0) {
      // Animate stat value element
      if (statValue) {
        scrollTimeline!.fromTo(statValue,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: animationDuration,
            ease: 'power2.out'
          }, animationStart)
      }

      // Animate panel middle
      if (panelMiddle) {
        scrollTimeline!.fromTo(panelMiddle,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: animationDuration,
            ease: 'power2.out'
          }, animationStart + (animationDuration * 0.3))
      }

      // Animate panel bottom
      if (panelBottom) {
        scrollTimeline!.fromTo(panelBottom,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: animationDuration,
            ease: 'power2.out'
          }, animationStart + (animationDuration * 0.5))
      }
    }

    // Fade out as panel exits to the left (except last panel)
    if (index < numPanels - 1) {
      const rawExitStart = (index + 0.6) / totalPanelScrolls
      const exitStart = delayRatio + (rawExitStart * scrollPhase)
      const exitDuration = (0.2 / totalPanelScrolls) * scrollPhase

      if (statValue) {
        scrollTimeline!.to(statValue, {
          opacity: 0,
          y: -30,
          duration: exitDuration,
          ease: 'power2.in'
        }, exitStart)
      }

      if (panelMiddle) {
        scrollTimeline!.to(panelMiddle, {
          opacity: 0,
          duration: exitDuration,
          ease: 'power2.in'
        }, exitStart)
      }

      if (panelBottom) {
        scrollTimeline!.to(panelBottom, {
          opacity: 0,
          duration: exitDuration,
          ease: 'power2.in'
        }, exitStart)
      }
    }
  })
}

function updateActiveDot(progress: number) {
  const numDots = panels.value.length
  activeIndex.value = Math.min(
    Math.floor(progress * numDots),
    numDots - 1
  )
}

function destroy() {
  if (scrollTimeline) {
    scrollTimeline.kill()
    scrollTimeline = null
  }

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Reset elements
  if (panelsRef.value) {
    gsap.set(panelsRef.value, { clearProps: 'all' })
  }

  if (progressRef.value) {
    gsap.set(progressRef.value, { clearProps: 'all' })
  }

  if (scrollLabelRef.value) {
    gsap.set(scrollLabelRef.value, { clearProps: 'all' })
  }
}
</script>

<style lang="scss" scoped>
// NOTE: Do NOT use `contain: layout` on this component - it uses ScrollTrigger pinning

.horizontal-scroll {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background-color: $color-background;
  z-index: 40;

  // Wrapper (viewport for horizontal scroll)
  &__wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  // Panels Container (scrolls horizontally)
  &__panels {
    position: relative;
    display: flex;
    height: 100%;
    will-change: transform;
  }

  // Timeline (spans all panels horizontally)
  &__timeline {
    position: absolute;
    top: 50%;
    left: 0;
    width: 400vw; // 4 panels
    height: 1rem;
    transform: translateY(-50%);
    z-index: 5;
    pointer-events: none;
  }

  &__timeline-line {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: $color-border;
    transform: translateY(-50%);
  }

  &__timeline-progress {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: $color-accent;
    transform: translateY(-50%) scaleX(0);
    transform-origin: left center;
  }

  &__timeline-dot {
    position: absolute;
    top: 50%;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: $color-border;
    transform: translate(-50%, -50%);
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    z-index: 2;
    pointer-events: auto;

    &--active {
      background-color: $color-accent;
      box-shadow: 0 0 0.5rem rgba($color-accent, 0.5);
    }
  }

  // Individual Panel
  &__panel {
    position: relative;
    flex-shrink: 0;
    width: 100vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: $spacing-2xl;
    box-sizing: border-box;

    @include desktop {
      padding: $spacing-lg;
    }

    @include tablet {
      padding: $spacing-md;
      height: 100%;
      justify-content: space-between;
    }
  }

  // Panel Top (Title + Scroll Label)
  &__panel-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $spacing-2xl;
    padding-bottom: $spacing-2xl;

    @include desktop {
      gap: $spacing-lg;
      padding-bottom: $spacing-lg;
    }
  }

  // Title (top left)
  &__title {
    font-family: var(--font-family);
    font-size: 2.125rem;
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: $color-primary;
    margin: 0;
    max-width: 36.5rem;

    @include desktop {
      font-size: 1.75rem;
      max-width: 25rem;
    }

    @include tablet {
      font-size: 1.5rem;
      max-width: 100%;
    }
  }

  // Scroll Label (top right)
  &__scroll-label {
    font-size: $font-size-sm;
    font-weight: 400;
    line-height: 1.3;
    text-transform: capitalize;
    color: $color-primary;
    margin: 0;
    flex-shrink: 0;
  }

  // Panel Middle (Tag + Description, below timeline)
  &__panel-middle {
    display: flex;
    align-items: flex-start;
    gap: $spacing-2xl;
    padding-top: calc(50vh - 2.5rem);
    flex: 1;

    @include desktop {
      flex-direction: column;
      gap: $spacing-md;
      padding-top: calc(50vh - 1.5rem);
    }

    @include tablet {
      flex-direction: column;
      gap: $spacing-sm;
      padding-top: $spacing-md;
      flex: 0 0 auto;
      margin-top: 0;
      order: 2;
    }
  }

  // Tag
  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  &__tag-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background-color: $color-primary;
    flex-shrink: 0;
  }

  &__tag-text {
    font-size: $font-size-sm;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    white-space: nowrap;
    text-transform: capitalize;
  }

  // Description
  &__description {
    font-family: var(--font-family);
    font-size: $font-size-md;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    opacity: 0.4;
    margin: 0;
    max-width: 17.25rem;

    @include desktop {
      max-width: 100%;
    }

    @include tablet {
      margin-bottom: $spacing-xl;
    }
  }

  // Panel Bottom (Large Stat Value)
  &__panel-bottom {
    position: absolute;
    bottom: $spacing-2xl;
    right: $spacing-2xl;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;

    @include desktop {
      bottom: $spacing-lg;
      right: $spacing-lg;
    }

    @include tablet {
      position: static;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      margin-top: calc(50vh - 6rem);
      width: 100%;
      order: 1;
    }
  }

  // Large Stat Value
  &__stat-value {
    font-family: var(--font-family);
    font-size: 17.5rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.06em;
    color: $color-primary;
    margin: 0;
    white-space: nowrap;
    text-align: right;

    @include desktop {
      font-size: 11.25rem;
    }

    @include tablet {
      font-size: 7.5rem;
      text-align: left;
    }
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  .horizontal-scroll {
    &__panels {
      will-change: auto;
    }

    &__timeline-dot {
      transition: none;
    }
  }
}
</style>
