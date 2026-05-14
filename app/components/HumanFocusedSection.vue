<template>
  <section class="human-focused">
    <div class="human-focused__indicator">
      <span class="human-focused__indicator-dot"></span>
      <span :class="['human-focused__indicator-text', typoClass('indicator')]">{{ humanFocused?.indicator ?? $t('homepage.humanFocused.indicator') }}</span>
    </div>
    <header class="human-focused__header">
      <h2
        :class="['human-focused__title', typoClass('title')]"
      >{{ humanFocused?.title ?? $t('homepage.humanFocused.title') }}</h2>
    </header>
    <div class="human-focused__content">
      <div class="human-focused__block human-focused__block--left">
        <h3 :class="['human-focused__block-heading', typoClass('blockHeading')]">{{ humanFocused?.blockLeft ?? $t('homepage.humanFocused.blockLeft') }}</h3>
      </div>
      <div class="human-focused__block human-focused__block--right">
        <p :class="['human-focused__block-text', typoClass('blockText')]">{{ humanFocused?.blockRight ?? $t('homepage.humanFocused.blockRight') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageHumanFocused } from '~/types/api'

const { data: humanFocused } = useApi<HomepageHumanFocused>('/api/singletons/homepage-human-focused', { lazy: true, server: false })

const DEFAULT_PRESETS = {
  indicator: 'eyebrow',
  title: 'section-title',
  blockHeading: 'block-heading',
  blockText: 'body-lg',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = (humanFocused.value as { typographyMap?: Record<string, string> } | null)?.typographyMap
  return `typo-${map?.[key] || DEFAULT_PRESETS[key]}`
}
</script>

<style scoped lang="scss">
.human-focused {
  contain: layout paint;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $spacing-2xl;
  padding: 6rem $spacing-2xl 7.5rem;
  width: 100%;
  position: relative;
  background-color: #FAFAFA;
  z-index: 30;

  @include tablet {
    padding: $spacing-2xl $spacing-md;
    gap: $spacing-md;
  }

  &__indicator {
    grid-column: 1 / 4;
    grid-row: 1;
    display: flex;
    align-items: flex-start;

    @include tablet {
      grid-column: 1 / 13;
      margin-bottom: $spacing-sm;
    }
  }

  &__indicator-dot {
    width: 6px;
    height: 6px;
    background-color: $color-primary;
    border-radius: $radius-full;
    margin-top: 0.35rem;
    margin-right: $spacing-sm;
    flex-shrink: 0;
  }

  &__indicator-text {
    color: $color-primary;
  }

  &__header {
    grid-column: 4 / 13;
    grid-row: 1;

    @include tablet {
      grid-column: 1 / 13;
      grid-row: 2;
    }
  }

  &__title {
    color: $color-primary;
    margin: 0;
    text-indent: 20rem;

    @include desktop { text-indent: 12rem; }
    @include tablet { line-height: 1.3; text-indent: 6rem; }
    @include mobile { text-indent: 0; }
  }

  &__content {
    grid-column: 1 / 13;
    grid-row: 2;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: $spacing-2xl;
    margin-top: 5rem;

    @include tablet {
      grid-row: 3;
      margin-top: $spacing-xl;
      gap: $spacing-md;
    }
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    &--left {
      grid-column: 4 / 7;
      @include tablet { grid-column: 1 / 13; }
    }

    &--right {
      grid-column: 8 / 11;
      @include tablet { grid-column: 1 / 13; }
    }
  }

  &__block-heading {
    color: $color-primary;
    margin: 0;
  }

  &__block-text {
    color: rgba($color-primary, 0.6);
    margin: 0;
  }
}
</style>
