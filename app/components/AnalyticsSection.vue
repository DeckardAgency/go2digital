<template>
  <section class="analytics-section">
    <!-- Left -->
    <div class="analytics-section__left">
      <div class="analytics-section__header">
        <div class="analytics-section__indicator">
          <span class="analytics-section__indicator-dot"></span>
          <span class="analytics-section__indicator-text">{{ analytics?.indicator ?? $t('homepage.analytics.indicator') }}</span>
        </div>
        <h2 class="analytics-section__title"
        >{{ analytics?.title ?? $t('homepage.analytics.title') }}</h2>
      </div>
    </div>

    <!-- Right -->
    <div class="analytics-section__right">
      <div class="analytics-section__description-area">
        <p class="analytics-section__description">{{ analytics?.description ?? $t('homepage.analytics.description') }}</p>
      </div>

      <!-- Dot Grid Graph -->
      <div class="analytics-section__graph" ref="graphRef">

        <!-- Tabs -->
        <div class="analytics-section__tabs-wrapper">
          <div class="analytics-section__tabs" ref="tabsRef">
            <span class="analytics-section__tabs-slider" ref="sliderRef"></span>
            <button
              v-for="(tab, i) in tabs"
              :key="tab.id"
              :ref="el => tabEls[i] = el as HTMLElement"
              class="analytics-section__tab"
              :class="{ 'analytics-section__tab--active': activeTab === tab.id }"
              @click="switchTab(tab.id, i)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="analytics-section__graph-inner">
          <!-- Y axis labels -->
          <div class="analytics-section__y-axis">
            <span v-for="label in activeYLabels" :key="label" class="analytics-section__y-label">{{ label }}</span>
          </div>

          <!-- Dot grid -->
          <div class="analytics-section__dot-grid" ref="dotGridRef">
            <div v-for="(col, ci) in currentGrid" :key="ci" class="analytics-section__dot-col">
              <span
                v-for="(dot, ri) in col"
                :key="ri"
                class="analytics-section__dot"
                :class="{ 'analytics-section__dot--active': dot }"
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
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { gsap } from 'gsap'
import type { HomepageAnalyticsTab } from '~/types/api'

const { data: analytics } = useApi<any>('/api/singletons/homepage-analytics', { lazy: true, server: false })
const { data: apiTabs } = useApi<HomepageAnalyticsTab[]>('/api/homepage_analytics_tabs', { lazy: true, server: false })

const graphRef = ref<HTMLElement | null>(null)
const dotGridRef = ref<HTMLElement | null>(null)
const tabsRef = ref<HTMLElement | null>(null)
const sliderRef = ref<HTMLElement | null>(null)
const tabEls = ref<HTMLElement[]>([])

const rows = 16
const cols = 31

interface Tab {
  id: string
  label: string
  color: string
  yLabels: string[]
  curve: (c: number) => number
}

// Predefined curve functions mapped by type
const curveFunctions: Record<string, (c: number) => number> = {
  rising: (c) => {
    const p = c / (cols - 1)
    return Math.pow(p, 0.7) * rows * 0.85 + 1
  },
  gradual: (c) => {
    const p = c / (cols - 1)
    return Math.pow(p, 0.5) * rows * 0.75 + 1
  },
  bell: (c) => {
    const p = c / (cols - 1)
    return Math.exp(-Math.pow((p - 0.5) * 3, 2)) * rows * 0.75 + rows * 0.15
  },
}

const defaultTabs: Tab[] = [
  { id: 'impressions', label: 'Impresije', color: '#00ff88', yLabels: ['120k', '90k', '60k', '30k', '0'], curve: curveFunctions.rising },
  { id: 'reach', label: 'Doseg', color: '#00ff88', yLabels: ['50k', '37.5k', '25k', '12.5k', '0'], curve: curveFunctions.gradual },
  { id: 'engagement', label: 'Interakcije', color: '#00ff88', yLabels: ['10k', '7.5k', '5k', '2.5k', '0'], curve: curveFunctions.bell },
]

const tabs = computed<Tab[]>(() => {
  if (apiTabs.value && apiTabs.value.length > 0) {
    return apiTabs.value.map((t, i) => ({
      id: t.id,
      label: t.label ?? `Tab ${i + 1}`,
      color: '#00ff88',
      yLabels: Array.isArray(t.yLabels) && t.yLabels.length === 5 ? t.yLabels : ['100', '75', '50', '25', '0'],
      curve: curveFunctions[t.curveType] ?? curveFunctions.rising,
    }))
  }
  return defaultTabs
})

const activeTab = ref('')

const activeTabData = computed(() => {
  const found = tabs.value.find(t => t.id === activeTab.value)
  return found ?? tabs.value[0]
})
const activeColor = computed(() => activeTabData.value?.color ?? '#00ff88')
const activeYLabels = computed(() => activeTabData.value?.yLabels ?? [])

function generateGrid(tab: Tab): boolean[][] {
  const grid: boolean[][] = []
  for (let c = 0; c < cols; c++) {
    const col: boolean[] = []
    const activeRows = Math.max(0, Math.min(rows, Math.round(tab.curve(c))))
    for (let r = 0; r < rows; r++) {
      col.push(r >= (rows - activeRows))
    }
    grid.push(col)
  }
  return grid
}

const currentGrid = ref(generateGrid(defaultTabs[0]))
let activeIndex = 0

function moveSlider(index: number) {
  nextTick(() => {
    const el = tabEls.value[index]
    const slider = sliderRef.value
    if (!el || !slider || !tabsRef.value) return
    const containerRect = tabsRef.value.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    gsap.to(slider, {
      left: elRect.left - containerRect.left,
      width: elRect.width,
      duration: 0.4,
      ease: 'power3.inOut',
    })
  })
}

// Initialize active tab and grid when tabs data is available
watch(tabs, (newTabs) => {
  if (newTabs.length > 0) {
    activeTab.value = newTabs[0].id
    activeIndex = 0
    currentGrid.value = generateGrid(newTabs[0])
    nextTick(() => moveSlider(0))
  }
}, { immediate: true })

function switchTab(tabId: string, index: number) {
  if (activeTab.value === tabId) return
  activeTab.value = tabId
  activeIndex = index
  moveSlider(index)

  const newGrid = generateGrid(activeTabData.value)

  // Animate out current dots
  if (dotGridRef.value) {
    const activeDots = dotGridRef.value.querySelectorAll('.analytics-section__dot--active')
    gsap.to(activeDots, {
      scale: 0,
      opacity: 0,
      duration: 0.25,
      stagger: { each: 0.003, from: 'random' },
      ease: 'power2.in',
      onComplete: () => {
        // Clear all GSAP inline styles before Vue re-renders the grid
        if (dotGridRef.value) {
          const allDots = dotGridRef.value.querySelectorAll('.analytics-section__dot')
          allDots.forEach(dot => gsap.set(dot, { clearProps: 'all' }))
        }
        currentGrid.value = newGrid
        nextTick(() => {
          if (!dotGridRef.value) return
          const newDots = dotGridRef.value.querySelectorAll('.analytics-section__dot--active')
          gsap.fromTo(newDots, {
            scale: 0,
            opacity: 0,
          }, {
            scale: 1,
            opacity: 1,
            duration: 0.35,
            stagger: { each: 0.003, from: 'random' },
            ease: 'back.out(1.5)',
          })
        })
      },
    })
  } else {
    currentGrid.value = newGrid
  }
}
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
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    padding: $spacing-2xl;
    @include mobile { padding: $spacing-lg $spacing-md; }
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

    @include tablet { grid-column: 1 / -1; }
  }

  &__description-area {
    border-bottom: 1px solid #293331;
    padding: $spacing-2xl;
    @include mobile { padding: $spacing-lg $spacing-md; }
  }

  &__description {
    font-size: $font-size-lg;
    line-height: 1.6;
    color: rgba(#FAFAFA, 0.7);
    font-weight: 300;
    max-width: 24rem;
    margin: 0;
  }

  // ─── Tabs ───────────────────────────────────────────────

  &__tabs-wrapper {
    padding: 0 0 $spacing-2xl 0;
    @include mobile { padding: $spacing-md $spacing-md 0; }
  }

  &__tabs {
    display: inline-flex;
    align-items: center;
    border: 1px solid #293331;
    border-radius: 100px;
    position: relative;
    padding: 4px;
  }

  &__tabs-slider {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 0;
    width: 0;
    background: #FAFAFA;
    border-radius: 100px;
    z-index: 1;
    pointer-events: none;
  }

  &__tab {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    padding: 0.5rem 1.25rem;
    font-size: $font-size-sm;
    font-family: inherit;
    color: rgba(#FAFAFA, 0.5);
    background: transparent;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    transition: color 0.3s ease;
    white-space: nowrap;

    &:hover {
      color: rgba(#FAFAFA, 0.8);
    }

    &--active {
      color: $color-primary;
    }
  }

  // ─── Dot Grid Graph ─────────────────────────────────────

  &__graph {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: $spacing-2xl;
    @include mobile { padding: $spacing-md; }
  }

  &__graph-inner {
    display: flex;
    gap: $spacing-sm;
    flex: 1;
  }

  &__y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2px 0;
    flex-shrink: 0;
    min-width: 30px;
  }

  &__y-label {
    font-size: 0.5625rem;
    color: rgba(#FAFAFA, 0.25);
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  &__dot-grid {
    display: flex;
    gap: 6px;
    flex: 1;
    align-items: stretch;

    @include mobile { gap: 3px; }
  }

  &__dot-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;

    @include mobile { gap: 3px; }
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgba(#FAFAFA, 0.12);
    flex-shrink: 0;

    @include mobile {
      width: 4px;
      height: 4px;
    }

    &--active {
      background-color: #00ff88;
    }
  }

  &__x-axis {
    display: flex;
    justify-content: space-between;
    padding-top: $spacing-sm;
    padding-left: calc($spacing-sm + 36px);
  }

  &__x-label {
    font-size: 0.5625rem;
    color: rgba(#FAFAFA, 0.25);
    font-weight: 400;
    text-align: center;
    flex: 1;
    font-variant-numeric: tabular-nums;
  }
}
</style>
