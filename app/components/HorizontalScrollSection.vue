<template>
  <section class="horizontal-scroll" ref="sectionRef" data-horizontal-scroll>
    <!-- Panels Container - This will scroll horizontally -->
    <div class="horizontal-scroll__wrapper" ref="wrapperRef" data-scroll-wrapper>

      <!-- Scroll label - positioned absolutely over first panel (#3: moved out of v-for) -->
      <p class="horizontal-scroll__scroll-label" ref="scrollLabelRef">
        {{ $t('homepage.horizontalScroll.scrollLabel') }}
      </p>

      <div class="horizontal-scroll__panels" ref="panelsRef" data-scroll-panels>

        <!-- Timeline - spans full width of all panels (#1: dynamic width) -->
        <div
          class="horizontal-scroll__timeline"
          ref="timelineRef"
          data-scroll-timeline
          :style="{ width: panels.length * 100 + 'vw' }"
        >
          <div class="horizontal-scroll__timeline-line"></div>
          <div class="horizontal-scroll__timeline-progress" ref="progressRef"></div>

          <!-- Timeline dots - positioned at center of each panel (#10: clickable) -->
          <div
            v-for="(panel, index) in panels"
            :key="`dot-${index}`"
            class="horizontal-scroll__timeline-dot"
            :class="{ 'horizontal-scroll__timeline-dot--active': index <= activeIndex }"
            :style="{ left: `${(index * 100) + 50}vw` }"
            @click="scrollToPanel(index)"
          ></div>
        </div>

        <!-- Panels -->
        <div
          v-for="(panel, index) in panels"
          :key="index"
          class="horizontal-scroll__panel"
          data-scroll-panel
        >
          <!-- Top Section - Title -->
          <div class="horizontal-scroll__panel-top">
            <h2 class="horizontal-scroll__title" :ref="el => titleRefs[index] = el as HTMLElement">
              {{ panel.title }}
            </h2>
          </div>

          <!-- Middle Section - Tag and Description below timeline -->
          <div class="horizontal-scroll__panel-middle" :ref="el => panelMiddleRefs[index] = el as HTMLElement">
            <div class="horizontal-scroll__tag">
              <span class="horizontal-scroll__tag-dot"></span>
              <span class="horizontal-scroll__tag-text">{{ panel.tag }}</span>
            </div>
            <p class="horizontal-scroll__description">
              {{ panel.description }}
            </p>
          </div>

          <!-- Bottom Section - Large Stat Value -->
          <div class="horizontal-scroll__panel-bottom" :ref="el => panelBottomRefs[index] = el as HTMLElement">
            <p class="horizontal-scroll__stat-value" :ref="el => statValueRefs[index] = el as HTMLElement">
              {{ panel.statValue }}
            </p>
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
import type { HomepagePanel } from '~/types/api'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()
const { scrollTo } = useLenis()

const { data: panelsData } = useApi<HomepagePanel[]>('/api/homepage_panels', { lazy: true, server: false })

// Panel data
const panels = computed(() => [
  {
    title: panelsData.value?.[0]?.title ?? t('homepage.horizontalScroll.panel1.title'),
    tag: panelsData.value?.[0]?.tag ?? t('homepage.horizontalScroll.panel1.tag'),
    description: panelsData.value?.[0]?.description ?? t('homepage.horizontalScroll.panel1.description'),
    statValue: panelsData.value?.[0]?.statValue ?? '2.5M'
  },
  {
    title: panelsData.value?.[1]?.title ?? t('homepage.horizontalScroll.panel2.title'),
    tag: panelsData.value?.[1]?.tag ?? t('homepage.horizontalScroll.panel2.tag'),
    description: panelsData.value?.[1]?.description ?? t('homepage.horizontalScroll.panel2.description'),
    statValue: panelsData.value?.[1]?.statValue ?? '460'
  },
  {
    title: panelsData.value?.[2]?.title ?? t('homepage.horizontalScroll.panel3.title'),
    tag: panelsData.value?.[2]?.tag ?? t('homepage.horizontalScroll.panel3.tag'),
    description: panelsData.value?.[2]?.description ?? t('homepage.horizontalScroll.panel3.description'),
    statValue: panelsData.value?.[2]?.statValue ?? '50'
  },
  {
    title: panelsData.value?.[3]?.title ?? t('homepage.horizontalScroll.panel4.title'),
    tag: panelsData.value?.[3]?.tag ?? t('homepage.horizontalScroll.panel4.tag'),
    description: panelsData.value?.[3]?.description ?? t('homepage.horizontalScroll.panel4.description'),
    statValue: panelsData.value?.[3]?.statValue ?? '28'
  }
])

// Template refs
const sectionRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const panelsRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const scrollLabelRef = ref<HTMLElement | null>(null)

// Panel element refs (#6: use ref() instead of reactive())
const titleRefs = ref<(HTMLElement | null)[]>([])
const panelMiddleRefs = ref<(HTMLElement | null)[]>([])
const panelBottomRefs = ref<(HTMLElement | null)[]>([])
const statValueRefs = ref<(HTMLElement | null)[]>([])

// Animation state (#4: start at -1 so no dots are active before scroll)
const activeIndex = ref(-1)
let scrollTimeline: gsap.core.Timeline | null = null
let scrollTriggerInstance: ScrollTrigger | null = null
const prefersReducedMotion = ref(false)

// #8: small delay to ensure preceding ScrollTrigger instances (e.g. HeroSection) are ready
onMounted(async () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await nextTick()
  // Extra frame to let other pinned ScrollTriggers finalize their measurements
  requestAnimationFrame(() => {
    createAnimation()
  })
})

onUnmounted(() => {
  destroy()
})

function createAnimation() {
  if (!sectionRef.value || !panelsRef.value) return

  const numPanels = panels.value.length
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const isMobile = viewportWidth < 768

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
      scrub: isMobile ? 0.3 : 0.8, // #9: faster scrub on mobile
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Calculate adjusted progress (excluding delay period)
        const adjustedProgress = Math.max(0, (self.progress - delayRatio) / (1 - delayRatio))

        // Direct style assignment instead of gsap.set() — avoids GSAP overhead on every frame
        if (progressRef.value) {
          progressRef.value.style.transform = `translateY(-50%) scaleX(${adjustedProgress})`
        }

        // Update active dot
        updateActiveDot(adjustedProgress)

        // Fade out scroll label
        if (scrollLabelRef.value) {
          scrollLabelRef.value.style.opacity = String(Math.max(0, 1 - (self.progress * 5)))
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

  // #5: if reduced motion, just make everything visible and skip element animations
  if (prefersReducedMotion.value) {
    panels.value.forEach((_, index) => {
      const title = titleRefs.value[index]
      const panelMiddle = panelMiddleRefs.value[index]
      const panelBottom = panelBottomRefs.value[index]
      const statValue = statValueRefs.value[index]
      if (title) gsap.set(title, { opacity: 1, y: 0 })
      if (panelMiddle) gsap.set(panelMiddle, { opacity: 1, y: 0 })
      if (panelBottom) gsap.set(panelBottom, { opacity: 1, y: 0 })
      if (statValue) gsap.set(statValue, { opacity: 1, y: 0 })
    })
    return
  }

  // Animate individual panel elements
  const scrollPhase = 1 - delayRatio
  const totalPanelScrolls = numPanels - 1

  panels.value.forEach((_, index) => {
    const title = titleRefs.value[index]
    const panelMiddle = panelMiddleRefs.value[index]
    const panelBottom = panelBottomRefs.value[index]
    const statValue = statValueRefs.value[index]

    if (index === 0) {
      // #2: First panel — scrub-linked fromTo tweens during delay period
      // so they properly reverse when scrolling back up
      if (title) gsap.set(title, { opacity: 0, y: 20 })
      if (panelMiddle) gsap.set(panelMiddle, { opacity: 0, y: 20 })
      if (panelBottom) gsap.set(panelBottom, { opacity: 0, y: 40 })
      if (statValue) gsap.set(statValue, { opacity: 0, y: 50 })

      const entranceDuration = delayRatio * 0.8
      const entranceStart = delayRatio * 0.1

      if (title) {
        scrollTimeline!.fromTo(title,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: entranceDuration, ease: 'power2.out' },
          entranceStart)
      }
      if (statValue) {
        scrollTimeline!.fromTo(statValue,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: entranceDuration, ease: 'power2.out' },
          entranceStart)
      }
      if (panelMiddle) {
        scrollTimeline!.fromTo(panelMiddle,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: entranceDuration, ease: 'power2.out' },
          entranceStart + (entranceDuration * 0.15))
      }
      if (panelBottom) {
        scrollTimeline!.fromTo(panelBottom,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: entranceDuration, ease: 'power2.out' },
          entranceStart + (entranceDuration * 0.25))
      }
    } else {
      // Set initial states for subsequent panels
      if (title) gsap.set(title, { opacity: 0, y: 20 })
      if (panelMiddle) gsap.set(panelMiddle, { opacity: 0, y: 20 })
      if (panelBottom) gsap.set(panelBottom, { opacity: 0, y: 40 })
      if (statValue) gsap.set(statValue, { opacity: 0, y: 50 })
    }

    // Calculate progress points for horizontal scroll
    // Clamp all positions + durations so they never exceed 1.0 (timeline overflow causes duplicate content)
    const rawAnimationStart = Math.max(0, (index - 0.3) / totalPanelScrolls)
    const animationStart = delayRatio + (rawAnimationStart * scrollPhase)
    const animationDuration = Math.min(
      (0.25 / totalPanelScrolls) * scrollPhase,
      1 - animationStart // never exceed timeline end
    )

    // Entrance animations for panels > 0
    if (index > 0) {
      // #11: Animate title on entrance
      if (title) {
        scrollTimeline!.fromTo(title,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: animationDuration, ease: 'power2.out' },
          animationStart)
      }

      if (statValue) {
        scrollTimeline!.fromTo(statValue,
          { opacity: 0, y: 80 },
          { opacity: 1, y: 0, duration: animationDuration, ease: 'power2.out' },
          animationStart)
      }

      const middleStart = Math.min(animationStart + (animationDuration * 0.3), 0.99)
      const middleDur = Math.min(animationDuration, 1 - middleStart)
      if (panelMiddle) {
        scrollTimeline!.fromTo(panelMiddle,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: middleDur, ease: 'power2.out' },
          middleStart)
      }

      const bottomStart = Math.min(animationStart + (animationDuration * 0.5), 0.99)
      const bottomDur = Math.min(animationDuration, 1 - bottomStart)
      if (panelBottom) {
        scrollTimeline!.fromTo(panelBottom,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: bottomDur, ease: 'power2.out' },
          bottomStart)
      }
    }

    // #11: Fade out as panel exits (including title crossfade)
    if (index < numPanels - 1) {
      const rawExitStart = (index + 0.6) / totalPanelScrolls
      const exitStart = Math.min(delayRatio + (rawExitStart * scrollPhase), 0.99)
      const exitDuration = Math.min(
        (0.2 / totalPanelScrolls) * scrollPhase,
        1 - exitStart
      )

      if (title) {
        scrollTimeline!.to(title, {
          opacity: 0,
          y: -15,
          duration: exitDuration,
          ease: 'power2.in'
        }, exitStart)
      }

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

// #4: no dots active when progress is 0
function updateActiveDot(progress: number) {
  if (progress <= 0) {
    activeIndex.value = -1
    return
  }
  const numDots = panels.value.length
  activeIndex.value = Math.min(
    Math.floor(progress * numDots),
    numDots - 1
  )
}

// #10: Click a dot to scroll to that panel
function scrollToPanel(index: number) {
  if (!scrollTriggerInstance) return
  const numPanels = panels.value.length
  const totalPanelScrolls = numPanels - 1
  if (totalPanelScrolls <= 0) return

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const scrollDistance = totalPanelScrolls * viewportWidth
  const delayDistance = viewportHeight * 0.5
  const totalScrollDistance = scrollDistance + delayDistance
  const delayRatio = delayDistance / totalScrollDistance

  // Target progress for this panel
  const panelProgress = index === 0
    ? delayRatio * 0.5
    : delayRatio + ((index / totalPanelScrolls) * (1 - delayRatio))

  const targetScroll = scrollTriggerInstance.start + (panelProgress * totalScrollDistance)

  scrollTo(targetScroll, { duration: 0.8 })
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

  // #7: Clear panel refs to release DOM references
  titleRefs.value = []
  panelMiddleRefs.value = []
  panelBottomRefs.value = []
  statValueRefs.value = []
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
    // will-change removed — GSAP handles GPU promotion via force3D
  }

  // Timeline (spans all panels horizontally) — width set via inline style (#1)
  &__timeline {
    position: absolute;
    top: 50%;
    left: 0;
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
    cursor: pointer; // #10: indicate clickable

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

  // Panel Top (Title)
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

  // Scroll Label (#3: positioned absolutely, outside v-for)
  &__scroll-label {
    position: absolute;
    top: $spacing-2xl;
    right: $spacing-2xl;
    font-size: $font-size-sm;
    font-weight: 400;
    line-height: 1.3;
    text-transform: capitalize;
    color: $color-primary;
    margin: 0;
    z-index: 10;

    @include desktop {
      top: $spacing-lg;
      right: $spacing-lg;
    }

    @include tablet {
      display: none;
    }
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

// Accessibility (#5: CSS part)
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
