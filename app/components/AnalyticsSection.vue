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
          data-split-text
          data-split-type="lines"
          data-split-trigger="view"
          data-split-duration="1.2"
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
                :style="dot ? { '--dot-color': activeColor } : {}"
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
import { ref, computed, nextTick, onMounted } from 'vue'
import { gsap } from 'gsap'

const { data: analytics } = useApi<any>('/api/singletons/homepage-analytics', { lazy: true, server: false })

const graphRef = ref<HTMLElement | null>(null)
const dotGridRef = ref<HTMLElement | null>(null)
const tabsRef = ref<HTMLElement | null>(null)
const sliderRef = ref<HTMLElement | null>(null)
const tabEls = ref<HTMLElement[]>([])

const rows = 20
const cols = 31

interface Tab {
  id: string
  label: string
  color: string
  yLabels: string[]
  curve: (c: number) => number
}

const tabs: Tab[] = [
  {
    id: 'impressions',
    label: 'Impresije',
    color: '#00ff88',
    yLabels: ['120k', '90k', '60k', '30k', '0'],
    curve: (c) => {
      const p = c / (cols - 1)
      return Math.pow(p, 0.7) * rows * 0.85 + Math.sin(c * 0.8) * 1.5
    },
  },
  {
    id: 'reach',
    label: 'Doseg',
    color: '#00ff88',
    yLabels: ['50k', '37.5k', '25k', '12.5k', '0'],
    curve: (c) => {
      const p = c / (cols - 1)
      return Math.pow(p, 0.5) * rows * 0.7 + Math.cos(c * 0.6) * 2
    },
  },
  {
    id: 'engagement',
    label: 'Interakcije',
    color: '#00ff88',
    yLabels: ['10k', '7.5k', '5k', '2.5k', '0'],
    curve: (c) => {
      const p = c / (cols - 1)
      return (Math.sin(p * Math.PI) * rows * 0.6) + Math.sin(c * 1.2) * 1.5 + rows * 0.15
    },
  },
]

const activeTab = ref('impressions')

const activeTabData = computed(() => tabs.find(t => t.id === activeTab.value)!)
const activeColor = computed(() => activeTabData.value.color)
const activeYLabels = computed(() => activeTabData.value.yLabels)

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

const currentGrid = ref(generateGrid(tabs[0]))
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

onMounted(() => {
  nextTick(() => moveSlider(0))
})

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
    padding: $spacing-lg $spacing-2xl 0;
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
    padding: $spacing-lg $spacing-2xl $spacing-2xl;
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
    gap: 1px;
    flex: 1;
    align-items: stretch;
  }

  &__dot-col {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
    justify-content: space-between;
  }

  &__dot {
    width: 100%;
    aspect-ratio: 1;
    max-width: 7px;
    max-height: 7px;
    border-radius: 50%;
    border: 1px solid rgba(#FAFAFA, 0.1);
    background-color: transparent;

    &--active {
      background-color: var(--dot-color, #00ff88);
      border-color: var(--dot-color, #00ff88);
      box-shadow: 0 0 3px color-mix(in srgb, var(--dot-color, #00ff88) 40%, transparent);
    }
  }

  &__x-axis {
    display: flex;
    justify-content: space-between;
    padding-top: $spacing-xs;
    padding-left: calc($spacing-sm + 30px);
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
