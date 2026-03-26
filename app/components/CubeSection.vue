<template>
  <section class="cube-section">
    <div class="cube-section__hero">
      <div class="cube-section__container">
        <!-- Header -->
        <div class="cube-section__header">
          <h2 class="cube-section__title">{{ $t('homepage.cube.title') }}</h2>
          <span class="cube-section__number">1</span>
          <div class="cube-section__badge">
            <span class="cube-section__badge-dot"></span>
            <span class="cube-section__badge-text">{{ $t('homepage.cube.badge') }}</span>
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
          <h3 class="cube-section__specs-title">{{ $t('homepage.cube.specsTitle') }}</h3>
          <dl class="cube-section__specs-list">
            <div v-for="(spec, i) in specs" :key="i" class="cube-section__spec-item">
              <dt class="cube-section__spec-label">{{ spec.label }}</dt>
              <dd class="cube-section__spec-value">{{ spec.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>

  <!-- Cube Description -->
  <section class="interactive">
    <div class="interactive__indicator">
      <span class="interactive__indicator-dot"></span>
      <span class="interactive__indicator-text">{{ $t('homepage.cube.title') }}</span>
    </div>
    <header class="interactive__header">
      <h2 class="interactive__title">{{ $t('homepage.cube.description') }}</h2>
    </header>
  </section>

  <!-- Cube Features -->
  <FeatureSection
    v-for="(feature, i) in cubeFeatures"
    :key="`cube-${i}`"
    :icon="['Ⓐ', 'Ⓑ'][i]"
    :title="feature.title"
    :description="feature.description"
  />
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const { tm, rt } = useI18n()

const panelsRef = ref<HTMLElement | null>(null)
const cubePanel1Ref = ref<HTMLElement | null>(null)
const cubePanel2Ref = ref<HTMLElement | null>(null)
const cubePanel3Ref = ref<HTMLElement | null>(null)

let timeline: gsap.core.Timeline | null = null

const specs = computed(() => {
  const raw = tm('homepage.cube.specs')
  if (Array.isArray(raw)) {
    return raw.map((s: any) => ({
      label: rt(s.label),
      value: rt(s.value)
    }))
  }
  return []
})

const cubeFeatures = computed(() => {
  const raw = tm('homepage.cube.features')
  if (Array.isArray(raw)) {
    return raw.map((f: any) => ({
      title: rt(f.title),
      description: rt(f.description)
    }))
  }
  return []
})

onMounted(() => {
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

  timeline = gsap.timeline({
    repeat: -1,
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
})

onUnmounted(() => {
  if (timeline) { timeline.kill(); timeline = null }
})
</script>

<style scoped lang="scss">
.cube-section {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  min-height: 100dvh;
  width: 100%;
  background-color: #FAFAFA;
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
    padding: 2.5rem 2.5rem 10rem;
    @include mobile { padding: 1rem; }
  }

  &__header {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding-top: 2.5rem;
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
    @include mobile { grid-column: 1 / 11; order: 3; font-size: 3.125rem; }
  }

  &__number {
    grid-column: 8 / 9;
    font-size: 12.0625rem;
    font-weight: 400;
    line-height: 1;
    color: $color-primary;
    @include mobile { grid-column: 12 / 13; order: 2; font-size: 5.375rem; }
  }

  &__badge {
    grid-column: 10 / -1;
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding-top: 0.5rem;
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
    @include mobile { grid-column: 1 / 13; height: 20rem; margin: 2rem 0; }
  }

  &__panels {
    position: relative;
    width: 300px;
    height: 400px;
    transform-style: preserve-3d;
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
    will-change: transform;
  }

  &__panel-inner {
    width: 100%;
    height: 100%;
    background-color: #FAFAFA;
    border: 1px solid $color-primary;
    border-radius: 4px;
  }

  &__specs {
    grid-column: 8 / 13;
    padding-top: 18.75rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    @include mobile { grid-column: 1 / 13; padding-top: 2rem; }
  }

  &__specs-title {
    font-size: 2.125rem;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.04rem;
    color: $color-primary;
    margin: 0 0 1rem;
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

// Reuse interactive styles (unscoped)
</style>

<style lang="scss">
.cube-section + .interactive {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  padding: 6rem 4rem;
  width: 100%;
  background-color: #FAFAFA;
  z-index: 30;

  .interactive__indicator {
    grid-column: 1 / 5;
    display: flex;
    align-items: flex-start;
    &-dot { width: 0.5rem; height: 0.5rem; background-color: $color-primary; border-radius: 50%; margin-top: 0.1rem; margin-right: 0.5rem; flex-shrink: 0; }
    &-text { font-size: $font-size-sm; font-weight: 400; line-height: 0.9; color: $color-primary; text-transform: uppercase; }
  }

  .interactive__header {
    grid-column: 6 / 13;
    margin-bottom: 4rem;
  }

  .interactive__title {
    font-size: 3.125rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.0625rem;
    color: $color-primary;
    text-indent: 20rem;
    margin: 0;
  }
}
</style>
