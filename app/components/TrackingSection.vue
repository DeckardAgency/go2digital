<template>
  <section class="tracking-section">
    <div class="tracking-section__header">
      <h2
        class="tracking-section__title"
        data-split-text
        data-split-type="lines"
        data-split-trigger="view"
        data-split-duration="1.2"
      >{{ $t('homepage.tracking.title') }}</h2>
      <div class="tracking-section__cta">
        <NuxtLink to="/kontakt" class="tracking-section__button">
          <span class="tracking-section__button-text">{{ $t('homepage.tracking.buttonText') }}</span>
          <span class="tracking-section__button-icon" aria-hidden="true">
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
              <path d="M8.5 0.5L13.5 5.5L8.5 10.5M13 5.5H0.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </NuxtLink>
      </div>
    </div>
    <!-- #8: Semantic ordered list instead of plain divs -->
    <ol class="tracking-section__list">
      <li
        v-for="(feature, i) in features"
        :key="feature.title"
        class="tracking-section__item"
      >
        <span class="tracking-section__number" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3 class="tracking-section__feature">{{ feature.title }}</h3>
        <p class="tracking-section__description">{{ feature.description }}</p>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { HomepageTrackingFeature } from '~/types/api'

const { tm, rt } = useI18n()

const { data: trackingFeatures } = useApi<HomepageTrackingFeature[]>('/api/homepage_tracking_features', { lazy: true, server: false })

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
  min-height: 100dvh;
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
    font-size: clamp(1.5rem, 3vw, 3.125rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.0625rem;
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

  // #3: Responsive button width, #2: focus-visible state
  &__button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: $tracking-text-color;
    border-radius: $radius-full;
    padding: 2px;
    max-width: 17.5rem;
    width: 100%;
    height: 3rem;
    text-decoration: none;
    transition: transform 0.3s ease;

    &:hover { transform: translateY(-2px); }

    &:focus-visible {
      outline: 2px solid $color-accent;
      outline-offset: 2px;
    }
  }

  &__button-text {
    font-size: $font-size-base;
    color: $color-primary;
    padding-left: $spacing-md;
  }

  &__button-icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background-color: $color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $tracking-text-color;
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
    padding: $spacing-lg $spacing-2xl;
    border-top: 1px solid $tracking-border-color;
    align-items: start;
    @include tablet { padding: $spacing-lg; }
    @include mobile { padding: $spacing-md; gap: $spacing-sm; }
  }

  // #10: Increased opacity from 0.4 to 0.6 for WCAG AA contrast
  &__number {
    grid-column: 1 / 2;
    font-size: $font-size-sm;
    color: rgba($tracking-text-color, 0.6);
    padding-top: 0.25rem;
    @include mobile { grid-column: 1 / 3; }
  }

  &__feature {
    grid-column: 2 / 6;
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
    color: $tracking-text-color;
    margin: 0;
    @include mobile { grid-column: 3 / -1; }
  }

  // #7: Increased opacity from 0.4 to 0.6 for WCAG AA contrast
  &__description {
    grid-column: 6 / 10;
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
    color: rgba($tracking-text-color, 0.6);
    margin: 0;
    @include mobile { grid-column: 3 / -1; }
  }
}

// #1: Accessibility — reduced motion
@media (prefers-reduced-motion: reduce) {
  .tracking-section__button {
    transition: none;
  }
}
</style>
