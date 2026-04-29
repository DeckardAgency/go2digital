<template>
  <section class="custom-solutions">
    <div class="custom-solutions__indicator">
      <span class="custom-solutions__indicator-dot"></span>
      <span :class="['custom-solutions__indicator-text', typoClass('indicator')]">
        {{ customSolution?.indicator ?? $t('homepage.customSolutions.indicator') }}
      </span>
    </div>

    <header class="custom-solutions__header">
      <h2
        :class="['custom-solutions__title', typoClass('title')]"
      >
        {{ customSolution?.title ?? $t('homepage.customSolutions.title') }}
      </h2>
    </header>

    <div class="custom-solutions__content">
      <div class="custom-solutions__block custom-solutions__block--left">
        <p :class="['custom-solutions__block-text', typoClass('blockText')]">
          {{ customSolution?.block1 ?? $t('homepage.customSolutions.block1') }}
        </p>
      </div>

      <div class="custom-solutions__block custom-solutions__block--right">
        <p :class="['custom-solutions__block-text', typoClass('blockText')]">
          {{ customSolution?.block2 ?? $t('homepage.customSolutions.block2') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageCustomSolution } from '~/types/api'

const { data: customSolution } = useApi<HomepageCustomSolution>('/api/singletons/homepage-custom-solution', { lazy: true, server: false })

const DEFAULT_PRESETS = {
  indicator: 'eyebrow',
  title: 'section-title',
  blockText: 'body-lg',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = (customSolution.value as { typographyMap?: Record<string, string> } | null)?.typographyMap
  return `typo-${map?.[key] || DEFAULT_PRESETS[key]}`
}
</script>

<style lang="scss" scoped>
// ==========================================================================
// Custom Solutions Section
// Two-column text layout with indicator and title
// ==========================================================================

// Component-specific variables
// --------------------------------------------------------------------------
$solutions-bg: #ffffff;
$solutions-text-color: $color-primary;
$solutions-muted-color: rgba($color-primary, 0.6);
$solutions-title-indent: 55%;
$solutions-title-indent-desktop: 40%;
$solutions-padding-top: 6rem;
$solutions-padding-bottom: 7.5rem;
$solutions-content-margin-top: 5rem;
$solutions-dot-size: 6px;

.custom-solutions {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $spacing-2xl;
  padding: $solutions-padding-top $spacing-2xl $solutions-padding-bottom;
  width: 100%;
  position: relative;
  background-color: $solutions-bg;
  z-index: $z-sticky + 10;

  @include tablet {
    padding: $spacing-2xl $spacing-md;
    gap: $spacing-md;
  }

  // ==========================================================================
  // Element: Indicator
  // ==========================================================================
  &__indicator {
    grid-column: 1 / 4;
    grid-row: 1;
    @include flex-start;
    align-items: flex-start;

    @include tablet {
      grid-column: 1 / 13;
      margin-bottom: $spacing-sm;
    }
  }

  &__indicator-dot {
    width: $solutions-dot-size;
    height: $solutions-dot-size;
    background-color: $solutions-text-color;
    border-radius: $radius-full;
    margin-top: 0.35rem;
    margin-right: $spacing-sm;
    flex-shrink: 0;
  }

  &__indicator-text {
    color: $solutions-text-color;
  }

  // ==========================================================================
  // Element: Header
  // ==========================================================================
  &__header {
    grid-column: 4 / 13;
    grid-row: 1;

    @include tablet {
      grid-column: 1 / 13;
      grid-row: 2;
    }
  }

  // ==========================================================================
  // Element: Title
  // First line indented via data-split-indent, rest flows normally
  // ==========================================================================
  &__title {
    color: $solutions-text-color;
    margin: 0;

    @include tablet {
      line-height: 1.3;
    }
  }

  // ==========================================================================
  // Element: Content
  // ==========================================================================
  &__content {
    grid-column: 1 / 13;
    grid-row: 2;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: $spacing-2xl;
    margin-top: $solutions-content-margin-top;

    @include tablet {
      grid-row: 3;
      margin-top: $spacing-xl;
      gap: $spacing-md;
    }
  }

  // ==========================================================================
  // Element: Block
  // ==========================================================================
  &__block {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    // ------------------------------------------
    // Modifier: Left block
    // ------------------------------------------
    &--left {
      grid-column: 4 / 7;

      @include tablet {
        grid-column: 1 / 13;
      }
    }

    // ------------------------------------------
    // Modifier: Right block
    // ------------------------------------------
    &--right {
      grid-column: 7 / 10;

      @include tablet {
        grid-column: 1 / 13;
      }
    }
  }

  &__block-text {
    color: $solutions-muted-color;
    margin: 0;
  }
}
</style>
