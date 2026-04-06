<template>
  <section ref="sectionRef" class="cube-section">
    <div class="cube-section__hero">
      <div class="cube-section__container">
        <!-- Header -->
        <div class="cube-section__header">
          <h2
            class="cube-section__title"
            data-split-text
            data-split-type="lines"
            data-split-trigger="view"
            data-split-duration="1.2"
          >{{ cubeProduct?.title ?? $t('homepage.cube.title') }}</h2>
          <span class="cube-section__number" aria-hidden="true">1</span>
          <div class="cube-section__badge">
            <span class="cube-section__badge-dot" aria-hidden="true"></span>
            <span class="cube-section__badge-text">{{ cubeProduct?.badge ?? $t('homepage.cube.badge') }}</span>
          </div>
        </div>

        <!-- Animated Cube Panels -->
        <div class="cube-section__visual">
          <div class="cube-section__panels" ref="panelsRef">
            <div class="cube-section__panel" ref="cubePanel1Ref">
              <div class="cube-section__panel-inner"></div>
            </div>
            <div class="cube-section__panel" ref="cubePanel2Ref">
              <div class="cube-section__panel-inner"></div>
            </div>
            <div class="cube-section__panel" ref="cubePanel3Ref">
              <div class="cube-section__panel-inner"></div>
            </div>
          </div>
        </div>

        <!-- Specifications -->
        <div class="cube-section__specs">
          <h3 class="cube-section__specs-title">{{ cubeProduct?.specsTitle ?? $t('homepage.cube.specsTitle') }}</h3>
          <dl class="cube-section__specs-list">
            <div v-for="(spec, i) in specs" :key="spec.label || i" class="cube-section__spec-item">
              <dt class="cube-section__spec-label">{{ spec.label }}</dt>
              <dd class="cube-section__spec-value">{{ spec.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>

  <!-- Cube Description -->
  <section class="cube-description">
    <div class="cube-description__indicator">
      <span class="cube-description__indicator-dot" aria-hidden="true"></span>
      <span class="cube-description__indicator-text">{{ cubeProduct?.title ?? $t('homepage.cube.title') }}</span>
    </div>
    <header class="cube-description__header">
      <h2 class="cube-description__title">{{ cubeProduct?.description ?? $t('homepage.cube.description') }}</h2>
    </header>
  </section>

  <!-- Cube Features -->
  <FeatureSection
    v-for="(feature, i) in cubeFeatures"
    :key="feature.title || `cube-feature-${i}`"
    :icon="['Ⓐ', 'Ⓑ'][i] ?? ''"
    :title="feature.title"
    :description="feature.description"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import type { HomepageProduct } from '~/types/api'

const { tm, rt } = useI18n()

const { data: cubeProducts } = useApi<HomepageProduct[]>('/api/homepage_products?productType=cube', { lazy: true, server: false })
const cubeProduct = computed(() => cubeProducts.value?.[0] ?? null)

const sectionRef = ref<HTMLElement | null>(null)
const panelsRef = ref<HTMLElement | null>(null)
const cubePanel1Ref = ref<HTMLElement | null>(null)
const cubePanel2Ref = ref<HTMLElement | null>(null)
const cubePanel3Ref = ref<HTMLElement | null>(null)

let timeline: gsap.core.Timeline | null = null
const prefersReducedMotion = ref(false)

const specs = computed(() => {
  // Use API data if available
  if (cubeProduct.value?.specs && cubeProduct.value.specs.length > 0) {
    return cubeProduct.value.specs
  }
  // Fallback to i18n
  const raw = (tm as any)('homepage.cube.specs')
  if (Array.isArray(raw)) {
    return raw.map((s: any) => ({
      label: rt(s.label),
      value: rt(s.value)
    }))
  }
  return []
})

const cubeFeatures = computed(() => {
  // Use API data if available
  if (cubeProduct.value?.features && cubeProduct.value.features.length > 0) {
    return cubeProduct.value.features.map(f => ({
      title: f.title ?? '',
      description: f.description ?? ''
    }))
  }
  // Fallback to i18n
  const raw = (tm as any)('homepage.cube.features')
  if (Array.isArray(raw)) {
    return raw.map((f: any) => ({
      title: rt(f.title),
      description: rt(f.description)
    }))
  }
  return []
})

// #3: nextTick + rAF for DOM readiness
onMounted(async () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await nextTick()
  requestAnimationFrame(() => {
    const p1 = cubePanel1Ref.value
    const p2 = cubePanel2Ref.value
    const p3 = cubePanel3Ref.value
    if (!p1 || !p2 || !p3) return

    const skewAngle = -26.565

    gsap.set([p1, p2, p3], { transformOrigin: 'center center' })

    // State 1: Flat stacked isometric
    gsap.set(p1, { rotation: 30, skewX: skewAngle, x: 0, y: 30, opacity: 1, zIndex: 1 })
    gsap.set(p2, { rotation: 30, skewX: skewAngle, x: 0, y: 0, opacity: 1, zIndex: 2 })
    gsap.set(p3, { rotation: 30, skewX: skewAngle, x: 0, y: -30, opacity: 1, zIndex: 3 })

    // #1: If reduced motion, show static isometric state and skip animation
    if (prefersReducedMotion.value) return

    timeline = gsap.timeline({
      repeat: -1,
      paused: true, // start paused, IntersectionObserver will play when visible
      defaults: { duration: 1.2, ease: 'power3.inOut' }
    })

    // State 1 → 2: Separate
    timeline
      .to(p1, { y: 130 }, 'separate')
      .to(p2, { y: 0 }, 'separate')
      .to(p3, { y: -130 }, 'separate')
    timeline.to({}, { duration: 1 })

    // State 2 → 3: Unfold
    timeline
      .to(p1, { rotation: -30, skewX: skewAngle, skewY: 0, x: -50, y: 50 }, 'unfold')
      .to(p2, { rotation: -30, skewX: skewAngle, skewY: 0, x: 0, y: 0 }, 'unfold')
      .to(p3, { rotation: -30, skewX: skewAngle, skewY: 0, x: 50, y: -50 }, 'unfold')
    timeline.to({}, { duration: 1 })

    // State 3 → 4: Assemble cube
    timeline
      .to(p1, { rotation: 30, skewX: skewAngle, x: 0, y: 0, scaleX: 1, scaleY: 0.5 }, 'cube')
      .to(p2, { rotation: 30, skewX: skewAngle, x: -60, y: 0, scaleX: 0.5, scaleY: 1, skewY: 26.565 }, 'cube')
      .to(p3, { rotation: 30, skewX: skewAngle, x: 60, y: 0, scaleX: 0.5, scaleY: 1, skewY: -26.565 }, 'cube')
    timeline.to({}, { duration: 1 })

    // State 4 → 1: Reset
    timeline
      .to(p1, { rotation: 30, skewX: skewAngle, skewY: 0, x: 0, y: 30, scaleX: 1, scaleY: 1, opacity: 1, duration: 1.2 }, 'reset')
      .to(p2, { rotation: 30, skewX: skewAngle, skewY: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 1.2 }, 'reset')
      .to(p3, { rotation: 30, skewX: skewAngle, skewY: 0, x: 0, y: -30, scaleX: 1, scaleY: 1, duration: 1.2 }, 'reset')
    timeline.to({}, { duration: 1 })

    // Pause/resume when off-screen to save CPU/GPU
    if (sectionRef.value) {
      visibilityObserver = new IntersectionObserver((entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) timeline?.play()
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
  ;[cubePanel1Ref, cubePanel2Ref, cubePanel3Ref].forEach(r => {
    if (r.value) gsap.set(r.value, { clearProps: 'all' })
  })
})
</script>

<style scoped lang="scss">
// Component-specific variable
$cube-bg: #FAFAFA;

.cube-section {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  min-height: 100dvh;
  width: 100%;
  background-color: $cube-bg;
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

  &__badge-dot { width: 0.375rem; height: 0.375rem; background-color: $color-primary; border-radius: 50%; }
  &__badge-text { font-size: $font-size-sm; line-height: 0.9; color: $color-primary; }

  &__visual {
    grid-column: 1 / 7;
    height: 32.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin: 4rem 0;
    perspective: 1000px;
    @include tablet { grid-column: 1 / 8; height: 26rem; margin: 2rem 0; }
    @include mobile { grid-column: 1 / 13; height: 20rem; margin: 2rem 0; }
  }

  &__panels {
    position: relative;
    width: 300px;
    height: 400px;
    transform-style: preserve-3d;
    @include tablet { transform: scale(0.8); }
    @include mobile { transform: scale(0.65); }
  }

  &__panel {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -100px;
    margin-top: -100px;
    width: 200px;
    height: 200px;
    transform-style: preserve-3d;
    // will-change removed — GSAP handles GPU promotion dynamically
  }

  &__panel-inner {
    width: 100%;
    height: 100%;
    background-color: $cube-bg;
    border: 1px solid $color-primary;
    border-radius: 4px;
  }

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

  &__specs-list { display: flex; flex-direction: column; margin: 0; }

  &__spec-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 0 0.625rem;
    border-bottom: 1px solid $color-border;
  }

  &__spec-label { font-size: $font-size-base; line-height: 1.3; color: $color-primary; }
  &__spec-value { font-size: $font-size-base; line-height: 1.3; color: $color-muted; margin: 0; text-align: right; }
}

// #1: Accessibility — reduced motion
@media (prefers-reduced-motion: reduce) {
  .cube-section__panel {
    will-change: auto;
  }
}
</style>

<!-- #8: Scoped-safe description section styles (renamed from generic .interactive) -->
<style lang="scss">
.cube-description {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $spacing-xl;
  padding: 6rem 4rem;
  width: 100%;
  background-color: #FAFAFA;
  z-index: 30;

  @include tablet { padding: 4rem $spacing-lg; }
  @include mobile { padding: $spacing-2xl $spacing-md; }

  &__indicator {
    grid-column: 1 / 5;
    display: flex;
    align-items: flex-start;

    @include mobile { grid-column: 1 / -1; }

    &-dot { width: 0.5rem; height: 0.5rem; background-color: $color-primary; border-radius: 50%; margin-top: 0.1rem; margin-right: 0.5rem; flex-shrink: 0; }
    &-text { font-size: $font-size-sm; font-weight: 400; line-height: 0.9; color: $color-primary; text-transform: uppercase; }
  }

  &__header {
    grid-column: 6 / 13;
    margin-bottom: 4rem;

    @include tablet { grid-column: 4 / 13; margin-bottom: $spacing-xl; }
    @include mobile { grid-column: 1 / -1; margin-bottom: $spacing-lg; }
  }

  &__title {
    font-size: 3.125rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.0625rem;
    color: $color-primary;
    text-indent: 20rem;
    margin: 0;

    @include desktop { font-size: 2.5rem; text-indent: 12rem; }
    @include tablet { font-size: 2rem; text-indent: 6rem; }
    @include mobile { font-size: 1.5rem; text-indent: 0; }
  }
}
</style>
