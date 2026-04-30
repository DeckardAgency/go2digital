<template>
  <section class="tracking-section">
    <div class="tracking-section__header">
      <h2
        :class="['tracking-section__title', typoClass('title')]"
        data-split-text
        data-split-type="lines"
        data-split-duration="0.6"
        data-split-stagger="0.1"
      >{{ trackingTitle }}</h2>
      <div class="tracking-section__cta">
        <BtnAnimated
          :text="trackingButtonText"
          :to="trackingButtonUrl"
          :external="trackingButtonUrl.startsWith('http')"
          variant="on-dark"
        />
      </div>
    </div>
    <!-- #8: Semantic ordered list instead of plain divs -->
    <ol class="tracking-section__list">
      <li
        v-for="(feature, i) in features"
        :key="feature.title || i"
        class="tracking-section__item"
      >
        <span :class="['tracking-section__number', typoClass('number')]" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3 :class="['tracking-section__feature', typoClass('feature')]">{{ feature.title }}</h3>
        <p :class="['tracking-section__description', typoClass('description')]">{{ feature.description }}</p>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { HomepageTrackingFeature } from '~/types/api'

const { tm, rt, t, locale } = useI18n()

const { data: trackingFeatures } = useApi<HomepageTrackingFeature[]>('/api/homepage_tracking_features', { lazy: true, server: false })

const { blockMaps } = useTypography()

const DEFAULT_PRESETS = {
  title: 'tracking-title',
  number: 'number-lg',
  feature: 'feature-title',
  description: 'body',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = blockMaps.value['tracking'] || {}
  return `typo-${map[key] || DEFAULT_PRESETS[key]}`
}

// Fetch settings for title, buttonText, buttonUrl
const { data: settingsData } = useApi<any[]>('/api/settings?group=homepage', { lazy: true, server: false })

function getSetting(key: string): string {
  const settings = Array.isArray(settingsData.value) ? settingsData.value : (settingsData.value as any)?.['hydra:member'] ?? []
  const s = settings.find((s: any) => s.key === key)
  if (!s?.value) return ''
  if (s.value[locale.value]) return s.value[locale.value]
  if (s.value.value !== undefined) return s.value.value
  return ''
}

const trackingTitle = computed(() => getSetting('homepage.tracking.title') || t('homepage.tracking.title'))
const trackingButtonText = computed(() => getSetting('homepage.tracking.buttonText') || t('homepage.tracking.buttonText'))
const trackingButtonUrl = computed(() => getSetting('homepage.tracking.buttonUrl') || '/kontakt')

const features = computed(() => {
  // Use API data if available
  if (trackingFeatures.value && trackingFeatures.value.length > 0) {
    return trackingFeatures.value.map(f => ({
      title: f.title ?? '',
      description: f.description ?? ''
    }))
  }
  // Fallback to i18n
  const raw = (tm as any)('homepage.tracking.features')
  if (Array.isArray(raw)) {
    return raw.map((f: any) => ({
      title: rt(f.title),
      description: rt(f.description)
    }))
  }
  return []
})
</script>

<style scoped lang="scss">
// Component-specific variables
$tracking-text-color: #FAFAFA;
$tracking-border-color: #293331;

.tracking-section {
  contain: layout paint;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  min-height: 100svh;
  width: 100%;
  background-color: $color-primary;
  position: relative;
  border-top: 1px solid $tracking-border-color;
  z-index: 30;
  @include mobile { padding: 0; }

  &__header {
    grid-column: 1 / 13;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding: 15.625rem $spacing-2xl $spacing-2xl;
    align-items: center;
    @include tablet { padding: 10rem $spacing-lg $spacing-xl; }
    @include mobile { padding: 5rem $spacing-md $spacing-xl; }
  }

  &__title {
    grid-column: 1 / 6;
    color: $tracking-text-color;
    margin: 0;
    @include tablet { grid-column: 1 / 8; }
    @include mobile { grid-column: 1 / -1; margin-bottom: $spacing-lg; }
  }

  &__cta {
    grid-column: 11 / 13;
    display: flex;
    justify-content: flex-end;
    @include mobile { grid-column: 1 / -1; justify-content: flex-start; }
  }


  // #8: Reset list styles for semantic <ol>
  &__list {
    grid-column: 1 / -1;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__item {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding: $spacing-2xl $spacing-2xl 12rem;
    border-top: 1px solid $tracking-border-color;
    align-items: start;
    @include tablet { padding: $spacing-xl $spacing-lg 8rem; }
    @include mobile { padding: $spacing-lg $spacing-md 5rem; gap: $spacing-sm; }
  }

  // #10: Increased opacity from 0.4 to 0.6 for WCAG AA contrast
  &__number {
    grid-column: 1 / 2;
    color: rgba($tracking-text-color, 0.6);
    @include mobile { grid-column: 1 / 3; }
  }

  &__feature {
    grid-column: 2 / 6;
    color: $tracking-text-color;
    margin: 0;
    @include mobile { grid-column: 3 / -1; }
  }

  // #7: Increased opacity from 0.4 to 0.6 for WCAG AA contrast
  &__description {
    grid-column: 6 / 10;
    color: rgba($tracking-text-color, 0.6);
    margin: 0;
    @include mobile { grid-column: 3 / -1; }
  }
}

</style>
