<template>
  <section class="analytics-section">
    <!-- Left -->
    <div class="analytics-section__left">
      <div class="analytics-section__header">
        <div class="analytics-section__indicator">
          <span class="analytics-section__indicator-dot"></span>
          <span class="analytics-section__indicator-text">{{ $t('homepage.analytics.indicator') }}</span>
        </div>
        <h2 class="analytics-section__title"
          data-split-text
          data-split-type="lines"
          data-split-trigger="view"
          data-split-duration="1.2"
        >{{ $t('homepage.analytics.title') }}</h2>
      </div>
    </div>

    <!-- Right -->
    <div class="analytics-section__right">
      <div class="analytics-section__description-area">
        <p class="analytics-section__description">{{ $t('homepage.analytics.description') }}</p>
      </div>

      <!-- Dot Grid Graph -->
      <div class="analytics-section__graph" ref="graphRef">
        <div class="analytics-section__graph-inner">
          <!-- Y axis labels -->
          <div class="analytics-section__y-axis">
            <span v-for="label in yLabels" :key="label" class="analytics-section__y-label">{{ label }}</span>
          </div>

          <!-- Dot grid -->
          <div class="analytics-section__dot-grid">
            <div v-for="(col, ci) in dotGrid" :key="ci" class="analytics-section__dot-col">
              <span
                v-for="(dot, ri) in col"
                :key="ri"
                class="analytics-section__dot"
                :class="{ 'analytics-section__dot--active': dot }"
                :style="dot ? { transitionDelay: `${(ci * 0.03 + ri * 0.02)}s` } : {}"
              ></span>
            </div>
          </div>
        </div>

        <!-- X axis labels -->
        <div class="analytics-section__x-axis">
          <span v-for="n in 31" :key="n" class="analytics-section__x-label">{{ n }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const graphRef = ref<HTMLElement | null>(null)

const yLabels = ['120k', '90k', '60k', '30k', '0']
const rows = 20
const cols = 31

// Generate dot grid data — dots are active if they fall within the "impression curve"
// Simulates a rising curve from left to right
const dotGrid = computed(() => {
  const grid: boolean[][] = []
  for (let c = 0; c < cols; c++) {
    const col: boolean[] = []
    // Height curve: starts low, rises with some variation
    const progress = c / (cols - 1)
    const baseHeight = Math.pow(progress, 0.7) * rows * 0.85
    const variation = Math.sin(c * 0.8) * 1.5

    const activeRows = Math.round(baseHeight + variation)

    for (let r = 0; r < rows; r++) {
      // r=0 is top, r=rows-1 is bottom
      // Active dots fill from bottom up
      col.push(r >= (rows - activeRows))
    }
    grid.push(col)
  }
  return grid
})
</script>

<style scoped lang="scss">
.analytics-section {
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  background-color: $color-primary;
  color: #FAFAFA;
  width: 100%;
  z-index: 30;
  border-top: 1px solid #293331;

  @include mobile {
    grid-template-columns: 1fr;
  }

  &__left {
    grid-column: 1 / 7;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #293331;

    @include tablet {
      grid-column: 1 / -1;
      border-right: none;
      border-bottom: 1px solid #293331;
    }

    @include mobile {
      grid-column: 1 / -1;
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    padding: $spacing-2xl;

    @include mobile {
      padding: $spacing-lg $spacing-md;
    }
  }

  &__indicator {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__indicator-dot {
    width: 0.5rem;
    height: 0.5rem;
    background-color: #FAFAFA;
    border-radius: 50%;
  }

  &__indicator-text {
    font-size: $font-size-sm;
    color: rgba(#FAFAFA, 0.7);
    font-weight: 400;
  }

  &__title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 300;
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  &__right {
    grid-column: 7 / 13;
    display: flex;
    flex-direction: column;

    @include tablet {
      grid-column: 1 / -1;
    }

    @include mobile {
      grid-column: 1 / -1;
    }
  }

  &__description-area {
    border-bottom: 1px solid #293331;
    padding: $spacing-2xl;

    @include mobile {
      padding: $spacing-lg $spacing-md;
    }
  }

  &__description {
    font-size: $font-size-lg;
    line-height: 1.6;
    color: rgba(#FAFAFA, 0.7);
    font-weight: 300;
    max-width: 24rem;
    margin: 0;
  }

  // ─── Dot Grid Graph ─────────────────────────────────────

  &__graph {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: $spacing-2xl;

    @include mobile {
      padding: $spacing-lg $spacing-md;
    }
  }

  &__graph-inner {
    display: flex;
    gap: $spacing-md;
    flex: 1;
  }

  &__y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px 0;
    flex-shrink: 0;
  }

  &__y-label {
    font-size: 0.625rem;
    color: rgba(#FAFAFA, 0.3);
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  &__dot-grid {
    display: flex;
    gap: 2px;
    flex: 1;
    align-items: stretch;
  }

  &__dot-col {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    justify-content: space-between;
  }

  &__dot {
    width: 100%;
    aspect-ratio: 1;
    max-width: 10px;
    max-height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(#FAFAFA, 0.15);
    background-color: transparent;
    transition: background-color 0.4s ease, border-color 0.4s ease;

    &--active {
      background-color: #00ff88;
      border-color: #00ff88;
      box-shadow: 0 0 4px rgba(#00ff88, 0.3);
    }
  }

  &__x-axis {
    display: flex;
    justify-content: space-between;
    padding-top: $spacing-sm;
    padding-left: calc($spacing-md + 30px); // offset for y-axis width
  }

  &__x-label {
    font-size: 0.625rem;
    color: rgba(#FAFAFA, 0.3);
    font-weight: 400;
    text-align: center;
    flex: 1;
    font-variant-numeric: tabular-nums;
  }
}
</style>
