<template>
  <section class="possibilities" ref="sectionRef">
    <!-- Top bar -->
    <div class="possibilities__header">
      <div class="possibilities__label">
        <span class="possibilities__label-dot"></span>
        <span class="possibilities__label-text">{{ label }}</span>
      </div>
      <p class="possibilities__subtitle">{{ subtitle }}</p>
    </div>

    <!-- Main content: 3-column layout -->
    <div class="possibilities__content">
      <!-- Left: Counter -->
      <div class="possibilities__counter" ref="counterRef">
        ({{ counterDisplay }})
      </div>

      <!-- Center: Vertical item list -->
      <div class="possibilities__list">
        <p
          v-for="(item, index) in items"
          :key="index"
          class="possibilities__item"
          :class="{ 'possibilities__item--active': index === activeIndex }"
          :ref="el => itemRefs[index] = el as HTMLElement"
        >
          {{ item.title }}
        </p>
      </div>

      <!-- Right: Description -->
      <div class="possibilities__description" ref="descriptionRef">
        <p>{{ displayedDescription }}</p>
      </div>
    </div>

    <!-- Bottom separator -->
    <div class="possibilities__separator"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HomepagePossibility } from '~/types/api'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

const { data: possibilitiesData } = useApi<HomepagePossibility[]>('/api/homepage_possibilities', { lazy: true, server: false })

const label = computed(() => t('homepage.possibilities.label'))
const subtitle = computed(() => t('homepage.possibilities.subtitle'))

const items = computed(() => {
  if (possibilitiesData.value && possibilitiesData.value.length > 0) {
    return possibilitiesData.value.map(p => ({
      title: p.title ?? '',
      description: p.description ?? '',
    }))
  }
  return []
})

// Reactive state
const activeIndex = ref(0)
const displayedDescription = ref('')
const counterDisplay = computed(() => String(activeIndex.value + 1).padStart(2, '0'))

// Template refs
const sectionRef = ref<HTMLElement | null>(null)
const counterRef = ref<HTMLElement | null>(null)
const descriptionRef = ref<HTMLElement | null>(null)
const itemRefs = ref<(HTMLElement | null)[]>([])

let scrollTriggerInstance: ScrollTrigger | null = null
const prefersReducedMotion = ref(false)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// Wait for API data to arrive, then initialize animation
watch(items, async (newItems) => {
  if (newItems.length === 0) return

  // Tear down previous instance if data reloads (e.g. locale change)
  destroy()

  displayedDescription.value = newItems[0]?.description ?? ''
  activeIndex.value = 0

  await nextTick()
  requestAnimationFrame(() => {
    createAnimation()
  })
}, { immediate: true })

onUnmounted(() => {
  destroy()
})

function createAnimation() {
  if (!sectionRef.value) return

  const totalItems = items.value.length
  if (totalItems === 0) return

  const isMobile = window.innerWidth < 768
  const scrollDistance = totalItems * (isMobile ? 60 : 80)

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top top',
    end: () => `+=${scrollDistance}vh`,
    pin: true,
    pinSpacing: true,
    scrub: isMobile ? 0.3 : 0.8,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const newIndex = Math.min(
        Math.floor(self.progress * totalItems),
        totalItems - 1
      )
      if (newIndex !== activeIndex.value) {
        activeIndex.value = newIndex
        animateTransition(newIndex)
      }
    }
  })

  // Set initial states — first item active, rest muted
  itemRefs.value.forEach((el, i) => {
    if (!el) return
    gsap.set(el, { opacity: i === 0 ? 1 : 0.15 })
  })
}

function animateTransition(newIndex: number) {
  if (prefersReducedMotion.value) {
    // Just update text directly, CSS handles the rest via --active class
    displayedDescription.value = items.value[newIndex]?.description ?? ''
    return
  }

  // Animate all items: active gets full opacity, rest muted
  itemRefs.value.forEach((el, i) => {
    if (!el) return
    gsap.to(el, {
      opacity: i === newIndex ? 1 : 0.15,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: true,
    })
  })

  // Animate description: fade out → update text → fade in
  if (descriptionRef.value) {
    gsap.killTweensOf(descriptionRef.value)
    gsap.to(descriptionRef.value, {
      opacity: 0,
      y: 8,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        displayedDescription.value = items.value[newIndex]?.description ?? ''
        gsap.to(descriptionRef.value!, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    })
  }

  // Animate counter
  if (counterRef.value) {
    gsap.fromTo(counterRef.value,
      { opacity: 0.5, y: 4 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', overwrite: true }
    )
  }
}

function destroy() {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  itemRefs.value.forEach(el => {
    if (el) gsap.set(el, { clearProps: 'all' })
  })
  if (descriptionRef.value) gsap.set(descriptionRef.value, { clearProps: 'all' })
  if (counterRef.value) gsap.set(counterRef.value, { clearProps: 'all' })
  itemRefs.value = []
}
</script>

<style lang="scss" scoped>
// NOTE: Do NOT use `contain: layout` here — it breaks ScrollTrigger pinning

.possibilities {
  position: relative;
  width: 100%;
  height: 100dvh;
  background-color: $color-surface;
  display: flex;
  flex-direction: column;
  padding: $spacing-2xl;
  box-sizing: border-box;
  z-index: 40;

  @include desktop {
    padding: $spacing-lg;
  }

  @include tablet {
    padding: $spacing-md;
  }

  // ── Header ──
  &__header {
    @include flex-between;
    align-items: flex-start;
    padding-bottom: $spacing-xl;
    border-top: 1px solid $color-border;
    padding-top: $spacing-lg;
  }

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__label-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background-color: $color-primary;
    flex-shrink: 0;
  }

  &__label-text {
    font-size: $font-size-sm;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
  }

  &__subtitle {
    font-size: $font-size-sm;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    margin: 0;
  }

  // ── Main Content ──
  &__content {
    flex: 1;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: $spacing-2xl;
    align-items: center;

    @include tablet {
      grid-template-columns: 1fr;
      gap: $spacing-md;
      align-items: flex-start;
    }
  }

  // ── Counter ──
  &__counter {
    font-family: var(--font-family);
    font-size: $font-size-lg;
    font-weight: 400;
    line-height: 1;
    color: $color-primary;
    align-self: center;

    @include tablet {
      display: none;
    }
  }

  // ── List ──
  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;

    @include tablet {
      gap: 0;
    }
  }

  &__item {
    font-family: var(--font-family);
    font-size: clamp(1.5rem, 2.8vw, 2.25rem);
    font-weight: 400;
    line-height: 1.35;
    color: $color-primary;
    opacity: 0.15;
    margin: 0;
    cursor: default;

    &--active {
      font-weight: 500;
      opacity: 1;
    }

    @include tablet {
      font-size: clamp(1.125rem, 4vw, 1.5rem);
    }
  }

  // ── Description ──
  &__description {
    max-width: 16rem;
    align-self: center;

    p {
      font-family: var(--font-family);
      font-size: $font-size-sm;
      font-weight: 400;
      line-height: 1.5;
      color: $color-primary;
      opacity: 0.6;
      margin: 0;
    }

    @include tablet {
      max-width: 100%;
    }
  }

  // ── Separator ──
  &__separator {
    width: 100%;
    height: 1px;
    background-color: $color-border;
    margin-top: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .possibilities__item {
    transition: opacity 0.1s ease, font-weight 0.1s ease;
  }
}
</style>
