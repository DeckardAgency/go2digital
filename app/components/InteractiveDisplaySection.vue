<template>
  <section class="interactive-display" ref="sectionRef">
    <div class="interactive-display__hero">
      <div class="interactive-display__container">
        <!-- Header -->
        <div class="interactive-display__header">
          <h2
            class="interactive-display__title"
            data-split-text
            data-split-type="lines"
            data-split-trigger="view"
            data-split-duration="1.2"
          >{{ $t('homepage.interactiveDisplay.title') }}</h2>
          <span class="interactive-display__number" aria-hidden="true">2</span>
          <div class="interactive-display__badge">
            <span class="interactive-display__badge-dot" aria-hidden="true"></span>
            <span class="interactive-display__badge-text">{{ $t('homepage.interactiveDisplay.badge') }}</span>
          </div>
        </div>

        <!-- Animated Display Panels -->
        <div class="interactive-display__visual">
          <div class="interactive-display__panels" ref="panelsRef">
            <div class="interactive-display__panel" ref="panel1Ref">
              <div class="interactive-display__panel-inner"></div>
            </div>
            <div class="interactive-display__panel" ref="panel2Ref">
              <div class="interactive-display__panel-inner"></div>
            </div>
          </div>
        </div>

        <!-- Specifications -->
        <div class="interactive-display__specs">
          <h3 class="interactive-display__specs-title">{{ $t('homepage.interactiveDisplay.specsTitle') }}</h3>
          <dl class="interactive-display__specs-list">
            <div
              v-for="spec in specs"
              :key="spec.label"
              class="interactive-display__spec-item"
            >
              <dt class="interactive-display__spec-label">{{ spec.label }}</dt>
              <dd class="interactive-display__spec-value">{{ spec.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const { tm, rt } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const panelsRef = ref<HTMLElement | null>(null)
const panel1Ref = ref<HTMLElement | null>(null)
const panel2Ref = ref<HTMLElement | null>(null)

let timeline: gsap.core.Timeline | null = null
const prefersReducedMotion = ref(false)

const specs = computed(() => {
  const raw = tm('homepage.interactiveDisplay.specs')
  if (Array.isArray(raw)) {
    return raw.map((s: any) => ({
      label: rt(s.label),
      value: rt(s.value)
    }))
  }
  return []
})

// #3: nextTick + rAF for DOM readiness
onMounted(async () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await nextTick()
  requestAnimationFrame(() => {
    if (!panel1Ref.value || !panel2Ref.value) return

    const skewAngle = -26.565
    const p1 = panel1Ref.value
    const p2 = panel2Ref.value

    gsap.set([p1, p2], { transformOrigin: 'center center' })

    // State 1: Flat stacked isometric
    gsap.set(p1, { rotation: 30, skewX: skewAngle, x: 0, y: 20, opacity: 1, zIndex: 1 })
    gsap.set(p2, { rotation: 30, skewX: skewAngle, x: 0, y: -20, opacity: 1, zIndex: 2 })

    // #1: If reduced motion, show static isometric state and skip animation
    if (prefersReducedMotion.value) return

    timeline = gsap.timeline({
      repeat: -1,
      paused: true, // start paused, IntersectionObserver will play when visible
      defaults: { duration: 1.2, ease: 'power3.inOut' }
    })

    // State 1 → 2: Separate vertically
    timeline
      .to(p1, { y: 100 }, 'separate')
      .to(p2, { y: -100 }, 'separate')
    timeline.to({}, { duration: 1 })

    // State 2 → 3: Rotate to vertical (book open)
    timeline
      .to(p1, { rotation: -30, skewX: skewAngle, x: -35, y: 0 }, 'vertical')
      .to(p2, { rotation: -30, skewX: skewAngle, x: 35, y: 0 }, 'vertical')
    timeline.to({}, { duration: 1 })

    // State 3 → 4: Merge
    timeline
      .to(p1, { x: 0, y: 0, opacity: 0, duration: 1 }, 'merge')
      .to(p2, { x: 0, y: 0, duration: 1 }, 'merge')
    timeline.to({}, { duration: 1 })

    // State 4 → 1: Reset
    timeline
      .to(p1, { rotation: 30, skewX: skewAngle, x: 0, y: 20, opacity: 1, duration: 1.2 }, 'reset')
      .to(p2, { rotation: 30, skewX: skewAngle, x: 0, y: -20, duration: 1.2 }, 'reset')
    timeline.to({}, { duration: 1 })

    // Pause/resume when off-screen to save CPU/GPU
    if (sectionRef.value) {
      visibilityObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) timeline?.play()
        else timeline?.pause()
      }, { threshold: 0 })
      visibilityObserver.observe(sectionRef.value)
    }
  })
})

let visibilityObserver: IntersectionObserver | null = null

onUnmounted(() => {
  visibilityObserver?.disconnect()
  visibilityObserver = null

  if (timeline) { timeline.kill(); timeline = null }

  // #2: Clear GSAP inline styles on panel elements
  ;[panel1Ref, panel2Ref].forEach(r => {
    if (r.value) gsap.set(r.value, { clearProps: 'all' })
  })
})
</script>

<style scoped lang="scss">
// Component-specific variable
$display-bg: #FAFAFA;

.interactive-display {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  min-height: 100dvh;
  width: 100%;
  position: relative;
  background-color: $display-bg;
  z-index: 30;
  border-top: 1px solid $color-border;
  border-bottom: 1px solid $color-border;

  &__hero {
    grid-column: 1 / -1;
    min-height: 100dvh;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
  }

  &__container {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding: $spacing-2xl $spacing-2xl 10rem;
    @include tablet { padding: $spacing-lg $spacing-lg 6rem; }
    @include mobile { padding: $spacing-md; }
  }

  // Header
  &__header {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding-top: $spacing-2xl;
    align-items: start;
  }

  &__title {
    grid-column: 1 / 7;
    font-size: 5.375rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.16rem;
    color: $color-primary;
    margin: 0;
    white-space: pre-line;
    @include desktop { font-size: 4rem; }
    @include mobile { grid-column: 1 / 11; order: 3; font-size: 3.125rem; }
  }

  &__number {
    grid-column: 8 / 9;
    font-size: 12.0625rem;
    font-weight: 400;
    line-height: 1;
    color: $color-primary;
    @include desktop { font-size: 8rem; }
    @include mobile { grid-column: 12 / 13; order: 2; font-size: 5.375rem; }
  }

  &__badge {
    grid-column: 10 / -1;
    justify-self: end;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding-top: $spacing-sm;
    @include mobile { grid-column: 1 / 10; order: 1; justify-self: start; }
  }

  &__badge-dot {
    width: 0.375rem;
    height: 0.375rem;
    background-color: $color-primary;
    border-radius: 50%;
  }

  &__badge-text {
    font-size: $font-size-sm;
    line-height: 0.9;
    color: $color-primary;
  }

  // 3D Display
  &__visual {
    grid-column: 1 / 7;
    height: 32.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin: 4rem 0;
    perspective: 1000px;
    @include tablet { grid-column: 1 / 8; height: 26rem; margin: $spacing-xl 0; }
    @include mobile { grid-column: 1 / 13; height: 20rem; margin: $spacing-xl 0; }
  }

  &__panels {
    position: relative;
    width: 300px;
    height: 400px;
    transform-style: preserve-3d;
    @include tablet { transform: scale(0.75); }
    @include mobile { transform: scale(0.55); }
  }

  &__panel {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -115px;
    margin-top: -172.5px;
    width: 230px;
    height: 345px;
    transform-style: preserve-3d;
    // will-change removed — GSAP handles GPU promotion dynamically
  }

  &__panel-inner {
    width: 100%;
    height: 100%;
    background-color: $display-bg;
    border: 1px solid $color-primary;
    border-radius: 4px;
  }

  // Specifications
  &__specs {
    grid-column: 8 / 13;
    padding-top: 18.75rem;
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
    @include tablet { padding-top: 10rem; }
    @include mobile { grid-column: 1 / 13; padding-top: $spacing-xl; }
  }

  &__specs-title {
    font-size: 2.125rem;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.04rem;
    color: $color-primary;
    margin: 0 0 $spacing-md;
  }

  &__specs-list {
    display: flex;
    flex-direction: column;
    margin: 0;
  }

  &__spec-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 0 0.625rem;
    border-bottom: 1px solid $color-border;
  }

  &__spec-label {
    font-size: $font-size-base;
    line-height: 1.3;
    color: $color-primary;
  }

  &__spec-value {
    font-size: $font-size-base;
    line-height: 1.3;
    color: $color-muted;
    margin: 0;
    text-align: right;
  }
}

// #1: Accessibility — reduced motion
@media (prefers-reduced-motion: reduce) {
  .interactive-display__panel {
    will-change: auto;
  }
}
</style>
